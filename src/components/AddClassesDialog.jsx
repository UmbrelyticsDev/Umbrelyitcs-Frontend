import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Divider,
} from '@material-ui/core'
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import toolAxios from 'src/_apis_/toolAxios'

// Shared "Add Classes" dialog — create one or more classes and place all of
// their weekly sessions in one action. Used by both the timetable page and the
// dashboard empty-state CTA, so the create flow lives in exactly one place.
//
// Props:
//   open            — dialog visibility
//   onClose()       — close handler (also called automatically once a batch is
//                     added cleanly — the dialog closes whenever entries are made)
//   onAdded()       — called after a successful create (parent refetches)
//   showExisting    — render the "Your Classes" list below the form
//   classes         — existing classes (for the list)
//   onEditClass(c)  — open the edit flow for a class (from the list)
//   onDeleteClass(id)

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const EMPTY_SESSION = {
  day_of_week: 'Monday',
  start_time: '',
  session_type: 'double',
  end_time: '',
  room: '',
}

const EMPTY_CLASS_ROW = {
  class_name: '',
  subject: '',
  grade_level: '',
  student_count: '',
  proficiency: '',
  standard_session_length: 60,
  sessions: [{ ...EMPTY_SESSION }],
}

const toMinutes = (t) => {
  if (!t) return 0
  const [h, m] = String(t).slice(0, 5).split(':').map(Number)
  return h * 60 + m
}
const fmtTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(
    mins % 60,
  ).padStart(2, '0')}`
const multiplierFor = (t) => (t === 'double' ? 2 : t === 'triple' ? 3 : 1)

// Quick-added classes start unconfirmed; the chip clears once reviewed via Edit.
const classNeedsDetails = (c) => c && !Number(c.details_confirmed)

export default function AddClassesDialog({
  open,
  onClose,
  onAdded,
  showExisting = false,
  classes = [],
  onEditClass,
  onDeleteClass,
}) {
  const { enqueueSnackbar } = useSnackbar()
  const [classRows, setClassRows] = useState([{ ...EMPTY_CLASS_ROW }])
  const [creatingRows, setCreatingRows] = useState(false)
  const [rowsResult, setRowsResult] = useState(null)

  // Fresh form each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setClassRows([{ ...EMPTY_CLASS_ROW, sessions: [{ ...EMPTY_SESSION }] }])
      setRowsResult(null)
    }
  }, [open])

  // ---- Class-row helpers ----
  const updateRow = (i, field, value) =>
    setClassRows((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    )

  const addRow = () =>
    setClassRows((rows) => [
      ...rows,
      { ...EMPTY_CLASS_ROW, sessions: [{ ...EMPTY_SESSION }] },
    ])

  const removeRow = (i) =>
    setClassRows((rows) =>
      rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows,
    )

  // ---- Per-session helpers ----
  const updateSession = (i, si, field, value) =>
    setClassRows((rows) =>
      rows.map((r, idx) =>
        idx === i
          ? {
              ...r,
              sessions: r.sessions.map((s, sIdx) =>
                // Editing a session clears its last conflict message.
                sIdx === si ? { ...s, [field]: value, error: undefined } : s,
              ),
            }
          : r,
      ),
    )

  const addSession = (i) =>
    setClassRows((rows) =>
      rows.map((r, idx) => {
        if (idx !== i) return r
        // Prefill the new session from the last one entered, so repeated
        // sessions (same length, room, time — usually just a different day)
        // don't have to be re-typed. Drop any stale conflict message.
        const last = r.sessions[r.sessions.length - 1]
        const seed = last ? { ...last, error: undefined } : { ...EMPTY_SESSION }
        return { ...r, sessions: [...r.sessions, seed] }
      }),
    )

  const removeSession = (i, si) =>
    setClassRows((rows) =>
      rows.map((r, idx) =>
        idx === i && r.sessions.length > 1
          ? { ...r, sessions: r.sessions.filter((_, sIdx) => sIdx !== si) }
          : r,
      ),
    )

  const sessionEndTime = (row, session) => {
    if (!session.start_time) return ''
    if (session.session_type === 'custom') return session.end_time
    const len = parseInt(row.standard_session_length, 10) || 60
    return fmtTime(
      toMinutes(session.start_time) + multiplierFor(session.session_type) * len,
    )
  }

  const sessionValid = (row, session) =>
    !!session.start_time &&
    (session.session_type !== 'custom' ||
      (session.end_time &&
        toMinutes(session.end_time) > toMinutes(session.start_time)))

  const rowValid = (row) =>
    row.class_name.trim() &&
    row.subject.trim() &&
    row.grade_level.trim() &&
    String(row.proficiency || '').trim() &&
    parseInt(row.student_count, 10) > 0 &&
    row.sessions.some((s) => sessionValid(row, s))

  const validRowCount = classRows.filter(rowValid).length

  // Do two time intervals overlap? (half-open: touching end-to-start is fine)
  const overlaps = (aS, aE, bS, bE) => aS < bE && bS < aE

  // Create each class and place all of its valid sessions — all or nothing.
  // Before creating anything we check every session for a time clash, both
  // against the teacher's existing timetable and against the other sessions in
  // this batch. If ANY session clashes, nothing is created or scheduled; the
  // offending sessions are flagged and the dialog stays open. Only when the
  // whole batch is clear do we create the classes and schedule the sessions,
  // then close the dialog.
  const createAndScheduleRows = async () => {
    const valid = classRows.filter(rowValid)
    if (valid.length === 0) {
      enqueueSnackbar(
        'Add at least one class with a name, subject, grade and start time.',
        { variant: 'warning' },
      )
      return
    }

    setCreatingRows(true)

    // 1) Flatten every valid session we're about to add, with its time window
    //    and a reference back to its row/session position in the form.
    const newSessions = []
    classRows.forEach((row, i) => {
      if (!rowValid(row)) return
      row.sessions.forEach((s, si) => {
        if (!sessionValid(row, s)) return
        newSessions.push({
          i,
          si,
          label: row.class_name.trim(),
          day: s.day_of_week,
          startMin: toMinutes(s.start_time),
          endMin: toMinutes(sessionEndTime(row, s)),
        })
      })
    })

    // 2) Load the current timetable so we can detect clashes BEFORE creating
    //    anything. If we can't read it, abort rather than risk a partial add.
    let existing = []
    try {
      const ttRes = await toolAxios.get('/api/timetables')
      existing = (ttRes.data?.data || []).map((e) => ({
        day: e.day_of_week,
        startMin: toMinutes(e.start_time),
        endMin: toMinutes(e.end_time),
        name: e.class_name,
      }))
    } catch (e) {
      setCreatingRows(false)
      enqueueSnackbar(
        'Could not check the timetable for clashes. Please try again.',
        { variant: 'error' },
      )
      return
    }

    // 3) Flag every session that clashes — with an existing entry, or with
    //    another session in this same batch.
    const clashErrors = {} // `${i}:${si}` -> message
    newSessions.forEach((ns) => {
      const hitExisting = existing.find(
        (ex) =>
          ex.day === ns.day &&
          overlaps(ns.startMin, ns.endMin, ex.startMin, ex.endMin),
      )
      if (hitExisting) {
        clashErrors[`${ns.i}:${ns.si}`] = `clashes with ${
          hitExisting.name || 'an existing class'
        } already on ${ns.day} ${fmtTime(hitExisting.startMin)}–${fmtTime(
          hitExisting.endMin,
        )}`
        return
      }
      const hitBatch = newSessions.find(
        (other) =>
          other !== ns &&
          other.day === ns.day &&
          overlaps(ns.startMin, ns.endMin, other.startMin, other.endMin),
      )
      if (hitBatch) {
        clashErrors[`${ns.i}:${ns.si}`] = `overlaps ${
          hitBatch.label || 'another class'
        } you're adding on ${ns.day} ${fmtTime(hitBatch.startMin)}–${fmtTime(
          hitBatch.endMin,
        )}`
      }
    })

    // 4) Any clash → block the ENTIRE batch. Nothing is created; the form stays
    //    open with the offending sessions flagged so they can be fixed.
    if (Object.keys(clashErrors).length > 0) {
      setClassRows((rows) =>
        rows.map((r, i) => ({
          ...r,
          sessions: r.sessions.map((s, si) => ({
            ...s,
            error: clashErrors[`${i}:${si}`] || undefined,
          })),
        })),
      )
      setRowsResult([
        {
          status: 'blocked',
          msg: `Nothing was added — ${
            Object.keys(clashErrors).length
          } session(s) clash. Resolve the highlighted conflict(s) and try again.`,
        },
      ])
      setCreatingRows(false)
      enqueueSnackbar(
        'Clash detected — nothing was added. Fix the conflicts and try again.',
        { variant: 'error' },
      )
      return
    }

    // 5) All clear → create each class and schedule all of its sessions.
    const results = []
    let hadError = false
    for (const row of classRows) {
      if (!rowValid(row)) continue
      const label = row.class_name.trim()
      try {
        const len = parseInt(row.standard_session_length, 10) || 60
        const firstType =
          row.sessions.find((s) => sessionValid(row, s))?.session_type ||
          'double'
        const createRes = await toolAxios.post('/api/timetables/classes', {
          class_name: row.class_name.trim(),
          subject: row.subject.trim(),
          grade_level: row.grade_level.trim(),
          student_count: parseInt(row.student_count, 10) || 25,
          proficiency: row.proficiency.trim(),
          standard_session_length: len,
          session_type: firstType === 'custom' ? 'double' : firstType,
          academic_year: new Date().getFullYear(),
          term: 'Term 1',
          class_time: '9:00 AM',
        })
        const classId = createRes.data?.data?.id
        if (!classId) throw new Error('class could not be created')

        let scheduled = 0
        for (const s of row.sessions) {
          if (!sessionValid(row, s)) continue
          await toolAxios.post('/api/timetables', {
            class_id: classId,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: sessionEndTime(row, s),
            notes: '',
            session_type: s.session_type,
            room: s.room || '',
          })
          scheduled++
        }
        results.push({ label, status: 'ok', count: scheduled })
      } catch (err) {
        hadError = true
        results.push({
          label,
          status: 'failed',
          msg: err.response?.data?.error || 'could not be created',
        })
      }
    }

    setCreatingRows(false)
    setRowsResult(results)

    const okCount = results.filter((r) => r.status === 'ok').length
    if (okCount > 0) {
      enqueueSnackbar(`Added ${okCount} class(es) to your timetable!`, {
        variant: 'success',
      })
    }

    if (onAdded) await onAdded()

    // Let the sidebar re-check its onboarding lock without a page reload.
    window.dispatchEvent(new Event('umbrelytics:classes-changed'))

    // Entries were made → close the dialog (and reset for next time).
    if (!hadError && okCount > 0) {
      setClassRows([{ ...EMPTY_CLASS_ROW, sessions: [{ ...EMPTY_SESSION }] }])
      if (onClose) onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          Add Classes
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: showExisting ? 3 : 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            Create one or more classes and place all of their weekly sessions at
            once. Use “+ Add session” for a class that meets more than once a
            week.
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mb: 2, display: 'block' }}
          >
            Fill in each class’s details (including proficiency and class size),
            then set each session’s day, time and room below.
          </Typography>

          <Stack spacing={2}>
            {classRows.map((row, i) => (
              <Paper
                key={i}
                variant="outlined"
                sx={{ p: 2, bgcolor: 'grey.50' }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                    }}
                  >
                    Class {i + 1}
                  </Typography>
                  {classRows.length > 1 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeRow(i)}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>

                {row.created_id && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'warning.main', display: 'block', mb: 1 }}
                  >
                    Class created — fix the conflicting session(s) below and
                    click “Create &amp; Schedule” again.
                  </Typography>
                )}

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Class name"
                      value={row.class_name}
                      disabled={!!row.created_id}
                      onChange={(e) =>
                        updateRow(i, 'class_name', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Subject"
                      value={row.subject}
                      disabled={!!row.created_id}
                      onChange={(e) => updateRow(i, 'subject', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Grade"
                      value={row.grade_level}
                      disabled={!!row.created_id}
                      onChange={(e) =>
                        updateRow(i, 'grade_level', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      label="Proficiency"
                      placeholder="e.g. mixed levels, mostly beginners, advanced"
                      value={row.proficiency}
                      disabled={!!row.created_id}
                      onChange={(e) =>
                        updateRow(i, 'proficiency', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      required
                      size="small"
                      type="number"
                      label="Class size"
                      value={row.student_count}
                      disabled={!!row.created_id}
                      onChange={(e) =>
                        updateRow(
                          i,
                          'student_count',
                          e.target.value === ''
                            ? ''
                            : parseInt(e.target.value, 10),
                        )
                      }
                      inputProps={{ min: 1, max: 200 }}
                    />
                  </Grid>
                </Grid>

                {/* Class-level session length */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    Session length (min). This goes for all sessions of this
                    class.
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={row.standard_session_length}
                    disabled={!!row.created_id}
                    onChange={(e) =>
                      updateRow(
                        i,
                        'standard_session_length',
                        parseInt(e.target.value, 10) || '',
                      )
                    }
                    inputProps={{ min: 10, max: 120 }}
                    sx={{ width: 110 }}
                  />
                </Box>

                {/* Sessions — one or more per week for this class */}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    mt: 2,
                    mb: 0.5,
                  }}
                >
                  Sessions
                </Typography>
                <Stack spacing={1.5}>
                  {row.sessions.map((session, si) => (
                    <Box key={si}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={6} sm={2}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Day"
                            value={session.day_of_week}
                            onChange={(e) =>
                              updateSession(
                                i,
                                si,
                                'day_of_week',
                                e.target.value,
                              )
                            }
                          >
                            {DAYS.map((day) => (
                              <MenuItem key={day} value={day}>
                                {day}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            label="Start"
                            InputLabelProps={{ shrink: true }}
                            value={session.start_time}
                            onChange={(e) =>
                              updateSession(i, si, 'start_time', e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Duration"
                            value={session.session_type}
                            onChange={(e) =>
                              updateSession(
                                i,
                                si,
                                'session_type',
                                e.target.value,
                              )
                            }
                          >
                            <MenuItem value="single">Single</MenuItem>
                            <MenuItem value="double">Double</MenuItem>
                            <MenuItem value="triple">Triple</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          {session.session_type === 'custom' ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="time"
                              label="End"
                              InputLabelProps={{ shrink: true }}
                              value={session.end_time}
                              onChange={(e) =>
                                updateSession(i, si, 'end_time', e.target.value)
                              }
                            />
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label="End"
                              InputLabelProps={{ shrink: true }}
                              value={sessionEndTime(row, session)}
                              disabled
                            />
                          )}
                        </Grid>
                        <Grid item xs={10} sm={3}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Room"
                            placeholder="e.g., 2D"
                            value={session.room}
                            onChange={(e) =>
                              updateSession(i, si, 'room', e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                          {row.sessions.length > 1 && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeSession(i, si)}
                              title="Remove session"
                              aria-label="Remove session"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                      {session.error && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            pl: 1,
                            mt: 0.25,
                          }}
                        >
                          ⚠ {session.error}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>

                <Button
                  size="small"
                  onClick={() => addSession(i)}
                  sx={{ mt: 1 }}
                >
                  + Add session
                </Button>
              </Paper>
            ))}
          </Stack>

          <Button size="small" onClick={addRow} sx={{ mt: 1.5 }}>
            + Add another class
          </Button>

          {rowsResult && (
            <Box sx={{ mt: 1.5 }}>
              {rowsResult.map((r, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    display: 'block',
                    color:
                      r.status === 'ok'
                        ? 'success.main'
                        : r.status === 'class_only' || r.status === 'partial'
                        ? 'warning.main'
                        : 'error.main',
                  }}
                >
                  {r.status === 'ok'
                    ? `✓ ${r.label} created with ${r.count} session${
                        r.count === 1 ? '' : 's'
                      }`
                    : r.status === 'blocked'
                    ? `⚠ ${r.msg}`
                    : r.status === 'partial'
                    ? `⚠ ${r.label} — ${r.count}/${r.total} sessions placed (${r.msg})`
                    : r.status === 'class_only'
                    ? `⚠ ${r.label} — ${r.msg}`
                    : `✕ ${r.label} — ${r.msg}`}
                </Typography>
              ))}
            </Box>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button
              variant="contained"
              sx={{ color: '#fff' }}
              onClick={createAndScheduleRows}
              disabled={creatingRows || validRowCount === 0}
            >
              {creatingRows
                ? 'Creating...'
                : `Save${validRowCount ? ` ${validRowCount}` : ''}`}
            </Button>
          </Stack>
        </Box>

        {showExisting && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Your Classes
            </Typography>
            {classes.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.disabled', fontStyle: 'italic' }}
              >
                No classes yet. Create your first class above.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {classes.map((cls) => (
                  <Paper
                    key={cls.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {cls.class_name}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {cls.subject} • {cls.grade_level} • {cls.student_count}{' '}
                        students
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      {onEditClass && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditClass(cls)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onDeleteClass && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteClass(cls.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

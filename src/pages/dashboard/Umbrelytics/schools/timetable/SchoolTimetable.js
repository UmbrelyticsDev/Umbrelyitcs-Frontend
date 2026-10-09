import { useState, useEffect, useCallback } from 'react'
import { useSnackbar } from 'notistack'
import {
  Card,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@material-ui/core'
import { Delete, Add } from '@material-ui/icons'
import timetableApi from '../../../../../_apis_/timetableApi'
import * as XLSX from 'xlsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TERMS = ['Term 1', 'Term 2', 'Term 3']

export default function SchoolTimetable() {
  const { enqueueSnackbar } = useSnackbar()

  const [academicYear, setAcademicYear] = useState(
    String(new Date().getFullYear()),
  )
  const [term, setTerm] = useState('Term 1')

  const [periods, setPeriods] = useState([])
  const [classes, setClasses] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  // period add form
  const [periodForm, setPeriodForm] = useState({
    period_number: '',
    label: '',
    start_time: '',
    end_time: '',
    is_break: false,
  })

  // assign modal
  const [assign, setAssign] = useState({ open: false, day: '', period_id: '' })
  const [assignForm, setAssignForm] = useState({
    class_id: '',
    teacher_id: '',
    room: '',
  })

  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null) // { imported, skipped, details }

  const loadStatic = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        timetableApi.getPeriods(),
        timetableApi.getClasses(),
      ])
      setPeriods(p.data?.result || [])
      setClasses(c.data?.result || [])
    } catch (e) {
      console.error('TT loadStatic error →', e)
      enqueueSnackbar(e.error || 'Failed to load timetable data', {
        variant: 'error',
      })
    }
  }, [enqueueSnackbar])

  const loadEntries = useCallback(async () => {
    try {
      const res = await timetableApi.getTimetable(academicYear, term)
      setEntries(res.data?.result || [])
    } catch (e) {
      enqueueSnackbar(e.error || 'Failed to load timetable', {
        variant: 'error',
      })
    }
  }, [academicYear, term, enqueueSnackbar])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await loadStatic()
      await loadEntries()
      setLoading(false)
    })()
  }, [loadStatic, loadEntries])

  // ---- periods ----
  const handleAddPeriod = async () => {
    const { period_number, label, start_time, end_time, is_break } = periodForm
    if (!period_number || !label || !start_time || !end_time) {
      enqueueSnackbar('Period number, label, start and end time are required', {
        variant: 'warning',
      })
      return
    }
    try {
      await timetableApi.addPeriod({
        period_number: parseInt(period_number, 10),
        label,
        start_time,
        end_time,
        is_break,
      })
      setPeriodForm({
        period_number: '',
        label: '',
        start_time: '',
        end_time: '',
        is_break: false,
      })
      const p = await timetableApi.getPeriods()
      setPeriods(p.data?.result || [])
      enqueueSnackbar('Period added', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(e.error || 'Failed to add period', { variant: 'error' })
    }
  }

  const handleDeletePeriod = async (id) => {
    try {
      await timetableApi.deletePeriod(id)
      setPeriods((prev) => prev.filter((p) => p.id !== id))
      await loadEntries()
      enqueueSnackbar('Period removed', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(e.error || 'Failed to remove period', {
        variant: 'error',
      })
    }
  }

  // ---- assign modal ----
  const openAssign = (day, period_id) => {
    setAssignForm({ class_id: '', teacher_id: '', room: '' })
    setAssign({ open: true, day, period_id })
  }
  const closeAssign = () => setAssign({ open: false, day: '', period_id: '' })

  const onPickClass = (classId) => {
    const cls = classes.find((c) => String(c.id) === String(classId))
    const opts = cls?.teacherOptions || []
    setAssignForm({
      class_id: classId,
      teacher_id: opts.length === 1 ? opts[0].id : '',
      room: '',
    })
  }

  const handleSaveAssign = async () => {
    if (!assignForm.class_id || !assignForm.teacher_id) {
      enqueueSnackbar('Pick a class and a teacher', { variant: 'warning' })
      return
    }
    try {
      await timetableApi.addEntry({
        academic_year: academicYear,
        term,
        day_of_week: assign.day,
        period_id: assign.period_id,
        class_id: assignForm.class_id,
        teacher_id: assignForm.teacher_id,
        room: assignForm.room,
      })
      closeAssign()
      await loadEntries()
      enqueueSnackbar('Class scheduled', { variant: 'success' })
    } catch (e) {
      // 409 conflicts and validation come back as the backend JSON body
      enqueueSnackbar(e.error || 'Failed to schedule class', {
        variant: 'error',
      })
    }
  }

  const handleRemoveEntry = async (id) => {
    try {
      await timetableApi.deleteEntry(id)
      setEntries((prev) => prev.filter((en) => en.id !== id))
      enqueueSnackbar('Removed from timetable', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(e.error || 'Failed to remove', { variant: 'error' })
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const res = await timetableApi.publish(academicYear, term)
      const results = res.data?.result || []
      const ok = results.filter(
        (r) => r.success || r.action === 'published',
      ).length
      const skipped = results.filter((r) => r.skipped).length
      enqueueSnackbar(
        `Published to ${ok} teacher(s)${
          skipped ? `, ${skipped} skipped (not synced to the tool)` : ''
        }`,
        { variant: ok ? 'success' : 'warning' },
      )
    } catch (e) {
      enqueueSnackbar(e.error || 'Publish failed', { variant: 'error' })
    } finally {
      setPublishing(false)
    }
  }

  const TEMPLATE_HEADERS = [
    'Day',
    'Period',
    'Start',
    'End',
    'Class',
    'Subject',
    'Teacher',
    'Room',
  ]

  const handleDownloadTemplate = () => {
    const example = [
      {
        Day: 'Monday',
        Period: 'Period 1',
        Start: '08:00',
        End: '08:40',
        Class: '2B',
        Subject: 'Chemistry',
        Teacher: 'Umbrelytics TeacherOne',
        Room: '204',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(example, { header: TEMPLATE_HEADERS })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable')
    XLSX.writeFile(wb, 'timetable-template.xlsx')
  }

  const normTime = (v) => {
    const m = String(v)
      .trim()
      .match(/(\d{1,2}):(\d{2})/)
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : String(v).trim()
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setImporting(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' })
      const rows = raw.map((r) => ({
        day: r.Day,
        period: r.Period,
        start: normTime(r.Start),
        end: normTime(r.End),
        class: r.Class,
        subject: r.Subject,
        teacher: r.Teacher,
        room: r.Room,
      }))
      if (!rows.length) {
        enqueueSnackbar('That sheet has no rows', { variant: 'warning' })
        return
      }
      const res = await timetableApi.importRows({
        academic_year: academicYear,
        term,
        rows,
      })
      const result = res.data?.result
      setImportResult(result)
      enqueueSnackbar(
        `Imported ${result?.imported ?? 0}, skipped ${result?.skipped ?? 0}`,
        {
          variant: result?.imported ? 'success' : 'warning',
        },
      )
      await loadStatic()
      await loadEntries()
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Import failed', {
        variant: 'error',
      })
    } finally {
      setImporting(false)
    }
  }

  const cellEntries = (day, periodId) =>
    entries.filter(
      (e) => e.day_of_week === day && String(e.period_id) === String(periodId),
    )

  const selectedClass = classes.find(
    (c) => String(c.id) === String(assignForm.class_id),
  )

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading timetable…</Typography>
      </Box>
    )

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Master Timetable</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Academic Year"
            size="small"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value.replace(/\D/g, ''))}
            sx={{ width: 120 }}
          />
          <TextField
            select
            label="Term"
            size="small"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            sx={{ width: 120 }}
          >
            {TERMS.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? 'Publishing…' : 'Publish to Teachers'}
          </Button>

          <Button variant="outlined" onClick={handleDownloadTemplate}>
            Template
          </Button>
          <Button variant="outlined" component="label" disabled={importing}>
            {importing ? 'Importing…' : 'Import Excel'}
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleImportFile}
            />
          </Button>
        </Stack>
      </Stack>

      {/* Periods */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bell Schedule
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          alignItems={{ md: 'center' }}
          sx={{ mb: 2 }}
        >
          <TextField
            label="#"
            size="small"
            sx={{ width: 70 }}
            value={periodForm.period_number}
            onChange={(e) =>
              setPeriodForm({
                ...periodForm,
                period_number: e.target.value.replace(/\D/g, ''),
              })
            }
          />
          <TextField
            label="Label"
            size="small"
            value={periodForm.label}
            onChange={(e) =>
              setPeriodForm({ ...periodForm, label: e.target.value })
            }
          />
          <TextField
            label="Start"
            type="time"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={periodForm.start_time}
            onChange={(e) =>
              setPeriodForm({ ...periodForm, start_time: e.target.value })
            }
          />
          <TextField
            label="End"
            type="time"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={periodForm.end_time}
            onChange={(e) =>
              setPeriodForm({ ...periodForm, end_time: e.target.value })
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={periodForm.is_break}
                onChange={(e) =>
                  setPeriodForm({ ...periodForm, is_break: e.target.checked })
                }
              />
            }
            label="Break"
          />
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddPeriod}
          >
            Add Period
          </Button>
        </Stack>
        {periods.length === 0 ? (
          <Typography color="textSecondary">
            No periods yet — add your bell schedule above.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {periods.map((p) => (
              <Stack key={p.id} direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ width: 30 }}>{p.period_number}</Typography>
                <Typography sx={{ width: 140 }}>{p.label}</Typography>
                <Typography sx={{ width: 140 }} color="textSecondary">
                  {String(p.start_time).slice(0, 5)}–
                  {String(p.end_time).slice(0, 5)}
                  {p.is_break ? ' (break)' : ''}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleDeletePeriod(p.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>

      {/* Grid */}
      <Card sx={{ p: 2, overflowX: 'auto' }}>
        {periods.length === 0 ? (
          <Typography color="textSecondary">
            Add periods to build the grid.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                {DAYS.map((d) => (
                  <TableCell key={d} align="center">
                    {d}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <strong>{p.label}</strong>
                    <br />
                    <Typography variant="caption" color="textSecondary">
                      {String(p.start_time).slice(0, 5)}–
                      {String(p.end_time).slice(0, 5)}
                    </Typography>
                  </TableCell>
                  {DAYS.map((day) => {
                    const list = cellEntries(day, p.id)
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{ minWidth: 160, verticalAlign: 'top' }}
                      >
                        {p.is_break ? (
                          <Typography variant="caption" color="textSecondary">
                            —
                          </Typography>
                        ) : (
                          <Stack spacing={1} alignItems="stretch">
                            {list.map((en) => (
                              <Box
                                key={en.id}
                                sx={{
                                  bgcolor: 'grey.100',
                                  borderRadius: 1,
                                  p: 1,
                                }}
                              >
                                <Typography variant="subtitle2">
                                  {en.class_name}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {en.subject_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="textSecondary"
                                >
                                  {en.teacher_name}
                                  {en.room ? ` · ${en.room}` : ''}
                                </Typography>
                                <Button
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleRemoveEntry(en.id)}
                                >
                                  Remove
                                </Button>
                              </Box>
                            ))}
                            <IconButton
                              size="small"
                              onClick={() => openAssign(day, p.id)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Assign modal */}
      <Dialog open={assign.open} onClose={closeAssign} fullWidth maxWidth="xs">
        <DialogTitle>Schedule a class — {assign.day}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Class"
              value={assignForm.class_id}
              onChange={(e) => onPickClass(e.target.value)}
              fullWidth
            >
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.class_name} — {c.subject_name} ({c.grade_name})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Teacher"
              value={assignForm.teacher_id}
              onChange={(e) =>
                setAssignForm({ ...assignForm, teacher_id: e.target.value })
              }
              fullWidth
              disabled={!selectedClass}
            >
              {(selectedClass?.teacherOptions || []).map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Room"
              value={assignForm.room}
              onChange={(e) =>
                setAssignForm({ ...assignForm, room: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssign}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAssign}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
      {/* Import-results modal */}
      <Dialog
        open={!!importResult}
        onClose={() => setImportResult(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Import results</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Imported <strong>{importResult?.imported ?? 0}</strong>, skipped{' '}
            <strong>{importResult?.skipped ?? 0}</strong>.
          </Typography>
          <Stack spacing={0.5}>
            {(importResult?.details || [])
              .filter((d) => d.status === 'skipped')
              .map((d, i) => (
                <Typography key={i} variant="caption" color="error">
                  Row {d.row}: {d.reason}
                </Typography>
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportResult(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

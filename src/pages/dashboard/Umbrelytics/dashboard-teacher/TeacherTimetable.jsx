import { useState, useEffect, useRef } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Paper,
} from '@material-ui/core'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  FileCopyOutlined as FileCopyIcon,
} from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import Page from '../../../../components/Page'
import toolAxios from 'src/_apis_/toolAxios'
import { useSearchParams } from 'react-router-dom'
import TimetableImportModal from './TimetableImportModal'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time-scaled grid density: each minute is PX_PER_MIN px tall, so a block's
// height is proportional to its duration (a 60-min class ≈ 90px). MIN_BLOCK_PX
// keeps very short blocks readable.
const PX_PER_MIN = 1.5
const MIN_BLOCK_PX = 44
const AXIS_W = 72 // width of the left time axis
const SNAP_MIN = 10 // drag snaps start time to this many minutes

const EMPTY_ENTRY = {
  class_id: '',
  day_of_week: 'Monday',
  start_time: '',
  end_time: '',
  notes: '',
  session_type: 'double',
}

const EMPTY_CLASS = {
  class_name: '',
  subject: '',
  grade_level: '',
  student_count: 25,
  room: '',
  proficiency: 'Mixed proficiency',
  standard_session_length: 60,
  session_type: 'double',
  academic_year: new Date().getFullYear(),
  term: 'Term 1',
  class_time: '9:00 AM',
}

// TIME (HH:MM:SS) from DB -> HH:MM for the <input type="time">
const trimTime = (t) => (t ? t.slice(0, 5) : '')

// "HH:MM[:SS]" -> minutes since midnight
const toMinutes = (t) => {
  if (!t) return 0
  const [h, m] = String(t).slice(0, 5).split(':').map(Number)
  return h * 60 + m
}
// minutes since midnight -> "HH:MM"
const fmtTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(
    mins % 60,
  ).padStart(2, '0')}`
const fmtHour = (h) => `${String(h).padStart(2, '0')}:00`
const multiplierFor = (t) => (t === 'double' ? 2 : t === 'triple' ? 3 : 1)

export default function TeacherTimetable() {
  const { enqueueSnackbar } = useSnackbar()

  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const canEdit = user_type === 5 // independents edit; school-linked teachers are read-only

  const [timetable, setTimetable] = useState([])
  const [classes, setClasses] = useState([])
  const [sessionConfig, setSessionConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  // Schedule dialog
  const [entryDialog, setEntryDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [entryForm, setEntryForm] = useState(EMPTY_ENTRY)

  // Class dialog
  const [classDialog, setClassDialog] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [classForm, setClassForm] = useState(EMPTY_CLASS)

  // Timetable import dialog
  const [importOpen, setImportOpen] = useState(false)

  // Drag-to-move state
  const gridBodyRef = useRef(null)
  const dragRef = useRef(null)
  const geomRef = useRef({ rangeStartMin: 0, rangeEndMin: 0 })
  const [drag, setDrag] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-open the class editor when arriving with ?editClass=<id>
  useEffect(() => {
    const editId = searchParams.get('editClass')
    if (!editId || classes.length === 0) return

    const target = classes.find((c) => String(c.id) === String(editId))
    if (target) {
      openEditClass(target)
    } else {
      enqueueSnackbar('That class no longer exists', { variant: 'warning' })
    }

    // Clear the param so a refresh doesn't reopen the dialog
    searchParams.delete('editClass')
    setSearchParams(searchParams, { replace: true })
  }, [classes, searchParams])

  // Auto-fill end time from start + duration (single/double/triple). Custom
  // leaves the end time to the user.
  useEffect(() => {
    if (!entryDialog) return
    if (entryForm.session_type === 'custom') return
    if (!entryForm.start_time) return
    const classId = editingEntry ? editingEntry.class_id : entryForm.class_id
    const end = fmtTime(
      toMinutes(entryForm.start_time) +
        multiplierFor(entryForm.session_type) * getBaseLen(classId),
    )
    if (end !== entryForm.end_time) {
      setEntryForm((f) => ({ ...f, end_time: end }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entryForm.start_time,
    entryForm.session_type,
    entryForm.class_id,
    entryDialog,
  ])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ttRes, clsRes, cfgRes] = await Promise.all([
        toolAxios.get('/api/timetables'),
        toolAxios.get('/api/timetables/classes'),
        toolAxios.get('/api/timetables/session-config'),
      ])
      setTimetable(ttRes.data.data || [])
      setClasses(clsRes.data.data || [])
      setSessionConfig(cfgRes.data.data || null)
    } catch (err) {
      console.error('Failed to load timetable:', err)
      enqueueSnackbar('Failed to load timetable', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getClassesForDay = (day) =>
    timetable
      .filter((e) => e.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

  // Base session length for a class — same value the lesson planner uses, so
  // single/double/triple stay consistent across both.
  const getBaseLen = (classId) => {
    const c = classes.find((x) => String(x.id) === String(classId))
    return (
      c?.standard_session_length || sessionConfig?.standard_session_length || 45
    )
  }

  // ---------- Schedule entry handlers ----------
  const openAddEntry = () => {
    setEditingEntry(null)
    setEntryForm(EMPTY_ENTRY)
    setEntryDialog(true)
  }

  // Open the add dialog pre-set to a specific day/time (empty-slot click)
  const openAddEntryAt = (day, startMin) => {
    setEditingEntry(null)
    setEntryForm({
      ...EMPTY_ENTRY,
      day_of_week: day,
      start_time: fmtTime(startMin),
    })
    setEntryDialog(true)
  }

  const openEditEntry = (entry) => {
    setEditingEntry(entry)
    setEntryForm({
      class_id: entry.class_id,
      day_of_week: entry.day_of_week,
      start_time: trimTime(entry.start_time),
      end_time: trimTime(entry.end_time),
      notes: entry.notes || '',
      session_type: entry.session_type || 'double',
    })
    setEntryDialog(true)
  }

  // Find the first free start time on a day that fits durationMin without
  // overlapping an existing class, searching from preferFromMin forward, then
  // filling any earlier gap. Returns minutes-since-midnight, or null if full.
  const findFreeSlot = (day, durationMin, preferFromMin) => {
    const { rangeStartMin, rangeEndMin } = geomRef.current
    const dayEntries = timetable.filter((e) => e.day_of_week === day)
    const fits = (startMin) => {
      if (startMin < rangeStartMin) return false
      if (startMin + durationMin > rangeEndMin) return false
      return !dayEntries.some(
        (e) =>
          startMin < toMinutes(e.end_time) &&
          startMin + durationMin > toMinutes(e.start_time),
      )
    }
    const step = SNAP_MIN
    for (let s = preferFromMin; s + durationMin <= rangeEndMin; s += step) {
      if (fits(s)) return s
    }
    for (let s = rangeStartMin; s < preferFromMin; s += step) {
      if (fits(s)) return s
    }
    return null
  }

  // Duplicate an entry immediately into the next free slot on the same day —
  // no dialog. The user can drag or edit the copy afterward.
  const handleDuplicateEntry = async (entry) => {
    const durationMin = toMinutes(entry.end_time) - toMinutes(entry.start_time)
    const day = entry.day_of_week
    const start = findFreeSlot(day, durationMin, toMinutes(entry.end_time))
    if (start == null) {
      enqueueSnackbar(`No free slot to duplicate into on ${day}`, {
        variant: 'warning',
      })
      return
    }
    try {
      await toolAxios.post('/api/timetables', {
        class_id: entry.class_id,
        day_of_week: day,
        start_time: fmtTime(start),
        end_time: fmtTime(start + durationMin),
        notes: entry.notes || '',
        session_type: entry.session_type || 'double',
      })
      enqueueSnackbar('Class duplicated', { variant: 'success' })
      fetchData()
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.error || 'Failed to duplicate class',
        {
          variant: 'error',
        },
      )
    }
  }

  const saveEntry = async () => {
    const classId = editingEntry ? editingEntry.class_id : entryForm.class_id

    // Derive the end time for single/double/triple; validate it for custom.
    let end_time = entryForm.end_time
    if (entryForm.session_type !== 'custom') {
      if (entryForm.start_time) {
        end_time = fmtTime(
          toMinutes(entryForm.start_time) +
            multiplierFor(entryForm.session_type) * getBaseLen(classId),
        )
      }
    } else if (
      entryForm.start_time &&
      end_time &&
      toMinutes(end_time) <= toMinutes(entryForm.start_time)
    ) {
      enqueueSnackbar('End time must be after start time', { variant: 'error' })
      return
    }

    try {
      if (editingEntry) {
        await toolAxios.put(`/api/timetables/${editingEntry.id}`, {
          day_of_week: entryForm.day_of_week,
          start_time: entryForm.start_time,
          end_time,
          notes: entryForm.notes,
          session_type: entryForm.session_type,
        })
        enqueueSnackbar('Schedule updated', { variant: 'success' })
      } else {
        await toolAxios.post('/api/timetables', { ...entryForm, end_time })
        enqueueSnackbar('Added to schedule', { variant: 'success' })
      }
      setEntryDialog(false)
      fetchData()
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.error || 'Failed to save schedule entry',
        { variant: 'error' },
      )
    }
  }

  const deleteEntry = async (id) => {
    if (!window.confirm('Remove this class from the timetable?')) return
    try {
      await toolAxios.delete(`/api/timetables/${id}`)
      enqueueSnackbar('Removed from schedule', { variant: 'success' })
      fetchData()
    } catch (err) {
      enqueueSnackbar('Failed to remove entry', { variant: 'error' })
    }
  }

  // ---------- Class handlers ----------
  const openAddClass = () => {
    setEditingClass(null)
    setClassForm(EMPTY_CLASS)
    setClassDialog(true)
  }

  const openEditClass = (cls) => {
    setEditingClass(cls)
    setClassForm({
      class_name: cls.class_name || '',
      subject: cls.subject || '',
      grade_level: cls.grade_level || '',
      student_count: cls.student_count || 25,
      room: cls.room || '',
      proficiency: cls.proficiency || 'Mixed proficiency',
      standard_session_length: cls.standard_session_length || 60,
      session_type: cls.session_type || 'double',
      academic_year: cls.academic_year || new Date().getFullYear(),
      term: cls.term || 'Term 1',
      class_time: cls.class_time || '9:00 AM',
    })
    setClassDialog(true)
  }

  const saveClass = async () => {
    try {
      if (editingClass) {
        await toolAxios.put(
          `/api/timetables/classes/${editingClass.id}`,
          classForm,
        )
        enqueueSnackbar('Class updated', { variant: 'success' })
      } else {
        await toolAxios.post('/api/timetables/classes', classForm)
        enqueueSnackbar('Class created', { variant: 'success' })
      }
      setEditingClass(null)
      setClassForm(EMPTY_CLASS)
      fetchData()
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Failed to save class', {
        variant: 'error',
      })
    }
  }

  const deleteClass = async (id) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return
    try {
      await toolAxios.delete(`/api/timetables/classes/${id}`)
      enqueueSnackbar('Class deleted', { variant: 'success' })
      fetchData()
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.error ||
          'Failed to delete class. It may be scheduled on your timetable.',
        { variant: 'error' },
      )
    }
  }

  // ---- Drag to move a scheduled entry ----
  const beginDrag = (e, entry) => {
    if (!canEdit) return
    if (e.target.closest('button, a')) return
    e.preventDefault()
    const body = gridBodyRef.current
    if (!body) return
    const rect = body.getBoundingClientRect()
    const { rangeStartMin } = geomRef.current
    const es = toMinutes(entry.start_time)
    const ee = toMinutes(entry.end_time)
    const init = {
      entry,
      id: entry.id,
      durationMin: ee - es,
      grabOffsetMin: (e.clientY - rect.top) / PX_PER_MIN + rangeStartMin - es,
      previewDayIndex: DAYS.indexOf(entry.day_of_week),
      previewStartMin: es,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      rectLeft: rect.left,
      rectTop: rect.top,
      colWidth: (rect.width - AXIS_W) / DAYS.length,
    }
    dragRef.current = init
    setDrag(init)
  }

  const isDragging = !!drag
  useEffect(() => {
    if (!isDragging) return undefined
    const onMove = (ev) => {
      const d = dragRef.current
      const body = gridBodyRef.current
      if (!d || !body) return
      const rect = body.getBoundingClientRect()
      const { rangeStartMin, rangeEndMin } = geomRef.current
      const colWidth = (rect.width - AXIS_W) / DAYS.length
      const moved =
        d.moved ||
        Math.abs(ev.clientX - d.startX) > 4 ||
        Math.abs(ev.clientY - d.startY) > 4
      let dayIndex = Math.floor((ev.clientX - rect.left - AXIS_W) / colWidth)
      dayIndex = Math.max(0, Math.min(DAYS.length - 1, dayIndex))
      const pointerMin = (ev.clientY - rect.top) / PX_PER_MIN + rangeStartMin
      let startMin =
        Math.round((pointerMin - d.grabOffsetMin) / SNAP_MIN) * SNAP_MIN
      startMin = Math.max(
        rangeStartMin,
        Math.min(rangeEndMin - d.durationMin, startMin),
      )
      const next = {
        ...d,
        moved,
        previewDayIndex: dayIndex,
        previewStartMin: startMin,
        rectLeft: rect.left,
        rectTop: rect.top,
        colWidth,
      }
      dragRef.current = next
      setDrag(next)
    }
    const onUp = () => {
      const d = dragRef.current
      dragRef.current = null
      setDrag(null)
      if (d && d.moved) finalizeDrag(d)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  const finalizeDrag = async (d) => {
    const newDay = DAYS[d.previewDayIndex]
    const newStart = d.previewStartMin
    const newEnd = newStart + d.durationMin
    const origStart = toMinutes(d.entry.start_time)
    if (newDay === d.entry.day_of_week && newStart === origStart) return

    // Client-side overlap guard (the PUT endpoint doesn't check conflicts).
    const conflict = timetable.some(
      (e) =>
        e.id !== d.id &&
        e.day_of_week === newDay &&
        newStart < toMinutes(e.end_time) &&
        newEnd > toMinutes(e.start_time),
    )
    if (conflict) {
      enqueueSnackbar(`That time overlaps another class on ${newDay}`, {
        variant: 'warning',
      })
      return
    }

    const startStr = fmtTime(newStart)
    const endStr = fmtTime(newEnd)

    // Optimistic update so the block lands immediately.
    setTimetable((prev) =>
      prev.map((e) =>
        e.id === d.id
          ? {
              ...e,
              day_of_week: newDay,
              start_time: startStr,
              end_time: endStr,
            }
          : e,
      ),
    )

    try {
      await toolAxios.put(`/api/timetables/${d.id}`, {
        day_of_week: newDay,
        start_time: startStr,
        end_time: endStr,
        notes: d.entry.notes || '',
        session_type: d.entry.session_type || 'double',
      })
      enqueueSnackbar('Class moved', { variant: 'success' })
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Failed to move class', {
        variant: 'error',
      })
      fetchData() // revert to server truth
    }
  }

  if (loading) {
    return (
      <Page title="Timetable | Umbrelytics">
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    )
  }

  // ---- Time-scaled grid geometry ----
  let rangeStartMin = toMinutes(sessionConfig?.school_start_time || '08:00')
  let rangeEndMin = toMinutes(sessionConfig?.school_end_time || '18:00')
  timetable.forEach((e) => {
    const s = toMinutes(e.start_time)
    const en = toMinutes(e.end_time)
    if (s < rangeStartMin) rangeStartMin = s
    if (en > rangeEndMin) rangeEndMin = en
  })
  rangeStartMin = Math.floor(rangeStartMin / 60) * 60
  rangeEndMin = Math.ceil(rangeEndMin / 60) * 60
  if (rangeEndMin <= rangeStartMin) rangeEndMin = rangeStartMin + 60
  geomRef.current = { rangeStartMin, rangeEndMin }
  const gridHeight = (rangeEndMin - rangeStartMin) * PX_PER_MIN
  const hourMarks = []
  for (let h = rangeStartMin / 60; h <= rangeEndMin / 60; h++) hourMarks.push(h)

  // Candidate empty "add" slots (one session length apart), for click-to-add.
  const addSlotLen = sessionConfig?.standard_session_length || 60
  const addSlots = []
  for (let m = rangeStartMin; m + addSlotLen <= rangeEndMin; m += addSlotLen) {
    addSlots.push({ start: m, end: m + addSlotLen })
  }

  const entryDurationValid =
    entryForm.session_type !== 'custom' ||
    (entryForm.start_time &&
      entryForm.end_time &&
      toMinutes(entryForm.end_time) > toMinutes(entryForm.start_time))

  return (
    <Page title="Timetable | Umbrelytics">
      <Container maxWidth="xl">
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4">My Timetable</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your weekly class schedule
            </Typography>
          </Box>
          {canEdit && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => setImportOpen(true)}
              >
                Import Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<SchoolIcon />}
                onClick={() => setClassDialog(true)}
              >
                Manage Classes
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddEntry}
                sx={{ color: '#fff' }}
              >
                Add to Schedule
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Weekly grid — time-scaled: block height ∝ duration */}
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 760 }}>
              {/* Header row */}
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    flexShrink: 0,
                    p: 1.5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  Time
                </Box>
                {DAYS.map((day) => (
                  <Box
                    key={day}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      '&:last-of-type': { borderRight: 'none' },
                    }}
                  >
                    {day}
                  </Box>
                ))}
              </Box>

              {/* Body */}
              <Box
                ref={gridBodyRef}
                sx={{ display: 'flex', height: gridHeight, userSelect: 'none' }}
              >
                {/* Time axis */}
                <Box
                  sx={{
                    width: 72,
                    flexShrink: 0,
                    position: 'relative',
                    bgcolor: 'grey.50',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {hourMarks.map((h) => (
                    <Typography
                      key={h}
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        px: 1,
                        color: 'text.secondary',
                        fontWeight: 500,
                        transform: 'translateY(-50%)',
                      }}
                      style={{ top: (h * 60 - rangeStartMin) * PX_PER_MIN }}
                    >
                      {fmtHour(h)}
                    </Typography>
                  ))}
                </Box>

                {/* Day columns */}
                {DAYS.map((day) => {
                  const dayEntries = getClassesForDay(day)
                  return (
                    <Box
                      key={day}
                      sx={{
                        flex: 1,
                        position: 'relative',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        '&:last-of-type': { borderRight: 'none' },
                      }}
                    >
                      {/* Hour gridlines */}
                      {hourMarks.map((h) => (
                        <Box
                          key={h}
                          sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            borderTop: '1px solid',
                            borderColor: 'grey.100',
                          }}
                          style={{ top: (h * 60 - rangeStartMin) * PX_PER_MIN }}
                        />
                      ))}

                      {/* Break bands (from session config, if any) */}
                      {(sessionConfig?.break_times || []).map((b, i) => {
                        const bs = toMinutes(b.start)
                        const be = toMinutes(b.end)
                        if (be <= rangeStartMin || bs >= rangeEndMin)
                          return null
                        const top =
                          (Math.max(bs, rangeStartMin) - rangeStartMin) *
                          PX_PER_MIN
                        const height =
                          (Math.min(be, rangeEndMin) -
                            Math.max(bs, rangeStartMin)) *
                          PX_PER_MIN
                        return (
                          <Box
                            key={`break-${i}`}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            style={{ top, height }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.disabled',
                                fontStyle: 'italic',
                              }}
                            >
                              {b.name || 'Break'}
                            </Typography>
                          </Box>
                        )
                      })}

                      {/* Empty add-zones — only where no class sits */}
                      {canEdit &&
                        addSlots
                          .filter(
                            (slot) =>
                              !dayEntries.some((e) => {
                                const es = toMinutes(e.start_time)
                                const ee = toMinutes(e.end_time)
                                return slot.start < ee && slot.end > es
                              }),
                          )
                          .map((slot) => (
                            <Box
                              key={`add-${day}-${slot.start}`}
                              onClick={() => openAddEntryAt(day, slot.start)}
                              sx={{
                                position: 'absolute',
                                left: 2,
                                right: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'grey.300',
                                borderRadius: 1,
                                cursor: 'pointer',
                                transition: 'all .15s',
                                '&:hover': {
                                  bgcolor: 'grey.50',
                                  color: 'grey.500',
                                  border: '1px dashed',
                                  borderColor: 'grey.300',
                                },
                              }}
                              style={{
                                top: (slot.start - rangeStartMin) * PX_PER_MIN,
                                height: (slot.end - slot.start) * PX_PER_MIN,
                              }}
                              title={`Add a class on ${day} at ${fmtTime(
                                slot.start,
                              )}`}
                            >
                              +
                            </Box>
                          ))}

                      {/* Class blocks */}
                      {dayEntries.map((entry) => {
                        const es = toMinutes(entry.start_time)
                        const ee = toMinutes(entry.end_time)
                        const top = (es - rangeStartMin) * PX_PER_MIN
                        const height = Math.max(
                          MIN_BLOCK_PX,
                          (ee - es) * PX_PER_MIN,
                        )
                        const showSubject = height >= 72
                        const showMeta = height >= 104
                        const beingDragged = drag && drag.id === entry.id
                        return (
                          <Paper
                            key={entry.id}
                            variant="outlined"
                            onPointerDown={(e) => beginDrag(e, entry)}
                            sx={{
                              position: 'absolute',
                              left: 2,
                              right: 2,
                              zIndex: 1,
                              p: 0.75,
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              bgcolor: '#eef2ff',
                              borderColor: '#c7d2fe',
                              userSelect: 'none',
                              cursor: canEdit ? 'grab' : 'default',
                              opacity: beingDragged ? 0.4 : 1,
                            }}
                            style={{ top, height }}
                          >
                            {canEdit && (
                              <IconButton
                                size="small"
                                title="Duplicate"
                                aria-label="Duplicate"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => handleDuplicateEntry(entry)}
                                sx={{
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  zIndex: 2,
                                  color: 'secondary.main',
                                  p: 0.25,
                                }}
                              >
                                <FileCopyIcon style={{ fontSize: 16 }} />
                              </IconButton>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 'bold',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                pr: 2.5,
                              }}
                            >
                              {entry.class_name}
                            </Typography>
                            {showSubject && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {entry.subject}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', lineHeight: 1.2 }}
                            >
                              {trimTime(entry.start_time)}–
                              {trimTime(entry.end_time)}
                            </Typography>
                            {showMeta && entry.room && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.disabled',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                Room: {entry.room}
                              </Typography>
                            )}
                            {showMeta && entry.notes && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.disabled',
                                  fontStyle: 'italic',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {entry.notes}
                              </Typography>
                            )}
                            {canEdit && (
                              <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ mt: 'auto', pt: 0.25 }}
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                <Typography
                                  variant="caption"
                                  onClick={() => openEditEntry(entry)}
                                  sx={{
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    '&:hover': { textDecoration: 'underline' },
                                  }}
                                >
                                  Edit
                                </Typography>
                                <Typography
                                  variant="caption"
                                  onClick={() => deleteEntry(entry.id)}
                                  sx={{
                                    color: 'error.main',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    '&:hover': { textDecoration: 'underline' },
                                  }}
                                >
                                  Remove
                                </Typography>
                              </Stack>
                            )}
                          </Paper>
                        )
                      })}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>

      {/* Drag ghost — follows the pointer at the snapped target position */}
      {drag && drag.moved && (
        <Box
          sx={{
            position: 'fixed',
            zIndex: 1300,
            pointerEvents: 'none',
            userSelect: 'none',
            bgcolor: '#dbeafe',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 1,
            p: 0.75,
            overflow: 'hidden',
            boxShadow: 4,
          }}
          style={{
            left:
              drag.rectLeft + AXIS_W + drag.previewDayIndex * drag.colWidth + 2,
            top:
              drag.rectTop +
              (drag.previewStartMin - rangeStartMin) * PX_PER_MIN,
            width: drag.colWidth - 4,
            height: drag.durationMin * PX_PER_MIN,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {drag.entry.class_name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fmtTime(drag.previewStartMin)}–
            {fmtTime(drag.previewStartMin + drag.durationMin)}
          </Typography>
        </Box>
      )}

      {/* ---------- Schedule Entry Dialog ---------- */}
      <Dialog
        open={entryDialog}
        onClose={() => setEntryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEntry ? 'Edit Schedule Entry' : 'Add Class to Schedule'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {!editingEntry && (
              <TextField
                select
                fullWidth
                label="Select Class"
                value={entryForm.class_id}
                onChange={(e) =>
                  setEntryForm({ ...entryForm, class_id: e.target.value })
                }
              >
                <MenuItem value="">-- Select a class --</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_name} - {cls.subject} ({cls.grade_level})
                  </MenuItem>
                ))}
              </TextField>
            )}

            {!editingEntry && classes.length === 0 && (
              <Alert severity="info">
                You have no classes yet. Use “Manage Classes” to create one
                first.
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Day of Week"
              value={entryForm.day_of_week}
              onChange={(e) =>
                setEntryForm({ ...entryForm, day_of_week: e.target.value })
              }
            >
              {DAYS.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </TextField>

            {/* Duration — auto-fills end time for single/double/triple; Custom
                lets the user set the end time directly. */}
            <TextField
              select
              fullWidth
              label="Duration"
              value={entryForm.session_type}
              onChange={(e) =>
                setEntryForm({ ...entryForm, session_type: e.target.value })
              }
              helperText={
                entryForm.session_type !== 'custom'
                  ? `= ${
                      multiplierFor(entryForm.session_type) *
                      getBaseLen(
                        editingEntry
                          ? editingEntry.class_id
                          : entryForm.class_id,
                      )
                    } min${
                      entryForm.end_time ? ` · ends ${entryForm.end_time}` : ''
                    }`
                  : 'Set the start and end time below.'
              }
            >
              <MenuItem value="single">Single Session</MenuItem>
              <MenuItem value="double">Double Session</MenuItem>
              <MenuItem value="triple">Triple Session</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                InputLabelProps={{ shrink: true }}
                value={entryForm.start_time}
                onChange={(e) =>
                  setEntryForm({ ...entryForm, start_time: e.target.value })
                }
              />
              <TextField
                fullWidth
                type="time"
                label={
                  entryForm.session_type === 'custom'
                    ? 'End Time'
                    : 'End Time (auto)'
                }
                InputLabelProps={{ shrink: true }}
                value={entryForm.end_time}
                disabled={entryForm.session_type !== 'custom'}
                onChange={(e) =>
                  setEntryForm({ ...entryForm, end_time: e.target.value })
                }
              />
            </Stack>

            <TextField
              fullWidth
              label="Notes (optional)"
              value={entryForm.notes}
              onChange={(e) =>
                setEntryForm({ ...entryForm, notes: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEntryDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ color: '#fff' }}
            onClick={saveEntry}
            disabled={
              (!editingEntry && !entryForm.class_id) ||
              !entryForm.start_time ||
              !entryDurationValid
            }
          >
            {editingEntry ? 'Update' : 'Add to Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Class Management Dialog ---------- */}
      <Dialog
        open={classDialog}
        onClose={() => {
          setClassDialog(false)
          setEditingClass(null)
          setClassForm(EMPTY_CLASS)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {editingClass ? 'Edit Class' : 'Manage Your Classes'}
            <IconButton
              onClick={() => {
                setClassDialog(false)
                setEditingClass(null)
                setClassForm(EMPTY_CLASS)
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {/* Form */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class Name"
                value={classForm.class_name}
                onChange={(e) =>
                  setClassForm({ ...classForm, class_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={classForm.subject}
                onChange={(e) =>
                  setClassForm({ ...classForm, subject: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade Level"
                value={classForm.grade_level}
                onChange={(e) =>
                  setClassForm({ ...classForm, grade_level: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Student Count"
                value={classForm.student_count}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    student_count: parseInt(e.target.value, 10) || 0,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room"
                value={classForm.room}
                onChange={(e) =>
                  setClassForm({ ...classForm, room: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Session Length (minutes)"
                value={classForm.standard_session_length}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    standard_session_length: parseInt(e.target.value, 10) || 60,
                  })
                }
                inputProps={{ min: 10, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Session Type"
                value={classForm.session_type}
                onChange={(e) =>
                  setClassForm({ ...classForm, session_type: e.target.value })
                }
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="double">Double</MenuItem>
                <MenuItem value="triple">Triple</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Proficiency"
                value={classForm.proficiency}
                onChange={(e) =>
                  setClassForm({ ...classForm, proficiency: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                {editingClass && (
                  <Button
                    color="inherit"
                    onClick={() => {
                      setEditingClass(null)
                      setClassForm(EMPTY_CLASS)
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button
                  variant="contained"
                  sx={{ color: '#fff' }}
                  onClick={saveClass}
                  disabled={
                    !classForm.class_name ||
                    !classForm.subject ||
                    !classForm.grade_level
                  }
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          {/* Existing classes */}
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
                    <Typography variant="subtitle2">
                      {cls.class_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {cls.subject} • {cls.grade_level} • {cls.student_count}{' '}
                      students
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openEditClass(cls)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteClass(cls.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
      {/* ---------- Excel Import ---------- */}
      <TimetableImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchData}
      />
    </Page>
  )
}

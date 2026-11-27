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
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Divider,
} from '@material-ui/core'
import {
  Add as AddIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  FileCopyOutlined as FileCopyIcon,
  Room as RoomIcon,
} from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import Page from '../../../../components/Page'
import toolAxios from 'src/_apis_/toolAxios'
import { useSearchParams, useNavigate } from 'react-router-dom'
import TimetableImportModal from './TimetableImportModal'
import { to12h } from 'src/utils/time'
import AddClassesDialog from 'src/components/AddClassesDialog'
import TeachingEnvironmentModal from 'src/components/TeachingEnvironmentModal'
import Autocomplete from '@material-ui/lab/Autocomplete'
import useTeacherClassOptions from 'src/hooks/useTeacherClassOptions'

// Base URL of the tool app (where the lesson generator lives). Set
// REACT_APP_TOOL_URL in the website env; falls back to the local tool dev server.
const TOOL_APP_URL = process.env.REACT_APP_TOOL_URL || 'http://localhost:3001'

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
  room: '',
}

const EMPTY_CLASS = {
  class_name: '',
  subject: '',
  grade_level: '',
  student_count: 25,
  examination_body: '',
  room: '',
  proficiency: 'Mixed proficiency',
  color: '',
  standard_session_length: 60,
  session_type: 'double',
  academic_year: new Date().getFullYear(),
  term: 'Term 1',
  class_time: '09:00:00',
}

// Per-class colour palette — must match CLASS_COLOR_PALETTE in the tool
// backend (timetables.js) so auto-assigned colours match the picker swatches.
const CLASS_COLORS = [
  '#4C6FFF',
  '#2ECC71',
  '#F39C12',
  '#9B59B6',
  '#E74C3C',
  '#1ABC9C',
  '#E67E22',
  '#34495E',
  '#FF6B9D',
  '#16A085',
  '#F1C40F',
  '#8E44AD',
]

const EXAMINATION_BODIES = [
  'CXC CSEC',
  'CXC CAPE',
  'Cambridge IGCSE',
  'Cambridge A-Level',
  'GCSE',
]

// Accept only #RRGGBB / #RRGGBBAA so a bad value never reaches inline styles.
const isHexColor = (v) =>
  typeof v === 'string' && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v.trim())

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
// Display-only wrapper: same value as fmtTime but 12-hour am/pm. Never use for
// payloads/state (those stay 24-hour via fmtTime).
const fmtTimeDisplay = (mins) => to12h(fmtTime(mins))
// Hour-ruler label in 12-hour am/pm form.
const fmtHour = (h) => to12h(`${String(h).padStart(2, '0')}:00`)
const multiplierFor = (t) => (t === 'double' ? 2 : t === 'triple' ? 3 : 1)
const SCHEDULE_MAX_MIN = 22 * 60 // 10:00 PM — latest a session may end

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
  const [editingClass, setEditingClass] = useState(null)
  const [classForm, setClassForm] = useState(EMPTY_CLASS)
  // Subjects/grades from onboarding, offered as options in the edit form (the
  // existing value is kept — this is edit-only, so no auto-select).
  const { subjectOptions, gradeOptions } = useTeacherClassOptions()
  // Editable copies of this class's scheduled sessions (shown in the Edit Class
  // modal). Length/type live here per session, not on the class.
  const [environmentOpen, setEnvironmentOpen] = useState(false)
  const [sessionEdits, setSessionEdits] = useState([])
  const [addOpen, setAddOpen] = useState(false)

  // Timetable import dialog
  const [importOpen, setImportOpen] = useState(false)

  // Drag-to-move state
  const gridBodyRef = useRef(null)
  const dragRef = useRef(null)
  const [viewEntry, setViewEntry] = useState(null)
  const navigate = useNavigate()
  // Subject -> distinct syllabus names, for the class detail modal's syllabus
  // links (mirrors the lesson-planner timetable). Built from the curriculum.
  const [syllabusMap, setSyllabusMap] = useState({})
  useEffect(() => {
    let active = true
    toolAxios
      .get('/api/curriculum/objectives')
      .then((res) => {
        const objs = res.data?.data || []
        const map = {}
        objs.forEach((o) => {
          if (!o.subject_name || !o.syllabus_name) return
          const key = o.subject_name.trim().toLowerCase()
          if (!map[key]) map[key] = new Set()
          map[key].add(o.syllabus_name)
        })
        const finalMap = {}
        Object.keys(map).forEach((k) => {
          finalMap[k] = [...map[k]]
        })
        if (active) setSyllabusMap(finalMap)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  const suppressClickRef = useRef(false)
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

  // Auto-open the combined Add Classes dialog when arriving with
  // ?manageClasses=1 (from the dashboard empty-state CTAs). Independents only —
  // school-linked teachers can't manage classes, so for them it just lands on
  // the timetable.
  useEffect(() => {
    if (searchParams.get('manageClasses') !== '1') return
    if (canEdit) {
      setEditingClass(null)
      setAddOpen(true)
    }
    searchParams.delete('manageClasses')
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
      // Let the sidebar re-check its onboarding lock without a page reload.
      window.dispatchEvent(new Event('umbrelytics:classes-changed'))
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
      room: entry.room || '',
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

  // Plan a lesson for this class/day — opens the tool's lesson generator in a
  // new tab with the class and day prefilled (cross-app, so via URL params).
  const planLesson = (entry) => {
    const params = new URLSearchParams({
      prefillClassId: entry.class_id ?? '',
      prefillClassName: entry.class_name ?? '',
      prefillSubject: entry.subject ?? '',
      prefillDay: entry.day_of_week ?? '',
      prefillStartTime: entry.start_time ?? '',
    })
    /*window.open(
      `${TOOL_APP_URL}/lesson-plan-generator?${params.toString()}`,
      '_blank',
      'noopener,noreferrer',
    )*/
    window.location.href = `${TOOL_APP_URL}/lesson-plan-generator?${params.toString()}`
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
        room: entry.room || '',
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

    if (end_time && toMinutes(end_time) > SCHEDULE_MAX_MIN) {
      enqueueSnackbar(
        'This session would end after 10:00 PM. Choose an earlier start or a shorter session.',
        { variant: 'error' },
      )
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
          room: entryForm.room,
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
  const closeClassDialog = () => {
    setEditingClass(null)
    setClassForm(EMPTY_CLASS)
    setSessionEdits([])
  }

  // Build editable session rows for a class from the loaded timetable. Each
  // row's "length" is the per-unit base derived from the stored start→end, so a
  // single/double/triple keeps meaning without a class-level session length.
  const sessionsForClass = (classId) =>
    timetable
      .filter((e) => String(e.class_id) === String(classId))
      .sort(
        (a, b) =>
          DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week) ||
          String(a.start_time).localeCompare(String(b.start_time)),
      )
      .map((e) => {
        const type = e.session_type || 'single'
        const dur = toMinutes(e.end_time) - toMinutes(e.start_time)
        const base =
          type === 'custom' ? '' : Math.round(dur / multiplierFor(type)) || ''
        return {
          id: e.id,
          day_of_week: e.day_of_week,
          start_time: trimTime(e.start_time),
          end_time: trimTime(e.end_time),
          session_type: type,
          length: base,
          room: e.room || '',
          notes: e.notes || '',
        }
      })

  const updateSessionEdit = (idx, field, value) =>
    setSessionEdits((arr) =>
      arr.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    )

  // Open the shared Add Classes dialog (multi-row create + schedule).
  const openAddClasses = () => {
    setEditingClass(null)
    setAddOpen(true)
  }

  const openEditClass = (cls) => {
    setEditingClass(cls)
    setAddOpen(true)
    setClassForm({
      class_name: cls.class_name || '',
      subject: cls.subject || '',
      grade_level: cls.grade_level || '',
      student_count: cls.student_count || 25,
      examination_body: cls.examination_body || '',
      room: cls.room || '',
      proficiency:
        cls.proficiency && cls.proficiency !== 'Mixed proficiency'
          ? cls.proficiency
          : '',
      color: cls.color || '',
      // Carried through (not shown in the form) so saving never blanks the DB
      // columns; length/type are now edited per session below.
      standard_session_length: cls.standard_session_length || 60,
      session_type: cls.session_type || 'double',
      academic_year: cls.academic_year || new Date().getFullYear(),
      term: cls.term || 'Term 1',
      class_time: cls.class_time || '09:00:00',
    })
    setSessionEdits(sessionsForClass(cls.id))
  }

  // Save an edit to an existing class (create now happens via the multi-row
  // flow below).
  const saveClass = async () => {
    try {
      // Window guard: no session may end after 10:00 PM (22:00).
      for (const s of sessionEdits) {
        if (s.session_type === 'custom') continue
        const len = parseInt(s.length, 10) || getBaseLen(editingClass.id)
        const end =
          toMinutes(s.start_time) + multiplierFor(s.session_type) * len
        if (end > SCHEDULE_MAX_MIN) {
          enqueueSnackbar(
            `${s.day_of_week} session would end after 10:00 PM — choose an earlier start or a shorter session.`,
            { variant: 'error' },
          )
          return
        }
      }

      await toolAxios.put(
        `/api/timetables/classes/${editingClass.id}`,
        classForm,
      )

      // Save each session's day/time/length/type. End time is recomputed from
      // start + (type multiplier × length); custom keeps its explicit end.
      for (const s of sessionEdits) {
        let end_time = s.end_time
        if (s.session_type !== 'custom') {
          const len = parseInt(s.length, 10) || getBaseLen(editingClass.id)
          end_time = fmtTime(
            toMinutes(s.start_time) + multiplierFor(s.session_type) * len,
          )
        }
        await toolAxios.put(`/api/timetables/${s.id}`, {
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time,
          notes: s.notes,
          session_type: s.session_type,
          room: s.room,
        })
      }

      enqueueSnackbar('Class updated', { variant: 'success' })
      setEditingClass(null)
      setClassForm(EMPTY_CLASS)
      setSessionEdits([])
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
      suppressClickRef.current = !!(d && d.moved)
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
        room: d.entry.room || '',
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

  // Every edited session needs a start time, and a custom one needs an end
  // after its start — otherwise the Update button is disabled.
  const sessionsValid = sessionEdits.every(
    (s) =>
      s.start_time &&
      (s.session_type !== 'custom' ||
        (s.end_time && toMinutes(s.end_time) > toMinutes(s.start_time))),
  )

  // Edit-class form, rendered inside AddClassesDialog so add/list/edit share
  // one modal (mirrors the tool). Cancel Edit (closeClassDialog) and Update
  // (saveClass) clear editingClass but keep addOpen, so both fall back to the
  // add + list view instead of closing.
  const editFormContent = (
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
        <Autocomplete
          options={subjectOptions}
          value={classForm.subject || null}
          onChange={(e, v) =>
            setClassForm({ ...classForm, subject: v || '' })
          }
          renderInput={(params) => (
            <TextField {...params} fullWidth label="Subject" />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Autocomplete
          options={gradeOptions}
          value={classForm.grade_level || null}
          onChange={(e, v) =>
            setClassForm({ ...classForm, grade_level: v || '' })
          }
          renderInput={(params) => (
            <TextField {...params} fullWidth label="Grade Level" />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
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
          required
          label="Proficiency of Students"
          placeholder="e.g. mixed levels, mostly beginners, advanced"
          value={classForm.proficiency}
          onChange={(e) =>
            setClassForm({ ...classForm, proficiency: e.target.value })
          }
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Examination Body"
          value={classForm.examination_body || ''}
          onChange={(e) =>
            setClassForm({
              ...classForm,
              examination_body: e.target.value,
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          {EXAMINATION_BODIES.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, mb: 1, color: 'text.secondary' }}
        >
          Colour
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {CLASS_COLORS.map((c) => {
            const selected =
              (classForm.color || '').toUpperCase() === c.toUpperCase()
            return (
              <Box
                key={c}
                component="button"
                type="button"
                onClick={() => setClassForm({ ...classForm, color: c })}
                title={c}
                aria-label={`Set class colour ${c}`}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  p: 0,
                  cursor: 'pointer',
                  bgcolor: c,
                  border: selected ? '2px solid #263238' : '1px solid #d0d0d0',
                  outline: selected ? '2px solid #fff' : 'none',
                  outlineOffset: '-4px',
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.12)' },
                }}
              />
            )
          })}
        </Stack>
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
        >
          Shown on the timetable blocks for this class.
        </Typography>
      </Grid>
      {/* Sessions — day/time/length/type are edited per session here,
                  not on the class. */}
      <Grid item xs={12}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Sessions
        </Typography>
        {sessionEdits.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This class isn&apos;t scheduled yet. Use “Add to Schedule” to place
            it on your timetable.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {sessionEdits.map((s, idx) => (
              <Paper key={s.id} variant="outlined" sx={{ p: 1.5 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={6} sm={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Day"
                      value={s.day_of_week}
                      onChange={(e) =>
                        updateSessionEdit(idx, 'day_of_week', e.target.value)
                      }
                    >
                      {DAYS.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      min="06:00"
                      max="22:00"
                      label="Start"
                      InputLabelProps={{ shrink: true }}
                      value={s.start_time}
                      onChange={(e) =>
                        updateSessionEdit(idx, 'start_time', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Session Type"
                      value={s.session_type}
                      onChange={(e) =>
                        updateSessionEdit(idx, 'session_type', e.target.value)
                      }
                    >
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="double">Double</MenuItem>
                      <MenuItem value="triple">Triple</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    {s.session_type === 'custom' ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="time"
                        min="06:00"
                        max="22:00"
                        label="End"
                        InputLabelProps={{ shrink: true }}
                        value={s.end_time}
                        onChange={(e) =>
                          updateSessionEdit(idx, 'end_time', e.target.value)
                        }
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Duration (min)"
                        value={
                          multiplierFor(s.session_type) *
                          (parseInt(s.length, 10) || 0)
                        }
                        InputProps={{ readOnly: true }}
                        helperText={
                          s.start_time
                            ? `ends ${to12h(
                                fmtTime(
                                  toMinutes(s.start_time) +
                                    multiplierFor(s.session_type) *
                                      (parseInt(s.length, 10) || 0),
                                ),
                              )} · ${parseInt(s.length, 10) || 0}-min base`
                            : 'Set on your profile'
                        }
                        inputProps={{ min: 10, max: 120 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Room"
                      value={s.room}
                      onChange={(e) =>
                        updateSessionEdit(idx, 'room', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={4} sm={1}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {s.session_type !== 'custom' && s.start_time && s.length
                        ? `→ ${fmtTimeDisplay(
                            toMinutes(s.start_time) +
                              multiplierFor(s.session_type) *
                                (parseInt(s.length, 10) || 0),
                          )}`
                        : ''}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        )}
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={closeClassDialog}>
            Cancel Edit
          </Button>
          <Button
            variant="contained"
            sx={{ color: '#fff' }}
            onClick={saveClass}
            disabled={
              !classForm.class_name ||
              !classForm.subject ||
              !classForm.grade_level ||
              !String(classForm.proficiency || '').trim() ||
              !(parseInt(classForm.student_count, 10) > 0) ||
              !sessionsValid
            }
          >
            Update Class
          </Button>
        </Stack>
      </Grid>
    </Grid>
  )

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
                onClick={openAddClasses}
              >
                Add Classes
              </Button>
              {/* Add to Schedule temporarily hidden (kept for easy re-enable — flip false → true). */}
              {false && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddEntry}
                  sx={{ color: '#fff' }}
                >
                  Add to Schedule
                </Button>
              )}

              {/* Teaching Environment — same modal surfaced on the dashboard. */}
              <Button
                variant="contained"
                startIcon={<RoomIcon />}
                onClick={() => setEnvironmentOpen(true)}
                sx={{ color: '#fff' }}
              >
                Set School Settings and Surroundings
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
                              title={`Add a class on ${day} at ${fmtTimeDisplay(
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
                        // Per-class colour: soft tint + left accent bar. The
                        // amber "needs setup" bar wins over the colour bar.
                        const blockColor = isHexColor(entry.color)
                          ? entry.color.trim()
                          : null
                        return (
                          <Paper
                            key={entry.id}
                            variant="outlined"
                            onPointerDown={(e) => beginDrag(e, entry)}
                            onClick={() => {
                              if (suppressClickRef.current) {
                                suppressClickRef.current = false
                                return
                              }
                              setViewEntry(entry)
                            }}
                            sx={{
                              position: 'absolute',
                              left: 2,
                              right: 2,
                              zIndex: 1,
                              p: 0.75,
                              overflow: 'hidden',
                              containerType: 'size',
                              '& .MuiTypography-root': {
                                fontSize: 'clamp(9px, 13cqh, 12px)',
                                lineHeight: 1.15,
                              },
                              display: 'flex',
                              flexDirection: 'column',
                              bgcolor: blockColor
                                ? `${blockColor}1A`
                                : '#eef2ff',
                              borderColor: blockColor || '#c7d2fe',
                              userSelect: 'none',
                              cursor: canEdit ? 'grab' : 'default',
                              opacity: beingDragged ? 0.4 : 1,
                              ...(blockColor
                                ? { borderLeft: `4px solid ${blockColor}` }
                                : {}),
                            }}
                            style={{ top, height }}
                          >
                            {canEdit && (
                              <IconButton
                                size="small"
                                title="Duplicate"
                                aria-label="Duplicate"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDuplicateEntry(entry)
                                }}
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
                                fontSize: 'clamp(10px, 16cqh, 13.5px)',
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
                              {to12h(entry.start_time)}–{to12h(entry.end_time)}
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
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{ mt: 'auto', pt: 0.25 }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Typography
                                variant="caption"
                                onClick={() => planLesson(entry)}
                                sx={{
                                  color: 'success.main',
                                  cursor: 'pointer',
                                  fontWeight: 500,
                                  '&:hover': { textDecoration: 'underline' },
                                }}
                              >
                                Plan
                              </Typography>
                              {canEdit && (
                                <>
                                  <Typography
                                    variant="caption"
                                    onClick={() => openEditEntry(entry)}
                                    sx={{
                                      color: 'primary.main',
                                      cursor: 'pointer',
                                      fontWeight: 500,
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
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
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    Remove
                                  </Typography>
                                </>
                              )}
                            </Stack>
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
            {fmtTimeDisplay(drag.previewStartMin)}–
            {fmtTimeDisplay(drag.previewStartMin + drag.durationMin)}
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
                You have no classes yet. Use “Add Classes” to create one first.
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
              label="Session Type"
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
                min="06:00"
                max="22:00"
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
                min="06:00"
                max="22:00"
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
              label="Room (optional)"
              placeholder="e.g., 2D or Lab 1"
              value={entryForm.room}
              onChange={(e) =>
                setEntryForm({ ...entryForm, room: e.target.value })
              }
            />

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

      {/* ---------- Read-only session view (click a timetable block) ---------- */}
      <Dialog
        open={!!viewEntry}
        onClose={() => setViewEntry(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {viewEntry?.class_name}
              </Typography>
              {viewEntry?.subject && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {viewEntry.subject}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setViewEntry(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {viewEntry && (
            <Grid container spacing={2}>
              {[
                ['Day', viewEntry.day_of_week],
                [
                  'Session Type',
                  (viewEntry.session_type || 'single').replace(/^\w/, (c) =>
                    c.toUpperCase(),
                  ),
                ],
                ['Start Time', to12h(trimTime(viewEntry.start_time))],
                ['End Time', to12h(trimTime(viewEntry.end_time))],
                [
                  'Duration',
                  `${
                    toMinutes(viewEntry.end_time) -
                    toMinutes(viewEntry.start_time)
                  } min`,
                ],
                ['Room', viewEntry.room || '—'],
              ].map(([label, value]) => (
                <Grid item xs={6} key={label}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block' }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          )}
          {viewEntry &&
            (syllabusMap[(viewEntry.subject || '').trim().toLowerCase()] || [])
              .length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  Syllabus
                </Typography>
                <Stack spacing={0.5} alignItems="flex-start">
                  {(
                    syllabusMap[
                      (viewEntry.subject || '').trim().toLowerCase()
                    ] || []
                  ).map((name) => (
                    <Button
                      key={name}
                      size="small"
                      variant="text"
                      onClick={() => {
                        const subj = viewEntry.subject
                        setViewEntry(null)
                        navigate('/dashboard/syllabuses', {
                          state: { subject: subj },
                        })
                      }}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                        p: 0.25,
                        minWidth: 0,
                      }}
                    >
                      {name} →
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
        </DialogContent>
        <DialogActions>
          {canEdit && (
            <Button
              onClick={() => {
                const cls = classes.find(
                  (c) => String(c.id) === String(viewEntry.class_id),
                )
                setViewEntry(null)
                if (cls) openEditClass(cls)
              }}
            >
              Edit
            </Button>
          )}
          <Button
            variant="contained"
            sx={{ color: '#fff' }}
            onClick={() => setViewEntry(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shared Add Classes dialog (create + schedule, multi-session) */}
      <AddClassesDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false)
          closeClassDialog()
        }}
        onAdded={fetchData}
        showExisting
        classes={classes}
        editingClass={editingClass}
        editFormContent={editFormContent}
        onEditClass={(cls) => openEditClass(cls)}
        onDeleteClass={deleteClass}
      />

      {/* ---------- Excel Import ---------- */}
      <TimetableImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchData}
      />
      <TeachingEnvironmentModal
        open={environmentOpen}
        onClose={() => setEnvironmentOpen(false)}
      />
    </Page>
  )
}

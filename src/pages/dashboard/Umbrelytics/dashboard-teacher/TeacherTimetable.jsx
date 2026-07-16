import { useState, useEffect } from 'react'
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
} from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import Page from '../../../../components/Page'
import toolAxios from 'src/_apis_/toolAxios'
import { useSearchParams } from 'react-router-dom'
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const EMPTY_ENTRY = {
  class_id: '',
  day_of_week: 'Monday',
  start_time: '',
  end_time: '',
  notes: '',
}

const EMPTY_CLASS = {
  class_name: '',
  subject: '',
  grade_level: '',
  student_count: 25,
  room: '',
  proficiency: 'Mixed proficiency',
  standard_session_length: 40,
  session_type: 'single',
  academic_year: new Date().getFullYear(),
  term: 'Term 1',
  class_time: '9:00 AM',
}

// TIME (HH:MM:SS) from DB -> HH:MM for the <input type="time">
const trimTime = (t) => (t ? t.slice(0, 5) : '')

export default function TeacherTimetable() {
  const { enqueueSnackbar } = useSnackbar()

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

  // ---------- Schedule entry handlers ----------
  const openAddEntry = () => {
    setEditingEntry(null)
    setEntryForm(EMPTY_ENTRY)
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
    })
    setEntryDialog(true)
  }

  const saveEntry = async () => {
    try {
      if (editingEntry) {
        await toolAxios.put(`/api/timetables/${editingEntry.id}`, {
          day_of_week: entryForm.day_of_week,
          start_time: entryForm.start_time,
          end_time: entryForm.end_time,
          notes: entryForm.notes,
        })
        enqueueSnackbar('Schedule updated', { variant: 'success' })
      } else {
        await toolAxios.post('/api/timetables', entryForm)
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
      standard_session_length: cls.standard_session_length || 40,
      session_type: cls.session_type || 'single',
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
          <Stack direction="row" spacing={1.5}>
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
        </Stack>

        {/* Weekly grid */}
        <Grid container spacing={2}>
          {DAYS.map((day) => (
            <Grid item xs={12} sm={6} md={2.4} key={day}>
              <Card sx={{ height: '100%' }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {day}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 1.5 }}>
                  {getClassesForDay(day).length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.disabled',
                        fontStyle: 'italic',
                        py: 2,
                        textAlign: 'center',
                      }}
                    >
                      No classes
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {getClassesForDay(day).map((entry) => (
                        <Paper
                          key={entry.id}
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'grey.50' }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {trimTime(entry.start_time)} -{' '}
                            {trimTime(entry.end_time)}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {entry.class_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: 'text.secondary' }}
                          >
                            {entry.subject} • {entry.grade_level}
                          </Typography>
                          {entry.room && (
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', color: 'text.disabled' }}
                            >
                              Room: {entry.room}
                            </Typography>
                          )}
                          {entry.notes && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: 'text.disabled',
                                fontStyle: 'italic',
                                mt: 0.5,
                              }}
                            >
                              {entry.notes}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditEntry(entry)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Weekly summary */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Weekly Summary
            </Typography>
            <Grid container spacing={2} sx={{ textAlign: 'center' }}>
              {DAYS.map((day) => (
                <Grid item xs={6} sm={2} key={day}>
                  <Typography variant="h4" color="primary">
                    {getClassesForDay(day).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
              <Grid item xs={12} sm={2}>
                <Typography variant="h4" sx={{ color: '#764ba2' }}>
                  {timetable.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total / Week
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

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
                label="End Time"
                InputLabelProps={{ shrink: true }}
                value={entryForm.end_time}
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
            disabled={!editingEntry && !entryForm.class_id}
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
                    standard_session_length: parseInt(e.target.value, 10) || 40,
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
    </Page>
  )
}

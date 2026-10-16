import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  MenuItem,
  Chip,
  CircularProgress,
} from '@material-ui/core'
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import Page from '../../../../components/Page'
import toolAxios from 'src/_apis_/toolAxios'
import { uploadFile } from 'src/services/storageService' // Firebase upload — see note in chat

// Website (MUI) version of the tool's Action Research page. All data goes
// through toolAxios to the same tool endpoints, so it stays in sync with the
// tool. "Open" on a research lesson deep-links into the tool's saved lessons.

const TOOL_URL = process.env.REACT_APP_TOOL_URL || 'http://localhost:3001'

export default function TeacherActionResearch() {
  const { enqueueSnackbar } = useSnackbar()

  const [thesis, setThesis] = useState('')
  const [methodology, setMethodology] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notes, setNotes] = useState([])
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [classes, setClasses] = useState([])
  const [noteClassId, setNoteClassId] = useState('')

  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const [researchLessons, setResearchLessons] = useState([])

  const loadResearch = () =>
    toolAxios
      .get('/api/teachers/research')
      .then((r) => {
        setThesis(r.data.data.research_thesis || '')
        setMethodology(r.data.data.research_methodology || '')
      })
      .catch((e) => console.log('Failed to load research', e))
      .finally(() => setLoading(false))

  const loadNotes = () =>
    toolAxios
      .get('/api/teachers/research-notes')
      .then((r) => setNotes(r.data.data || []))
      .catch((e) => console.log('Failed to load notes', e))

  const loadFiles = () =>
    toolAxios
      .get('/api/teachers/research-files')
      .then((r) => setFiles(r.data.data || []))
      .catch((e) => console.log('Failed to load files', e))

  const loadLessons = () =>
    toolAxios
      .get('/api/lessons/research/list')
      .then((r) => setResearchLessons(r.data.data || []))
      .catch((e) => console.log('Failed to load research lessons', e))

  const loadClasses = () =>
    toolAxios
      .get('/api/timetables/classes')
      .then((r) => setClasses(r.data.data || []))
      .catch((e) => console.log('Failed to load classes', e))

  useEffect(() => {
    loadResearch()
    loadNotes()
    loadFiles()
    loadLessons()
    loadClasses()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await toolAxios.put('/api/teachers/research', {
        research_thesis: thesis,
        research_methodology: methodology,
      })
      enqueueSnackbar('Saved', { variant: 'success' })
    } catch (e) {
      enqueueSnackbar('Save failed', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async () => {
    try {
      if (editingId) {
        await toolAxios.put(`/api/teachers/research-notes/${editingId}`, {
          title: noteTitle,
          content: noteContent,
          class_id: noteClassId || null,
        })
      } else {
        await toolAxios.post('/api/teachers/research-notes', {
          title: noteTitle,
          content: noteContent,
          class_id: noteClassId || null,
        })
      }
      setNoteTitle('')
      setNoteContent('')
      setNoteClassId('')
      setEditingId(null)
      loadNotes()
    } catch (e) {
      enqueueSnackbar('Save note failed', { variant: 'error' })
    }
  }

  const startEdit = (note) => {
    setEditingId(note.id)
    setNoteTitle(note.title || '')
    setNoteContent(note.content)
    setNoteClassId(note.class_id || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteClassId('')
  }

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return
    try {
      await toolAxios.delete(`/api/teachers/research-notes/${id}`)
      loadNotes()
    } catch (e) {
      console.log('Delete failed', e)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadFile(file) // → Firebase
      await toolAxios.post('/api/teachers/research-files', {
        file_name: file.name,
        file_url: url,
        file_type: file.type,
      })
      loadFiles()
    } catch (err) {
      console.log('Upload failed', err)
      enqueueSnackbar('Upload failed. Please try again.', { variant: 'error' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Remove this file?')) return
    try {
      await toolAxios.delete(`/api/teachers/research-files/${id}`)
      loadFiles()
    } catch (e) {
      console.log('Delete failed', e)
    }
  }

  if (loading) {
    return (
      <Page title="Action Research | Umbrelytics">
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    )
  }

  return (
    <Page title="Action Research | Umbrelytics">
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Action Research</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Record your research thesis, methodology, notes, and supporting
            files.
          </Typography>
        </Box>

        {/* Thesis + Methodology */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2.5}>
              <TextField
                label="Research Thesis / Hypothesis"
                multiline
                rows={4}
                fullWidth
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                placeholder="State the thesis or hypothesis guiding your action research…"
              />
              <TextField
                label="Research Methodology"
                multiline
                rows={5}
                fullWidth
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="Describe your methodology — data collection, cycles, measures…"
              />
              <Box>
                <Button
                  variant="contained"
                  sx={{ color: '#fff' }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Notebook */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Research Notebook
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                label="Note title (optional)"
                fullWidth
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <TextField
                label="Note"
                multiline
                rows={3}
                fullWidth
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Record a note, finding, or observation…"
              />
              <TextField
                select
                label="Attach a class (optional)"
                fullWidth
                value={noteClassId}
                onChange={(e) => setNoteClassId(e.target.value)}
              >
                <MenuItem value="">
                  <em>No class (general note)</em>
                </MenuItem>
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.class_name}
                    {c.subject ? ` — ${c.subject}` : ''}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  sx={{ color: '#fff' }}
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim()}
                >
                  {editingId ? 'Update Note' : 'Add Note'}
                </Button>
                {editingId && (
                  <Button color="inherit" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {notes.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                No notes yet. Add your first above.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {notes.map((note) => (
                  <Box
                    key={note.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        {note.title && (
                          <Typography variant="subtitle2">
                            {note.title}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}
                        >
                          {note.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.disabled',
                            display: 'block',
                            mt: 1,
                          }}
                        >
                          {new Date(note.created_at).toLocaleDateString()}
                          {note.updated_at !== note.created_at && ' (edited)'}
                        </Typography>
                        {note.class_name && (
                          <Chip
                            label={note.class_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => startEdit(note)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Research Lessons */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Research Lessons
            </Typography>
            {researchLessons.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                Lessons generated with action research enabled will appear here
                automatically.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {researchLessons.map((lesson) => (
                  <Box
                    key={lesson.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                        noWrap
                      >
                        {lesson.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled' }}
                      >
                        {lesson.subject}{' '}
                        {lesson.grade_level && `• ${lesson.grade_level}`} •{' '}
                        {new Date(lesson.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() =>
                        window.open(
                          `${TOOL_URL}/saved-lessons?open=${lesson.id}`,
                          '_blank',
                        )
                      }
                    >
                      Open
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Research Files</Typography>
              <Button
                variant="contained"
                component="label"
                sx={{ color: '#fff' }}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : 'Upload File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Button>
            </Stack>
            {files.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                No files uploaded yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {files.map((f) => (
                  <Box
                    key={f.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                        noWrap
                      >
                        {f.file_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled' }}
                      >
                        {new Date(f.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        href={f.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteFile(f.id)}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>
    </Page>
  )
}

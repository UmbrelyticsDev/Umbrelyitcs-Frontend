import { useState, useEffect } from 'react'
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Stack,
  Box,
  Typography,
  Chip,
  Divider,
} from '@material-ui/core'
import {
  MenuBook as NotebookIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import toolAxios from 'src/_apis_/toolAxios'

// Site-wide floating research notebook. Mount once in the dashboard layout so
// it appears on every teacher page. Shares the same research_notes store (and
// optional class attachment) as the tool's notebook and Action Research.
export default function FloatingNotebook() {
  const { enqueueSnackbar } = useSnackbar()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteClassId, setNoteClassId] = useState('')
  const [editingId, setEditingId] = useState(null)

  const loadNotes = () => {
    setLoading(true)
    toolAxios
      .get('/api/teachers/research-notes')
      .then((r) => setNotes(r.data.data || []))
      .catch((e) => console.log('Failed to load notes', e))
      .finally(() => setLoading(false))
  }

  const loadClasses = () =>
    toolAxios
      .get('/api/timetables/classes')
      .then((r) => setClasses(r.data.data || []))
      .catch((e) => console.log('Failed to load classes', e))

  // Load notes + classes each time the notebook opens
  useEffect(() => {
    if (open) {
      loadNotes()
      loadClasses()
    }
  }, [open])

  // Close on Escape (Dialog already handles this, but keep parity w/ the tool)
  const resetForm = () => {
    setEditingId(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteClassId('')
  }

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return
    try {
      const payload = {
        title: noteTitle,
        content: noteContent,
        class_id: noteClassId || null,
      }
      if (editingId) {
        await toolAxios.put(
          `/api/teachers/research-notes/${editingId}`,
          payload,
        )
      } else {
        await toolAxios.post('/api/teachers/research-notes', payload)
      }
      resetForm()
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

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return
    try {
      await toolAxios.delete(`/api/teachers/research-notes/${id}`)
      loadNotes()
    } catch (e) {
      enqueueSnackbar('Delete failed', { variant: 'error' })
    }
  }

  return (
    <>
      {/* Floating button */}
      <Fab
        color="primary"
        aria-label="Research Notebook"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
      >
        <NotebookIcon />
      </Fab>

      {/* Notebook dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          disableTypography
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Research Notebook</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Add / edit form */}
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              label="Note title (optional)"
              fullWidth
              size="small"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
            <TextField
              label="Note"
              multiline
              rows={3}
              fullWidth
              size="small"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Record a note, finding, or observation…"
            />
            <TextField
              select
              label="Attach a class (optional)"
              fullWidth
              size="small"
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
                <Button color="inherit" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Notes list */}
          {loading ? (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Loading…
            </Typography>
          ) : notes.length === 0 ? (
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
                        sx={{ color: 'text.disabled', display: 'block', mt: 1 }}
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
                        color="secondary"
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
        </DialogContent>
      </Dialog>
    </>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import toolAxios from 'src/_apis_/toolAxios'

// Mirrors the LPT's "Teaching Location & Context" modal, surfaced on the
// website dashboard as "Teaching Environment". Reads/writes the SAME tool field
// (teachers.teaching_location_context) via the tool API, so whatever is set
// here is exactly what the lesson-plan generator uses — no duplicate store.
export default function TeachingEnvironmentModal({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar()
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Pull the existing context when the modal opens.
  useEffect(() => {
    if (open) fetchContext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fetchContext = async () => {
    try {
      setFetching(true)
      const res = await toolAxios.get('/api/teachers/location-context')
      setContext(res.data?.data?.locationContext || '')
    } catch (e) {
      console.error('Error loading teaching environment:', e)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await toolAxios.put('/api/teachers/location-context', {
        locationContext: context,
      })
      enqueueSnackbar('Teaching environment saved', { variant: 'success' })
      onClose(true)
    } catch (e) {
      console.error('Error saving teaching environment:', e)
      enqueueSnackbar('Could not save teaching environment', {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Teaching Environment</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Describe your school&apos;s setting, community, and student context.
          The AI uses this when generating your lesson plans — tailoring
          examples, references and activities to your students&apos; world. Set
          it once; it applies to every lesson.
        </DialogContentText>
        {fetching ? (
          <CircularProgress />
        ) : (
          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder="e.g. A rural school in the hills outside Montego Bay serving mostly farming families. Limited internet access; strong oral-storytelling culture; students often help with family agriculture after school."
            value={context}
            inputProps={{ maxLength: 2000 }}
            helperText="Saved context is applied the next time you generate a lesson plan."
            onChange={(e) => setContext(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || fetching}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

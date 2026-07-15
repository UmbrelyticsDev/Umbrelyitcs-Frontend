import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

export default function TeachingPhilosophyModal({ open, onClose, teacherId }) {
  const { enqueueSnackbar } = useSnackbar()
  const [philosophy, setPhilosophy] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Fetch existing teacher data when modal opens
  useEffect(() => {
    if (open && teacherId) {
      fetchTeacherData()
    }
  }, [open, teacherId])

  const fetchTeacherData = async () => {
    try {
      setFetching(true)
      const response = await axios.get(
        `${REST_API_END_POINT}get-teacher-details-for-editing/${teacherId}`,
      )

      if (response.data.status === 1) {
        setPhilosophy(response.data.result?.teaching_philosophy || '')
        console.log(
          '✅ Philosophy loaded:',
          response.data.result?.teaching_philosophy,
        )
      }
    } catch (error) {
      console.error('Error fetching philosophy:', error)
      enqueueSnackbar('Error loading philosophy', { variant: 'error' })
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${REST_API_END_POINT}update-teacher/${teacherId}`,
        {
          values: {
            hodId: teacherId,
            teaching_philosophy: philosophy,
          },
        },
      )

      if (response.data.status === 1) {
        enqueueSnackbar('Philosophy updated successfully', {
          variant: 'success',
        })
        onClose()
        window.location.reload()
      } else {
        enqueueSnackbar('Failed to update philosophy', { variant: 'error' })
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Error updating philosophy', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Teaching Philosophy</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {fetching ? (
          <CircularProgress />
        ) : (
          <TextField
            fullWidth
            label="Teaching Philosophy"
            placeholder="Describe your teaching philosophy and approach..."
            multiline
            rows={5}
            value={philosophy}
            onChange={(e) => setPhilosophy(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
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

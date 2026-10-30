import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import { UploadAvatar } from 'src/components/upload'

export default function ProfilePictureModal({
  open,
  onClose,
  teacherId,
  currentImage,
  onImageUpdate,
}) {
  const { enqueueSnackbar } = useSnackbar()
  // `preview` drives the avatar display; `file` is the actual File we upload.
  const [preview, setPreview] = useState(currentImage)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleDropAvatar = useCallback((acceptedFiles) => {
    const picked = acceptedFiles[0]
    if (!picked) return
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }, [])

  const handleSave = async () => {
    if (!file) {
      enqueueSnackbar('Please choose an image first', { variant: 'warning' })
      return
    }
    try {
      setLoading(true)

      // Proxy upload: send the image to our backend, which stores it in R2 and
      // writes the public URL to teacher.image in one call.
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await axios.post(
        `${REST_API_END_POINT}upload/avatar/${teacherId}`,
        formData,
      )

      if (response.data.status === 1) {
        enqueueSnackbar('Profile picture updated successfully', {
          variant: 'success',
        })
        setPreview(response.data.url)
        onImageUpdate()
        onClose()
        window.location.reload()
      } else {
        enqueueSnackbar(
          response.data.message || 'Failed to update profile picture',
          { variant: 'error' },
        )
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Error updating profile picture', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Profile Picture</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Upload a new profile picture
          </Typography>
          <UploadAvatar
            accept="image/*"
            file={preview}
            maxSize={3145728}
            onDrop={handleDropAvatar}
            onDelete={() => {
              setPreview(null)
              setFile(null)
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || !file}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

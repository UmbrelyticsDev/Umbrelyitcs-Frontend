import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { storage } from 'src/firebase/Constant';
import { UploadAvatar } from 'src/components/upload';

export default function ProfilePictureModal({ open, onClose, teacherId, currentImage, onImageUpdate }) {
  const { enqueueSnackbar } = useSnackbar();
  const [avatarUrl, setAvatarUrl] = useState(currentImage);
  const [loading, setLoading] = useState(false);

  const handleDropAvatar = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadImgToFirebase(file);
    }
  }, []);

  const uploadImgToFirebase = (file) => {
    const storageRef = storage.ref(`images/${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        console.log('Upload is ' + ((snapshot.bytesTransferred / snapshot.totalBytes) * 100) + '% done');
      },
      (error) => {
        console.error('Upload failed:', error);
        enqueueSnackbar('Upload failed', { variant: 'error' });
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);
          setAvatarUrl(downloadURL);
        });
      }
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${REST_API_END_POINT}update-teacher/${teacherId}`,
        {
          values: {
            hodId: teacherId,
            avatarUrl: avatarUrl,
          },
        }
      );

      if (response.data.status === 1) {
        enqueueSnackbar('Profile picture updated successfully', { variant: 'success' });
        onImageUpdate();
        onClose();
        window.location.reload();
      } else {
        enqueueSnackbar('Failed to update profile picture', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error updating profile picture', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
            file={avatarUrl}
            maxSize={3145728}
            onDrop={handleDropAvatar}
            onDelete={() => setAvatarUrl(null)}
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
          disabled={loading || !avatarUrl}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
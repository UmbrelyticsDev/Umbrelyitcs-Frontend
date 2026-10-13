import { useState } from 'react'
import * as Yup from 'yup'
import { Form, FormikProvider, useFormik } from 'formik'
import { useSnackbar } from 'notistack'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  InputAdornment,
  Button,
} from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import { Icon } from '@iconify/react'
import eyeFill from '@iconify/icons-eva/eye-fill'
import eyeOffFill from '@iconify/icons-eva/eye-off-fill'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// Self-service "change my password" dialog for the signed-in teacher /
// independent educator. Collects current + new + confirm, then calls the
// authenticated backend endpoint which verifies the current password before
// rehashing the new one. The signed-in identity is taken from the JWT on the
// server, so no teacher id is sent from here.

export default function ChangePasswordModal({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const Schema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'Must be at least 8 characters')
      .notOneOf(
        [Yup.ref('currentPassword')],
        'New password must be different from the current one',
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your new password')
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
  })

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const token = localStorage.getItem('accessToken')
        const res = await axios.post(
          `${REST_API_END_POINT}change-teacher-password`,
          {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          },
          {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        )
        const status = res.data?.status
        if (status === 1) {
          enqueueSnackbar('Password changed successfully', {
            variant: 'success',
          })
          resetForm()
          onClose()
        } else if (status === 2) {
          enqueueSnackbar('Current password is incorrect', {
            variant: 'error',
          })
        } else if (status === 3) {
          enqueueSnackbar('New password must be at least 8 characters', {
            variant: 'error',
          })
        } else if (status === 4) {
          enqueueSnackbar(
            'New password must be different from the current one',
            { variant: 'warning' },
          )
        } else {
          enqueueSnackbar('Could not change password. Please try again.', {
            variant: 'error',
          })
        }
      } catch (e) {
        const status = e?.response?.data?.status
        if (status === 2) {
          enqueueSnackbar('Current password is incorrect', {
            variant: 'error',
          })
        } else if (e?.response?.status === 401 || e?.response?.status === 403) {
          enqueueSnackbar('Your session has expired. Please log in again.', {
            variant: 'error',
          })
        } else {
          enqueueSnackbar('Could not change password. Please try again.', {
            variant: 'error',
          })
        }
      } finally {
        setSubmitting(false)
      }
    },
  })

  const {
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    resetForm,
  } = formik

  const handleClose = () => {
    resetForm()
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                type={showCurrent ? 'text' : 'password'}
                label="Current Password"
                autoComplete="current-password"
                {...getFieldProps('currentPassword')}
                error={Boolean(
                  touched.currentPassword && errors.currentPassword,
                )}
                helperText={touched.currentPassword && errors.currentPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowCurrent((s) => !s)}
                      >
                        <Icon icon={showCurrent ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showNew ? 'text' : 'password'}
                label="New Password"
                autoComplete="new-password"
                {...getFieldProps('newPassword')}
                error={Boolean(touched.newPassword && errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowNew((s) => !s)}
                      >
                        <Icon icon={showNew ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showConfirm ? 'text' : 'password'}
                label="Confirm New Password"
                autoComplete="new-password"
                {...getFieldProps('confirmPassword')}
                error={Boolean(
                  touched.confirmPassword && errors.confirmPassword,
                )}
                helperText={touched.confirmPassword && errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowConfirm((s) => !s)}
                      >
                        <Icon icon={showConfirm ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Change Password
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  )
}

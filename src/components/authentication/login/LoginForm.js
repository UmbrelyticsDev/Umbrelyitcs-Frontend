import * as Yup from 'yup'
import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { useFormik, Form, FormikProvider } from 'formik'
import { Icon } from '@iconify/react'
import eyeFill from '@iconify/icons-eva/eye-fill'
import closeFill from '@iconify/icons-eva/close-fill'
import eyeOffFill from '@iconify/icons-eva/eye-off-fill'
// material
import {
  Link,
  Stack,
  Alert,
  TextField,
  IconButton,
  InputAdornment,
} from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
// routes
import { PATH_AUTH } from '../../../routes/paths'
// hooks
import useAuth from '../../../hooks/useAuth'
import useIsMountedRef from '../../../hooks/useIsMountedRef'
//
import { MIconButton } from '../../@material-extend'

// ----------------------------------------------------------------------

// Messages shown after the email-verification redirect (?verified=...)
const VERIFIED_MESSAGES = {
  pending: {
    severity: 'success',
    text: "Email verified. Your account is now awaiting approval — we'll email you the moment it's reviewed.",
  },
  already: { severity: 'info', text: 'Your email is already verified.' },
  expired: {
    severity: 'error',
    text: 'That verification link has expired. Please register again to get a new one.',
  },
  invalid: { severity: 'error', text: 'That verification link is invalid.' },
  error: {
    severity: 'error',
    text: 'Something went wrong verifying your email. Please try again.',
  },
}

export default function LoginForm() {
  const { login } = useAuth()
  const isMountedRef = useIsMountedRef()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()

  const verifiedKey = searchParams.get('verified')
  const verifiedInfo = verifiedKey ? VERIFIED_MESSAGES[verifiedKey] : null

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Email must be a valid email address')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
  })

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        await login(values.email, values.password)
        enqueueSnackbar('Login success', {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          ),
        })
        if (isMountedRef.current) {
          setSubmitting(false)
        }
      } catch (error) {
        console.error(error)
        const status = error?.response?.status
        const serverMsg =
          error?.response?.data?.error || error?.response?.data?.message
        // 403 = account-state gate (verify / under review / rejected) → show the real reason.
        // Anything else (401 bad credentials, etc.) → generic, no account enumeration.
        const message =
          status === 403 && serverMsg ? serverMsg : 'Invalid email or password.'
        if (isMountedRef.current) {
          setSubmitting(false)
          setErrors({ afterSubmit: message })
        }
      }
    },
  })

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik

  const handleShowPassword = () => {
    setShowPassword((show) => !show)
  }

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {verifiedInfo && (
            <Alert severity={verifiedInfo.severity}>{verifiedInfo.text}</Alert>
          )}
          {errors.afterSubmit && (
            <Alert severity="error">{errors.afterSubmit}</Alert>
          )}

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Email address"
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ my: 2 }}
        >
          <Link
            component={RouterLink}
            variant="subtitle2"
            to={PATH_AUTH.resetPassword}
          >
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Login
        </LoadingButton>
      </Form>
    </FormikProvider>
  )
}

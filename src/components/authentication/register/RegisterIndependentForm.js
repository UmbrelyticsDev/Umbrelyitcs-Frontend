import * as Yup from 'yup'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useSnackbar } from 'notistack'
import { useFormik, Form, FormikProvider } from 'formik'
import eyeFill from '@iconify/icons-eva/eye-fill'
import closeFill from '@iconify/icons-eva/close-fill'
import eyeOffFill from '@iconify/icons-eva/eye-off-fill'
// material
import {
  Grid,
  Stack,
  Step,
  Stepper,
  StepLabel,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
} from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
// hooks
import useAuth from '../../../hooks/useAuth'
import useIsMountedRef from '../../../hooks/useIsMountedRef'
// components
import { MIconButton } from '../../@material-extend'
import TurnstileWidget from './TurnstileWidget'

// Teaching-profile details are no longer collected at registration — new
// teachers enter them in the first-login onboarding gate. Registration is now
// just the account and consent.
const STEPS = ['Account', 'Review & consent']

const stepFields = [
  ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone'],
  ['acceptedTerms'],
]

// Bogus links for now — swap for the real pages when they exist.
const TERMS_URL = '#'
const PRIVACY_URL = '#'

RegisterIndependentForm.propTypes = { onRegistered: PropTypes.func.isRequired }

export default function RegisterIndependentForm({ onRegistered }) {
  const { registerIndependent } = useAuth()
  const isMountedRef = useIsMountedRef()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'Too short')
      .max(50, 'Too long')
      .required('First name is required'),
    lastName: Yup.string()
      .min(2, 'Too short')
      .max(50, 'Too long')
      .required('Last name is required'),
    email: Yup.string()
      .email('Enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'At least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    phone: Yup.string().required('Phone number is required'),
    acceptedTerms: Yup.bool().oneOf(
      [true],
      'You must accept the Terms and Privacy Policy',
    ),
  })

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      acceptedTerms: false,
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      if (!turnstileToken) {
        setErrors({ afterSubmit: 'Please complete the bot verification.' })
        setSubmitting(false)
        return
      }
      try {
        const res = await registerIndependent({
          fullName: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email,
          password: values.password,
          phone: values.phone,
          acceptedTerms: values.acceptedTerms,
          turnstileToken,
        })
        enqueueSnackbar(res?.message || 'Registration submitted', {
          variant: 'success',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          ),
        })
        if (isMountedRef.current) setSubmitting(false)
        onRegistered(values.email)
      } catch (error) {
        const msg =
          error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          error.message
        if (isMountedRef.current) {
          setErrors({ afterSubmit: msg })
          setSubmitting(false)
        }
      }
    },
  })

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    validateForm,
    setTouched,
    handleChange,
  } = formik

  const handleNext = async () => {
    const formErrors = await validateForm()
    const fields = stepFields[activeStep]
    if (fields.some((f) => formErrors[f])) {
      const t = { ...touched }
      fields.forEach((f) => {
        t[f] = true
      })
      setTouched(t)
      return
    }
    setActiveStep((s) => s + 1)
  }

  const handleBack = () => setActiveStep((s) => s - 1)
  const isLast = activeStep === STEPS.length - 1

  return (
    <FormikProvider value={formik}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        {errors.afterSubmit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.afterSubmit}
          </Alert>
        )}

        {activeStep === 0 && (
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First name"
                {...getFieldProps('firstName')}
                error={Boolean(touched.firstName && errors.firstName)}
                helperText={touched.firstName && errors.firstName}
              />
              <TextField
                fullWidth
                label="Last name"
                {...getFieldProps('lastName')}
                error={Boolean(touched.lastName && errors.lastName)}
                helperText={touched.lastName && errors.lastName}
              />
            </Stack>
            <TextField
              fullWidth
              type="email"
              label="Email address"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password"
                {...getFieldProps('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((p) => !p)}
                      >
                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
              />
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Confirm password"
                {...getFieldProps('confirmPassword')}
                error={Boolean(
                  touched.confirmPassword && errors.confirmPassword,
                )}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
            </Stack>
            <TextField
              fullWidth
              label="Phone number"
              {...getFieldProps('phone')}
              error={Boolean(touched.phone && errors.phone)}
              helperText={touched.phone && errors.phone}
            />
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack spacing={2}>
            <Typography variant="subtitle1">Review your details</Typography>
            <Grid container spacing={1} sx={{ typography: 'body2' }}>
              <Review
                label="Name"
                value={`${values.firstName} ${values.lastName}`.trim()}
              />
              <Review label="Email" value={values.email} />
              <Review label="Phone" value={values.phone} />
            </Grid>
            <Divider />
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptedTerms"
                  checked={values.acceptedTerms}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link href={TERMS_URL} target="_blank" rel="noopener">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href={PRIVACY_URL} target="_blank" rel="noopener">
                    Privacy Policy
                  </Link>
                  .
                </Typography>
              }
            />
            {touched.acceptedTerms && errors.acceptedTerms && (
              <Typography variant="caption" color="error">
                {errors.acceptedTerms}
              </Typography>
            )}
            <TurnstileWidget onToken={setTurnstileToken} />
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
          >
            Back
          </Button>
          {isLast ? (
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Create account
            </LoadingButton>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Stack>
      </Form>
    </FormikProvider>
  )
}

Review.propTypes = { label: PropTypes.string, value: PropTypes.node }
function Review({ label, value }) {
  return (
    <>
      <Grid item xs={4} sx={{ color: 'text.secondary' }}>
        {label}
      </Grid>
      <Grid item xs={8}>
        {value || '-'}
      </Grid>
    </>
  )
}

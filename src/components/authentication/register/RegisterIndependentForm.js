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
  Box,
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
import Autocomplete from '@material-ui/lab/Autocomplete'
// hooks
import useAuth from '../../../hooks/useAuth'
import useIsMountedRef from '../../../hooks/useIsMountedRef'
// components
import { MIconButton } from '../../@material-extend'
import TurnstileWidget from './TurnstileWidget'

const STEPS = ['Account', 'Teaching profile', 'Review & consent']

const stepFields = [
  ['fullName', 'email', 'password', 'confirmPassword', 'phone'],
  ['institution', 'country', 'location', 'subjects', 'gradeLevels'],
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
    fullName: Yup.string()
      .min(2, 'Too short')
      .max(100, 'Too long')
      .required('Full name is required'),
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
    institution: Yup.string().required('Institution is required'),
    country: Yup.string().required('Country is required'),
    location: Yup.string().required('Location (city / parish) is required'),
    subjects: Yup.array().min(1, 'Add at least one subject'),
    gradeLevels: Yup.array().min(1, 'Add at least one grade level'),
    teachingPhilosophy: Yup.string(),
    acceptedTerms: Yup.bool().oneOf(
      [true],
      'You must accept the Terms and Privacy Policy',
    ),
  })

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      institution: '',
      country: '',
      location: '',
      subjects: [],
      gradeLevels: [],
      teachingPhilosophy: '',
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
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          country: values.country,
          institution: values.institution,
          location: values.location,
          subjects: values.subjects,
          gradeLevels: values.gradeLevels,
          teachingPhilosophy: values.teachingPhilosophy || '',
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
    setFieldValue,
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
            <TextField
              fullWidth
              label="Full name"
              {...getFieldProps('fullName')}
              error={Boolean(touched.fullName && errors.fullName)}
              helperText={touched.fullName && errors.fullName}
            />
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
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Institution / School"
              {...getFieldProps('institution')}
              error={Boolean(touched.institution && errors.institution)}
              helperText={touched.institution && errors.institution}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Country"
                {...getFieldProps('country')}
                error={Boolean(touched.country && errors.country)}
                helperText={touched.country && errors.country}
              />
              <TextField
                fullWidth
                label="Location (city / parish)"
                {...getFieldProps('location')}
                error={Boolean(touched.location && errors.location)}
                helperText={touched.location && errors.location}
              />
            </Stack>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={values.subjects}
              onChange={(e, v) => setFieldValue('subjects', v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Subjects (type and press Enter)"
                  error={Boolean(touched.subjects && errors.subjects)}
                  helperText={touched.subjects && errors.subjects}
                />
              )}
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={values.gradeLevels}
              onChange={(e, v) => setFieldValue('gradeLevels', v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Grade levels (type and press Enter)"
                  error={Boolean(touched.gradeLevels && errors.gradeLevels)}
                  helperText={touched.gradeLevels && errors.gradeLevels}
                />
              )}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Teaching philosophy (optional)"
              {...getFieldProps('teachingPhilosophy')}
            />
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack spacing={2}>
            <Typography variant="subtitle1">Review your details</Typography>
            <Grid container spacing={1} sx={{ typography: 'body2' }}>
              <Review label="Full name" value={values.fullName} />
              <Review label="Email" value={values.email} />
              <Review label="Phone" value={values.phone} />
              <Review label="Institution" value={values.institution} />
              <Review
                label="Location"
                value={`${values.location}${
                  values.country ? `, ${values.country}` : ''
                }`}
              />
              <Review label="Subjects" value={values.subjects.join(', ')} />
              <Review label="Grades" value={values.gradeLevels.join(', ')} />
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

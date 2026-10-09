import * as Yup from 'yup'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import copyFill from '@iconify/icons-eva/copy-fill'
import { Form, FormikProvider, useFormik } from 'formik'
// material
import { LoadingButton } from '@material-ui/lab'
import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormHelperText,
  FormControlLabel,
  DialogActions,
  Button,
  Paper,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
// utils
import { fData } from '../../../../../../utils/formatNumber'
import fakeRequest from '../../../../../../utils/fakeRequest'
// routes
import { PATH_DASHBOARD } from '../../../../../../routes/paths'
//
import { UploadAvatar, UploadSingleFile } from 'src/components/upload'
import { CopyAllTwoTone, Email, LocationOn, Password } from '@material-ui/icons'
import CopyClipboard from 'src/components/CopyClipboard'
import { styled } from '@material-ui/styles'
import Logo from '../../../../../../images/jamaica-high-school-logo.jpg'
import Cover from '../../../../../../images/jamaica-high-school-cover.jpg'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
// import { uploadImgToFirebase } from 'src/firebase/Constant';
import { storage } from 'src/firebase/Constant'
// ----------------------------------------------------------------------

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      left: 12,
    },
    '&::after': {
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}))

AddSchoolForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
}

export default function AddSchoolForm({ isEdit, currentUser }) {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [logoImg, setLogoImg] = useState('')
  const [image, setImage] = useState('')
  const [data, setData] = useState([])
  const idData = useParams()
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const user = JSON.parse(localStorage.getItem('user'))
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'))
  const id = user.schoolId || idData.id || newSchoolId

  useEffect(() => {
    if (id) {
      fetchDataById()
    }
  }, [id])

  const fetchDataById = async () => {
    await axios
      .get(`${REST_API_END_POINT}getSchool-details/${id}`)
      .then((res) => {
        if (res.data.status === 1) {
          console.log(
            'dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            res.data.result,
          )
          setData(res.data.result)
        } else {
          console.log('not getting data')
          setData([])
        }
      })
      .catch((err) => console.log(err))
  }

  const NewUserSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .matches(
        /^[a-zA-Z\s]+$/,
        'Name should not contain numbers or special characters',
      )
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    location: Yup.string()
      .required('Location is required')
      .matches(
        /^(?=.*[a-zA-Z])[a-zA-Z0-9\s\W]*$/,
        'Location should contain at least one alphabet and may include numbers and special characters',
      )
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    email: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address')
      .test(
        'at-least-one-letter',
        'Email must contain at least one letter before @',
        (value) => {
          if (!value) return false
          const beforeAtSymbol = value.split('@')[0]
          return /[a-zA-Z]/.test(beforeAtSymbol)
        },
      ),
    contactname: Yup.string()
      .required('Point Of Contact Name is required')
      .matches(
        /^[a-zA-Z\s]+$/,
        'Point Of Contact Name should not contain numbers or special characters',
      )
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    contactemail: Yup.string()
      .required('Point Of Contact Email is required')
      .email('Email must be a valid email address')
      .test(
        'at-least-one-letter',
        'Email must contain at least one letter before @',
        (value) => {
          if (!value) return false
          const beforeAtSymbol = value.split('@')[0]
          return /[a-zA-Z]/.test(beforeAtSymbol)
        },
      ),
    password: Yup.string().required('Password is required'),
    hod:
      user_type === 1
        ? Yup.string()
            .required('HOD Number is required')
            .matches(
              /^\d+$/,
              'Only numbers are allowed, and no special characters like dot or dash',
            )
            .max(5, 'Only 5 digits allowed')
        : '',
    contactphone: Yup.string()
      .required('Point Of Contact Number is required')
      .matches(
        /^\d+$/,
        'Only numbers are allowed, and no special characters like dot or dash',
      )
      .min(10, '10 Numbers Should Be Typed')
      .max(10, 'More Than 10 Numbers Is Not Allowed'),
    contactdesignation: Yup.string()
      .required('Point Of Contact Designation is required')
      .matches(
        /^[a-zA-Z\s]+$/,
        'Point Of Contact Designation should not contain numbers or special characters',
      )
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    department:
      user_type === 1
        ? Yup.string()
            .required('Department Number is required')
            .matches(
              /^\d+$/,
              'Only numbers are allowed, and no special characters like dot or dash',
            )
            .max(5, 'Only 5 digits allowed')
        : '',
    teacher:
      user_type === 1
        ? Yup.string()
            .required('Teacher Number is required')
            .matches(
              /^\d+$/,
              'Only numbers are allowed, and no special characters like dot or dash',
            )
            .max(5, 'Only 5 digits allowed')
        : '',
    // TODO (deferred): reinstate required validation once image upload is wired up
    avatarUrl: Yup.mixed().nullable(),
    cover: Yup.mixed().nullable(),
  })

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: isEdit ? data?.school_name || '' : '',
      location: isEdit ? data?.location || '' : '',
      email: isEdit ? data?.school_email || '' : '',
      contactname: isEdit ? data?.contact_name || '' : '',
      contactemail: isEdit ? data?.contact_email || '' : '',
      contactphone: isEdit ? data?.contact_phoneNumber || '' : '',
      contactdesignation: isEdit ? data?.contact_designation || '' : '',
      password: isEdit ? data?.school_password || '' : '',
      hod: isEdit ? data?.no_of_hod || '' : '',
      teacher: isEdit ? data?.no_of_teacher || '' : '',
      department: isEdit ? data?.no_of_dept || '' : '',
      avatarUrl: isEdit ? data?.school_logo || null : null,
      isVerified: isEdit ? data?.verified || false : false,
      cover: isEdit ? data?.school_image || null : null,
      logo: isEdit ? logoImg : null,
      image: isEdit ? image : null,
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        // await fakeRequest(500);
        // console.log('Form Values :',values);
        // resetForm();
        // setSubmitting(false);
        // enqueueSnackbar(user_type === 1 ? 'School Added Successfully' : user_type === 2 ? 'Profile Updated successfully' : '', { variant: 'success' });
        // user_type === 1 ? navigate(PATH_DASHBOARD.general.schools) : user_type === 2 ? navigate(PATH_DASHBOARD.general.schoolDetails) : ''
        let teacherLimit =
          (data.no_of_teacher * data.department_count) / data.department_count
        let hodLimit =
          (data.no_of_hod * data.department_count) / data.department_count

        if (values.department < data.department_count && isEdit) {
          enqueueSnackbar(
            `No.of department sould not less than ${data.department_count}`,
            { variant: 'warning' },
          )
        } else if (values.teacher < teacherLimit && isEdit) {
          enqueueSnackbar(`No.of teacher sould not less than ${teacherLimit}`, {
            variant: 'warning',
          })
        } else if (values.hod < hodLimit && isEdit) {
          enqueueSnackbar(`No.of hod sould not less than ${hodLimit}`, {
            variant: 'warning',
          })
        } else {
          axios
            .post(
              `${REST_API_END_POINT}${
                id && isEdit ? `edit-School-details/` + id : 'addSchool'
              }`,
              { values },
            )
            .then((res) => {
              if (res.data.status === 2) {
                enqueueSnackbar(`Account Already Exist with ${values.email}`, {
                  variant: 'warning',
                })
              } else if (res.data.status === 1) {
                if (id) {
                  enqueueSnackbar(
                    user_type === 1
                      ? 'School Updated Successfully'
                      : user_type === 2
                      ? 'Profile Updated successfully'
                      : '',
                    { variant: 'success' },
                  )
                  user_type === 1
                    ? navigate(PATH_DASHBOARD.general.schools)
                    : user_type === 2
                    ? //  navigate(PATH_DASHBOARD.general.schoolDetails)
                      window.location.reload()
                    : ''
                  return
                }
                enqueueSnackbar(
                  user_type === 1
                    ? 'School Added Successfully'
                    : user_type === 2
                    ? 'Profile Updated successfully'
                    : '',
                  { variant: 'success' },
                )
                user_type === 1
                  ? navigate(PATH_DASHBOARD.general.schools)
                  : user_type === 2
                  ? navigate(PATH_DASHBOARD.general.schoolDetails)
                  : ''
              } else {
                enqueueSnackbar(
                  user_type === 1
                    ? 'School Not Added'
                    : user_type === 2
                    ? 'Profile Not Updated '
                    : '',
                  { variant: 'warning' },
                )
              }
            })
            .catch((err) => console.log('err', err))
        }
      } catch (error) {
        console.error(error)
        setSubmitting(false)
        setErrors(error)
      }
    },
  })

  const {
    errors,
    values,
    touched,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    getFieldProps,
  } = formik

  const handleDropAvatar = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        uploadImgToFirebase(file, 1)
        // setFieldValue('avatarUrl', {
        //   ...file,
        //   preview: URL.createObjectURL(file)
        // });
      }
    },
    [setFieldValue],
  )

  const uploadImgToFirebase = (file, num) => {
    // Create a storage reference
    const storageRef = storage.ref(`images/${file.name}`)

    // Upload the file
    const uploadTask = storageRef.put(file)

    // Monitor upload progress
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log('Upload is ' + progress + '% done')
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Upload failed:', error)
      },
      () => {
        // Handle successful uploads on complete
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL)
          if (num === 1) {
            // setLogoImg(downloadURL);
            setFieldValue('avatarUrl', downloadURL)
          } else {
            // setImage(downloadURL);
            setFieldValue('cover', downloadURL)
          }
        })
      },
    )
  }

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        uploadImgToFirebase(file, 2)
        // setFieldValue('cover', {
        //   ...file,
        //   preview: URL.createObjectURL(file)
        // });
      }
    },
    [setFieldValue],
  )

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="School Name"
                    {...getFieldProps('name')}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <TextField
                    fullWidth
                    placeholder="Location"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                    {...getFieldProps('location')}
                    error={Boolean(touched.location && errors.location)}
                    helperText={touched.location && errors.location}
                  />
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <CopyClipboard
                    label="School Email"
                    placeholder="School Email"
                    value={values.email}
                    onChange={(e) => setFieldValue('email', e.target.value)}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <CopyClipboard
                    label="School Password"
                    placeholder="School Password"
                    value={values.password}
                    onChange={(e) => setFieldValue('password', e.target.value)}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Stack>

                {user_type === 1 ? (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Number Of HODs"
                      {...getFieldProps('hod')}
                      InputProps={{
                        type: 'number',
                        inputProps: {
                          min: '0',
                        },
                      }}
                      error={Boolean(touched.hod && errors.hod)}
                      helperText={touched.hod && errors.hod}
                    />
                    <TextField
                      fullWidth
                      label="Number Of Teachers"
                      {...getFieldProps('teacher')}
                      InputProps={{
                        type: 'number',
                        inputProps: {
                          min: '0',
                        },
                      }}
                      error={Boolean(touched.teacher && errors.teacher)}
                      helperText={touched.teacher && errors.teacher}
                    />
                    <TextField
                      fullWidth
                      label="Number Of Departments"
                      {...getFieldProps('department')}
                      InputProps={{
                        type: 'number',
                        inputProps: {
                          min: '0',
                        },
                      }}
                      error={Boolean(touched.department && errors.department)}
                      helperText={touched.department && errors.department}
                    />
                  </Stack>
                ) : (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 3, sm: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Number Of HODs"
                      {...getFieldProps('hod')}
                      InputProps={{
                        type: 'number',
                        inputProps: {
                          min: '0',
                        },
                      }}
                      error={Boolean(touched.hod && errors.hod)}
                      helperText={touched.hod && errors.hod}
                    />
                    <TextField
                      fullWidth
                      label="Number Of Teachers"
                      {...getFieldProps('teacher')}
                      InputProps={{
                        type: 'number',
                        inputProps: {
                          min: '0',
                        },
                      }}
                      error={Boolean(touched.teacher && errors.teacher)}
                      helperText={touched.teacher && errors.teacher}
                    />
                    <TextField
                      fullWidth
                      label="Number Of Departments"
                      {...getFieldProps('department')}
                      InputProps={{
                        type: 'number',
                        inputProps: {
                          min: '0',
                        },
                      }}
                      error={Boolean(touched.department && errors.department)}
                      helperText={touched.department && errors.department}
                    />
                  </Stack>
                )}
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  Point Of Contact
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Contact Name"
                    {...getFieldProps('contactname')}
                    error={Boolean(touched.contactname && errors.contactname)}
                    helperText={touched.contactname && errors.contactname}
                  />
                  <TextField
                    fullWidth
                    placeholder="Contact Email"
                    {...getFieldProps('contactemail')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                    error={Boolean(touched.contactemail && errors.contactemail)}
                    helperText={touched.contactemail && errors.contactemail}
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 3, sm: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Contact Phone Number"
                    {...getFieldProps('contactphone')}
                    InputProps={{
                      inputProps: {
                        min: '0',
                      },
                      type: 'tel',
                    }}
                    onInput={(e) => {
                      // Remove any non-digit characters
                      e.target.value = e.target.value.replace(/\D/g, '')

                      // Restrict length to 10 digits
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10)
                      }

                      // Prevent exactly ten 0s
                      if (e.target.value === '0000000000') {
                        e.target.value = '' // Clear the input if it is all zeros
                      }
                    }}
                    error={Boolean(touched.contactphone && errors.contactphone)}
                    helperText={touched.contactphone && errors.contactphone}
                  />
                  <TextField
                    fullWidth
                    label="Contact Designation"
                    {...getFieldProps('contactdesignation')}
                    error={Boolean(
                      touched.contactdesignation && errors.contactdesignation,
                    )}
                    helperText={
                      touched.contactdesignation && errors.contactdesignation
                    }
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'column', md: 'row' }}
                  spacing={{ xs: 3, sm: 3, md: 3 }}
                >
                  <Card
                    sx={{
                      px: 3,
                      borderRadius: '10px',
                      border: {
                        xs: '1px solid #e6e6e6',
                        sm: '1px solid #e6e6e6',
                        md: 'none',
                      },
                      boxShadow: { xs: 'block', sm: 'block', md: 'none' },
                    }}
                  >
                    <Box sx={{ mt: 1 }}>
                      <div>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 2, color: 'text.secondary' }}
                        >
                          {user_type === 1
                            ? 'Add School Logo'
                            : 'Update School Logo'}
                        </Typography>
                        <UploadAvatar
                          accept="image/*"
                          file={values.avatarUrl}
                          maxSize={3145728}
                          onDrop={handleDropAvatar}
                          onDelete={() => setFieldValue('avatarUrl', null)}
                          error={Boolean(touched.avatarUrl && errors.avatarUrl)}
                          caption={
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 2,
                                mb: { xs: 2, sm: 2, md: 0 },
                                mx: 'auto',
                                display: 'block',
                                textAlign: 'center',
                                color: 'text.secondary',
                              }}
                            >
                              Allowed *.jpeg, *.jpg, *.png, *.gif
                              <br /> max size of {fData(3145728)}
                            </Typography>
                          }
                        />
                        <FormHelperText
                          error
                          sx={{ px: 2, textAlign: 'center' }}
                        >
                          {touched.avatarUrl && errors.avatarUrl}
                        </FormHelperText>
                      </div>
                    </Box>
                  </Card>
                  <div>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 1, mb: 2, color: 'text.secondary' }}
                    >
                      {user_type === 1
                        ? 'Add School Image'
                        : 'Update School Image'}
                    </Typography>
                    <UploadSingleFile
                      maxSize={3145728}
                      accept="image/*"
                      file={values.cover}
                      onDrop={handleDrop}
                      error={Boolean(touched.cover && errors.cover)}
                      onDelete={() => setFieldValue('cover', null)}
                    />
                    {touched.cover && errors.cover && (
                      <FormHelperText error sx={{ px: 2 }}>
                        {touched.cover && errors.cover}
                      </FormHelperText>
                    )}
                  </div>
                </Stack>
                {user_type === 1 ? (
                  <FormControlLabel
                    control={
                      <Android12Switch
                        {...getFieldProps('isVerified')}
                        checked={values.isVerified}
                        onChange={(event) => {
                          setFieldValue('isVerified', event.target.checked)
                        }}
                      />
                    }
                    label={
                      <>
                        <Typography variant="subtitle2">Verified</Typography>
                      </>
                    }
                  />
                ) : (
                  ''
                )}

                <DialogActions>
                  <Box sx={{ flexGrow: 1 }} />
                  <LoadingButton
                    type="submit"
                    color="success"
                    sx={{ color: '#fff' }}
                    variant="contained"
                    loading={isSubmitting}
                    loadingIndicator={
                      user_type === 1
                        ? 'Submitting...'
                        : user_type === 2
                        ? 'Updating...'
                        : ''
                    }
                  >
                    {!isEdit && user_type === 1
                      ? 'Add School'
                      : user_type === 2
                      ? 'Update Profile'
                      : 'Save Changes'}
                  </LoadingButton>
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    onClick={handleGoBack}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  )
}

import * as Yup from 'yup'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'
import { Form, FormikProvider, useFormik } from 'formik'
// material
import { LoadingButton } from '@material-ui/lab'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import {
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
  Paper,
  Box,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
import { Icon } from '@iconify/react'
import fakeRequest from 'src/utils/fakeRequest'
import { UploadAvatar } from 'src/components/upload'
import { fData } from 'src/utils/formatNumber'
import copyFill from '@iconify/icons-eva/copy-fill'
import { Email, Password } from '@material-ui/icons'
import CopyClipboard from 'src/components/CopyClipboard'
import Image from '../../../../../../../images/Teacher1.png'
import { PATH_DASHBOARD } from 'src/routes/paths'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import { storage } from 'src/firebase/Constant'

// utils

// ----------------------------------------------------------------------

const Subject = [
  { id: 1, label: 'Mathematics' },
  { id: 2, label: 'Physics' },
  { id: 3, label: 'Chemistry' },
]

// ----------------------------------------------------------------------

export default function AddTeacherForm({
  subjects,
  setTeacher,
  departmentId,
  schoolId,
  tempEditId,
  deptLimit,
}) {
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  console.log('user_type', user_type)
  const [data, setData] = useState([])
  const [subjectsList, setSubjectList] = useState([])
  const [optionSubjectList, setOptionSubjectList] = useState([])
  const [assignedSubject, setAssignedSubject] = useState([])
  const user = JSON.parse(localStorage.getItem('user'))

  const hodEditId = tempEditId || user.teacherId
  const theDeparmentId = departmentId || user.departmentId

  useEffect(() => {
    fetchTeacherDetailsById()
    fetchSubjectsByDepartmentId()
  }, [hodEditId])

  const fetchTeacherDetailsById = async () => {
    await axios
      .get(`${REST_API_END_POINT}get-teacher-details-for-editing/${hodEditId}`)
      .then((res) => {
        if (res.data.status === 1) {
          setData(res.data.result)

          console.log(res.data.result)
        } else {
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }
  const fetchSubjectsByDepartmentId = async () => {
    await axios
      .get(`${REST_API_END_POINT}get-subject/${theDeparmentId}`)
      .then((res) => {
        if (res.data.status === 1) {
          const filteredSubjects = res.data.result.filter(
            (subject) => subject.status === 1,
          )
          //  const filteredSubjectsOption = res.data.result.filter(subject => subject.status === 1 && subject.assigned === 0);
          const filteredSubjectsOption = res.data.result.filter(
            (subject) => subject.status === 1,
          )

          setSubjectList(filteredSubjects)
          setOptionSubjectList(filteredSubjectsOption)

          console.log(filteredSubjects, 'result')
        } else {
          setSubjectList([])
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    const subjectIds = data.subjects ? data.subjects.split(',') : []

    const selectedSubjects = subjectIds
      .map((id) => subjectsList.find((subject) => subject.id === parseInt(id)))
      .filter(Boolean)

    setAssignedSubject(selectedSubjects)

    console.log('selectedSubjects', selectedSubjects)
  }, [data, subjectsList])

  useEffect(() => {
    if (data.id) {
      formik.setValues({
        teacherName: data.name || '',
        avatarUrl: data.image || null,
        password: data.password || '',
        email: data.email || '',
        phone: data.phoneNumber || '',
        subjects: assignedSubject.length ? assignedSubject : [],
        schoolId: data.schoolId || schoolId || null,
        departmentId:
          data.departmentId || departmentId || theDeparmentId || null,
        status: data?.status,
        hodId: data?.id,
        teaching_philosophy: data.teaching_philosophy || '',
      })
    }
  }, [data, assignedSubject])

  const NewBlogSchema = Yup.object().shape({
    teacherName: Yup.string()
      .required('Teacher Name is required')
      .matches(
        /^[a-zA-Z\s]+$/,
        'Teacher Name should not contain numbers or special characters',
      )
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    avatarUrl: Yup.mixed(),
    //avatarUrl: Yup.mixed().required('Teacher Image is required'),
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
    password: Yup.string().required('Password is required'),
    phone: Yup.string()
      .required('Phone Number is required')
      .matches(
        /^\d{10}$/,
        'Phone Number must be exactly 10 digits long and contain only numbers',
      ),
    subjects: Yup.array().min(1, 'At least one Subject is required'),
    teaching_philosophy: Yup.string(),
  })

  const formik = useFormik({
    // enableReinitialize:true,
    initialValues: {
      teacherName: data ? data.name : '',
      avatarUrl: null,
      password: '',
      email: '',
      phone: '',
      subjects: [],
      departmentId: theDeparmentId || null,
      schoolId: schoolId || null,
      teaching_philosophy: '',
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar(user_type !==4 ? 'Teacher Added Successfully' : 'Profile Updated Succesfully', { variant: 'success' });
        // user_type !== 4 ? setTeacher(false) : navigate(PATH_DASHBOARD.general.teacherDetails)
        // console.log('Form Values : ',values);
        const response = await axios.post(
          `${REST_API_END_POINT}${
            hodEditId ? 'update-teacher/' + hodEditId : 'add-teacher'
          }`,
          { values },
        )
        if (response.data.status === 2) {
          enqueueSnackbar(`Account Already Exist with ${values.email}`, {
            variant: 'warning',
          })
        } else if (response.data.status == 1) {
          window.location.reload()
          enqueueSnackbar(
            user_type !== 4
              ? `Teacher ${hodEditId ? 'Updated' : 'Added'} Successfully`
              : 'Profile Updated Succesfully',
            { variant: 'success' },
          )
          setTeacher(false)
        } else {
          enqueueSnackbar(
            `Failed ${hodEditId ? 'Updating' : 'Adding'} Teacher`,
            { variant: 'error' },
          )
        }
      } catch (error) {
        console.error(error)
        setSubmitting(false)
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
        uploadImgToFirebase(file)
        // setFieldValue('avatarUrl', {
        //   ...file,
        //   preview: URL.createObjectURL(file)
        // });
      }
    },
    [setFieldValue],
  )

  const uploadImgToFirebase = (file) => {
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

          setFieldValue('avatarUrl', downloadURL)
        })
      },
    )
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Box sx={{ width: 88, flexShrink: 0 }}>
                <UploadAvatar
                  disabled={tempEditId ? false : deptLimit}
                  accept="image/*"
                  file={values.avatarUrl}
                  maxSize={3145728}
                  onDrop={handleDropAvatar}
                  onDelete={() => setFieldValue('avatarUrl', null)}
                  error={Boolean(touched.avatarUrl && errors.avatarUrl)}
                />
              </Box>

              <Paper variant={user_type !== 4 ? '' : 'outlined'} sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'column', md: 'column' }}
                  spacing={{ xs: 2, sm: 2, md: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Teacher Name"
                    InputLabelProps={{ shrink: true }}
                    {...getFieldProps('teacherName')}
                    error={Boolean(touched.teacherName && errors.teacherName)}
                    helperText={touched.teacherName && errors.teacherName}
                    disabled={tempEditId ? false : deptLimit}
                  />
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row', md: 'row' }}
                  sx={{ mt: 2.5 }}
                  spacing={{ xs: 3, sm: 2, md: 2 }}
                >
                  <CopyClipboard
                    label="Teacher Email"
                    placeholder="Teacher Email"
                    value={values.email}
                    onChange={(e) => setFieldValue('email', e.target.value)}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={tempEditId ? false : deptLimit}
                  />
                  <CopyClipboard
                    label="Teacher Password"
                    placeholder="Teacher Password"
                    value={values.password}
                    onChange={(e) => setFieldValue('password', e.target.value)}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <TextField
                    fullWidth
                    label="Teacher Phone Number"
                    {...getFieldProps('phone')}
                    InputProps={{
                      type: 'tel',
                      inputProps: {
                        maxLength: 10,
                      },
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '')

                      // Restrict length to 10
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10)
                      }

                      // Prevent exactly ten 0s
                      if (e.target.value === '0000000000') {
                        e.target.value = '' // Clear the input if it is all zeros
                      }
                    }}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'column', md: 'column' }}
                  sx={{ mt: 2.5 }}
                  spacing={{ xs: 2, sm: 2, md: 2 }}
                >
                  <Autocomplete
                    disabled={tempEditId ? false : deptLimit}
                    multiple
                    freeSolo={false}
                    value={values.subjects}
                    onChange={(event, newValue) => {
                      console.log(newValue)
                      setFieldValue('subjects', newValue)
                      console.log('11111', newValue)
                    }}
                    options={optionSubjectList}
                    getOptionLabel={(option) => option.subjectName || ''}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          color="primary"
                          key={option.id}
                          size="small"
                          label={option.subjectName}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assign Subjects.."
                        error={Boolean(touched.subjects && errors.subjects)}
                        helperText={touched.subjects && errors.subjects}
                      />
                    )}
                  />
                </Stack>

                {/* NEW: Teaching Philosophy Field */}
                {tempEditId && (
                  <Stack
                    direction={{ xs: 'column', sm: 'column', md: 'column' }}
                    sx={{ mt: 2.5 }}
                    spacing={{ xs: 2, sm: 2, md: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Teaching Philosophy"
                      placeholder="Describe your teaching philosophy and approach..."
                      multiline
                      rows={3}
                      {...getFieldProps('teaching_philosophy')}
                      error={Boolean(
                        touched.teaching_philosophy &&
                          errors.teaching_philosophy,
                      )}
                      helperText={
                        touched.teaching_philosophy &&
                        errors.teaching_philosophy
                      }
                    />
                  </Stack>
                )}

                <Box
                  sx={{
                    mt: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {user_type !== 4 ? 'Teacher Image' : 'Profile Picture'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Click the circle to upload. JPG, PNG or GIF, max{' '}
                      {fData(3145728)}.
                    </Typography>
                    {touched.avatarUrl && errors.avatarUrl && (
                      <FormHelperText error>{errors.avatarUrl}</FormHelperText>
                    )}
                  </Box>
                </Box>
              </Paper>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <LoadingButton
                  sx={{ color: '#fff' }}
                  color="success"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  loadingIndicator={
                    user_type !== 4 ? 'Adding...' : 'Updating...'
                  }
                >
                  {user_type !== 4
                    ? `${hodEditId ? 'Update' : 'Add'} Teacher`
                    : 'Update Profile'}
                </LoadingButton>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() =>
                    user_type === 1
                      ? setTeacher(false)
                      : user_type === 2
                      ? setTeacher(false)
                      : user_type === 3
                      ? setTeacher(false)
                      : user_type === 4
                      ? handleGoBack()
                      : ''
                  }
                  sx={{ ml: 1.5 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </>
  )
}

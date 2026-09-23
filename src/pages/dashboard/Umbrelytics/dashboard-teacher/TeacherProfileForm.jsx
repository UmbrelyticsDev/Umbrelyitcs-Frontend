import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from '@material-ui/core'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'

const TOOL_API = process.env.REACT_APP_TOOL_API_URL || 'http://localhost:3000'
const WEBSITE_API =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'

const validationSchema = Yup.object().shape({
  teacherName: Yup.string().required('Teacher name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
  teaching_philosophy: Yup.string(),
  teaching_style: Yup.string(),
  bio: Yup.string(),
})

export default function TeacherProfileForm({ teacherId, isUmblptool = false }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchTeacherData()
  }, [teacherId])

  const fetchTeacherData = async () => {
    try {
      let response

      if (isUmblptool) {
        // Fetch from UMBLPTOOL
        response = await axios.get(`${TOOL_API}/api/teachers/${teacherId}`)
      } else {
        // Fetch from Umbrelytics
        response = await axios.get(
          `${WEBSITE_API}/webservice/get-teacher-details-for-editing/${teacherId}`,
        )
      }

      if (response.data.success || response.data.status === 1) {
        const data = response.data.data || response.data.result
        setTeacher({
          teacherName: data.name || `${data.first_name} ${data.last_name}`,
          email: data.email,
          phone: data.phoneNumber || '',
          teaching_philosophy: data.teaching_philosophy || '',
          teaching_style: data.teaching_style || '',
          bio: data.bio || '',
        })
      }
    } catch (error) {
      console.error('Error fetching teacher:', error)
      setMessage({
        type: 'error',
        text: 'Failed to load teacher profile',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    setSyncing(true)
    try {
      const submitData = {
        values: {
          ...values,
          hodId: teacherId,
          status: 1,
        },
      }

      if (isUmblptool) {
        // Update in UMBLPTOOL
        await axios.put(`${TOOL_API}/api/teachers/${teacherId}`, submitData)
      } else {
        // Update in Umbrelytics (triggers sync)
        await axios.put(`${WEBSITE_API}/api/teachers/edit-teacher`, submitData)
      }

      setMessage({
        type: 'success',
        text: 'Profile updated successfully! Changes synced across both platforms.',
      })

      // Refresh data
      setTimeout(() => fetchTeacherData(), 1000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: 'Failed to update profile',
      })
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Teacher Profile
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {teacher && (
          <Formik
            initialValues={teacher}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teacher Name"
                      name="teacherName"
                      value={values.teacherName}
                      onChange={handleChange}
                      error={touched.teacherName && !!errors.teacherName}
                      helperText={touched.teacherName && errors.teacherName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teaching Style"
                      name="teaching_style"
                      value={values.teaching_style}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Teaching Philosophy"
                      name="teaching_philosophy"
                      multiline
                      rows={4}
                      value={values.teaching_philosophy}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      multiline
                      rows={3}
                      value={values.bio}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={syncing}
                      >
                        {syncing ? 'Saving...' : 'Save Profile'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => fetchTeacherData()}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        )}
      </CardContent>
    </Card>
  )
}

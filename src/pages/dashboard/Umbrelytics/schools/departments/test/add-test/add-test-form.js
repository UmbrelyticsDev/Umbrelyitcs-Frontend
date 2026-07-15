import * as Yup from 'yup'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
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
} from '@material-ui/core'
import fakeRequest from 'src/utils/fakeRequest'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import useAuth from 'src/hooks/useAuth'
// utils

// ----------------------------------------------------------------------

const Teachers = [
  {
    id: 1,
    label: 'Michel Cambell',
    subjects: [
      { id: 1, label: 'Maths' },
      { id: 2, label: 'Physics' },
      { id: 3, label: 'Chemistry' },
    ],
  },
  {
    id: 2,
    label: 'Andre Thompson',
    subjects: [
      { id: 4, label: 'Biology' },
      { id: 5, label: 'English' },
      { id: 6, label: 'History' },
    ],
  },
  {
    id: 3,
    label: 'Aisha James',
    subjects: [
      { id: 7, label: 'Geography' },
      { id: 8, label: 'Art' },
      { id: 9, label: 'Physical Education' },
    ],
  },
]

const TeachersLoginIndividualSubjects = [
  { id: 1, label: 'Maths' },
  { id: 2, label: 'Physics' },
  { id: 3, label: 'Chemistry' },
]

// ----------------------------------------------------------------------


export default function AddTestForm({ test, setTest,classId,departmentId ,tempEditId,editedData}) {
  const { enqueueSnackbar } = useSnackbar();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const { user } = useAuth()
  const [teachers,setTeachers] = useState([])
  // const [teachersOption,setTeachersOption] = useState([])
  const [data, setData] = useState(editedData ? editedData : {})
  const [subjects, setSubjects] = useState([])
  const [assignedSubjects, setAssignedSubjects] = useState([])
  const [subjectData, setSubjectData] = useState([])

  useEffect(() => {
    if (departmentId) {
      fetchTeachers()
      fetchSubjects()
    }
    if (tempEditId && subjects && teachers && departmentId) {
      fetchTestData()
    }
  }, [departmentId, tempEditId])

  const fetchTeacherAssignedSubjects = () => {
    if (user.user_type === 4 && user.teacherId) {
      axios
        .post(`${REST_API_END_POINT}teacher/get-assigned-subjects`, {
          teacherId: user.teacherId,
        })
        .then((res) => {
          if (res.data.status === 1) {
            setAssignedSubjects(res.data.data)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
  useEffect(() => {
    fetchTeacherAssignedSubjects()
  }, [user.teacherId])
  // const fetchTeachers = async()=>{
  //   const classResponse = await axios.get(`${REST_API_END_POINT}get-class-data/${classId}`);
  //   await axios.get(`${REST_API_END_POINT}get-teacher/${departmentId}`)
  //   .then(res=>{
  //    if(res.data.status ===1) {

  //      console.log('classResponse',classResponse.data.result)
  //     const filteredTeachers = res.data.result.filter(teacher => teacher.status === 1);
  //      setTeachers(filteredTeachers)
  //    }else {
  //      console.log("not getting data")
  //    }
  //   })
  //  }

  const fetchTeachers = async () => {
    try {
      // Fetch class data
      const classResponse = await axios.get(
        `${REST_API_END_POINT}get-class-data/${classId}`,
      )

      // Fetch teachers data based on departmentId
      const teacherResponse = await axios.get(
        `${REST_API_END_POINT}get-teacher/${departmentId}`,
      )

      if (teacherResponse.data.status === 1) {

        // Get the teacherId from the classResponse and convert it to an array of numbers
        const classTeacherIds = classResponse.data.result.teacherId
          .split(',')
          .map((id) => parseInt(id))

        // Filter the teachers whose status is 1 and whose id is in the classTeacherIds array
        const filteredTeachers = teacherResponse.data.result.filter(
          (teacher) =>
            teacher.status === 1 && classTeacherIds.includes(teacher.id),
        )

        setTeachers(filteredTeachers)

      } else {
        console.log('not getting data')
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  //  const fetchTestData =async()=>{
  //   const subjectData =  await axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`)
  //   await axios.get(`${REST_API_END_POINT}get-test-data/${tempEditId}`)
  //   .then(res =>{
  //     if(res.data.status===1) {
  //       setData(res.data.result)
  //       console.log('dataaaaaaaaaaaaaaa',res.data.result.subject)
  //       console.log('dataaaaaaaaaaaaaaa sub',subjectData.data.result)

  //     }else{
  //      console.log("not getting data");

  //     }
  //   }).catch(err=>console.log(err))
  //  }

  const fetchTestData = async () => {
    try {
      // Fetch both subjects and test data concurrently
      const [subjectResponse, testResponse] = await Promise.all([
        axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`),
        axios.get(`${REST_API_END_POINT}get-test-data/${tempEditId}`),
      ])

      if (testResponse.data.status === 1) {
        // Set the test data
        setData(testResponse.data.result)


        if (subjectResponse.data.status === 1) {
          // Set the subjects data
          setSubjects(subjectResponse.data.result)


          // Find and log the subject corresponding to the test data
          const subject = subjectResponse.data.result.find(
            (sub) => sub.id === testResponse.data.result.subject,
          )

          setSubjectData(subject)
        } else {
          console.log('Failed to fetch subjects')
        }
      } else {
        console.log('Failed to fetch test data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchSubjects = async () => {
    await axios
      .get(`${REST_API_END_POINT}get-subject/${departmentId}`)
      .then((res) => {
        if (res.data.status === 1) {
          setSubjects(res.data.result)
      
        } else {
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }

  //  const getSubjects = (teacherId) => {

  //   console.log("teacherId",teacherId);

  //   const teacher = teachers.find(t => t.id === teacherId);
  //   if (teacher && teacher.assignedSubject) {
  //     // Split the subjects string into an array
  //     return teacher.assignedSubject.split(',').map((subject, index) => ({
  //       id: index + 1,
  //       label: subject.trim(),
  //     }));
  //   }
  //   return [];
  // };

  const getSubjects = (teacherId) => {


    // Find the teacher by teacherId
    const teacher = teachers.find((t) => t.id === teacherId)


    if (teacher && teacher.assignedSubject) {
      // Split the assignedSubject string into an array of subject IDs
      const assignedSubjectIds = teacher.assignedSubject
        .split(',')
        .map((id) => parseInt(id.trim()))

      // Find the corresponding subject details from the subjects array
      return assignedSubjectIds
        .map((subjectId) => {
          const subjectDetail = subjects.find(
            (subject) => subject.id === subjectId,
          )
          if (subjectDetail) {
            // Return an object with id and subjectName
            return {
              id: subjectDetail.id,
              subjectName: subjectDetail.subjectName, // Assuming `subjectName` is the desired label
            }
          }
          return null // Return null for any subjectId not found (optional)
        })
        .filter((subject) => subject !== null) // Remove any null values if no match is found
    }

    // Return an empty array if no subjects are found
    return []
  }

  useEffect(() => {
    if (data.id && teachers && subjects) {
      formik.setValues({
        typeOfTest: data ? data.typeOfTest : '',
        teacher:
          data && teachers.length > 0
            ? teachers.find((value) => value.id === data.teacherId)
            : '' || (user_type !== 4 && null),
        subject: subjectData ? subjectData : null || (user_type !== 4 && null),
        classId: classId || null,
        user_type:user_type,
        hodId:user.hodId || null,
        teacherId : user.teacherId || null,
        schoolId : user.schoolId || null
      })
     
      setFieldValue(
        'subject',
        subjects.find((subject) => subject.id === data.subject),
      )
    }
  }, [data, subjects, teachers])

  const NewBlogSchema = Yup.object().shape({
    typeOfTest: Yup.string()
      .required('Type Of Test is required')
      .matches(
        /^[a-zA-Z\s]+$/,
        'Type Of Test should not contain numbers or special characters',
      )
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    teacher:
      user_type !== 4 &&
      Yup.object().nullable().required('Please Select Teacher'),
    subject: Yup.object().nullable().required('Please Select Subject'),
  })

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      typeOfTest: data ? data.typeOfTest : '',
      teacher:
        user?.user_type === 4
          ? user?.teacherId
          : data && teachers.length > 0
          ? teachers.find((value) => value.id === data.teacherId)
          : '' || (user_type !== 4 && null),
      subject:
        user?.user_type === 4
          ? data && assignedSubjects.length > 0
            ? assignedSubjects.find((subject) => subject.id === data.subject)
            : null
          : data && subjects.length > 0
          ? subjects.find((subject) => subject.id === data.subject)
          : null,
      // data && subjects.length > 0
      // ? subjects.find(subject => subject.id === data.subject)
      // : null || (user_type !== 4 && null),
      classId: classId || null,
      user_type:user_type,
      hodId:user.hodId || null,
      teacherId : user.teacherId || null,
      schoolId : user.schoolId || null
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar('Test Added Successfully', { variant: 'success' });
        // setTest(false);
       
        const response = await axios.post(
          `${REST_API_END_POINT}${
            tempEditId ? 'edit-test-data/' + tempEditId : 'add-test'
          }`,
          { values },
        )
        if (response.data.status === 1) {
          enqueueSnackbar(
            `Test ${tempEditId ? 'Updated' : 'Added'} Successfully`,
            { variant: 'success' },
          )
          setTest(false);
          window.location.reload()
          setData({})
        } else {
          enqueueSnackbar(`Test Not ${tempEditId ? 'Updated' : 'Added'}`, {
            variant: 'error',
          })
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

  // const getSubjects = (teacherId) => {
  //   const teacher = Teachers.find(t => t.id === teacherId);
  //   return teacher ? teacher.subjects : [];
  // };


  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'column', md: 'column' }}
                  sx={{ mb: 2.5 }}
                >
                  <TextField
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    label="Type Of Test"
                    {...getFieldProps('typeOfTest')}
                    error={Boolean(touched.typeOfTest && errors.typeOfTest)}
                    helperText={touched.typeOfTest && errors.typeOfTest}
                  />
                </Stack>
                {
                  user_type !== 4 ? (
                    <Stack
                      direction={{ xs: 'column', sm: 'row', md: 'row' }}
                      sx={{ mb: 2.5 }}
                      spacing={2}
                    >
                      <Autocomplete
                        fullWidth
                        options={teachers}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Choose Teacher.."
                            error={Boolean(touched.teacher && errors.teacher)}
                            helperText={touched.teacher && errors.teacher}
                          />
                        )}
                        value={values.teacher}
                        onChange={(event, newValue) => {
                          setFieldValue('teacher', newValue)
                          setFieldValue('subject', null)
                        }}
                      />
                      {values.teacher && (
                        <Autocomplete
                          fullWidth
                          // options={getSubjects(values.teacher ? values.teacher.id : null)}
                          options={getSubjects(values.teacher.id)}
                          getOptionLabel={(option) => option?.subjectName}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Choose Subject.."
                              error={Boolean(touched.subject && errors.subject)}
                              helperText={touched.subject && errors.subject}
                            />
                          )}
                          value={values.subject}
                          onChange={(event, newValue) => {
                            setFieldValue('subject', newValue)
                          }}
                        />
                      )}
                    </Stack>
                  ) : (
                    <Stack
                      direction={{ xs: 'column', sm: 'row', md: 'row' }}
                      sx={{ mb: 2.5 }}
                      spacing={2}
                    >
                      <Autocomplete
                        fullWidth
                        options={assignedSubjects}
                        getOptionLabel={(option) => option?.subjectName}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Choose Subject.."
                            error={Boolean(touched.subject && errors.subject)}
                            helperText={touched.subject && errors.subject}
                          />
                        )}
                        value={values.subject}
                        onChange={(event, newValue) => {
                          setFieldValue('subject', newValue)
                        }}
                      />
                    </Stack>
                  )
                  // ''
                }
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                  <LoadingButton
                    sx={{ color: '#fff' }}
                    color="success"
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                    loadingIndicator="Adding..."
                  >
                    {
                       `${tempEditId ? 'Update' : 'Add'} Test`
                      }
                  </LoadingButton>
                  <Button
                    type="button"
                    color="error"
                    variant="outlined"
                    onClick={() => setTest(false)}
                    sx={{ ml: 1.5 }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </>
  )
}

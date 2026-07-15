import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@material-ui/lab';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import {
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  FormHelperText,
  Paper,
  Box,
  Chip,
  Autocomplete,
  Avatar
} from '@material-ui/core';
import fakeRequest from 'src/utils/fakeRequest';
import { UploadAvatar } from 'src/components/upload';
import { fData } from 'src/utils/formatNumber';
import CopyClipboard from 'src/components/CopyClipboard';
import Image from '../../../../../../../images/HOD1.png'
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { storage } from 'src/firebase/Constant';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

// ----------------------------------------------------------------------
const Subject = [
  { id: 1, label: 'Mathematics' },
  { id: 2, label: 'Physics' },
  { id: 3, label: 'Chemistry' },
];

export default function AddHODForm({ setHod, schoolId, departmentId, tempEditId,deptLimit }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const [subjectsList, setSubjectList] = useState([])
  const [optionSubjectList,setOptionSubjectList] = useState([])
  const [data, setData] = useState([])
  const [assignedSubject,setAssignedSubject] = useState([])
  const user = JSON.parse(localStorage.getItem('user'));

  const hodEditId =tempEditId || user.hodId
  const theDeparmentId = departmentId || user.departmentId


  

  useEffect(() => {
    if(deptLimit && !tempEditId){
      setHod(false);
    }
    fetchSubjectsByDepartmentId()
    fetchDataByTempEditId()
  }, [theDeparmentId, hodEditId])

  const fetchSubjectsByDepartmentId = async () => {
    await axios.get(`${REST_API_END_POINT}get-subject/${theDeparmentId}`)
      .then(res => {
        if (res.data.status === 1) {
          const filteredSubjects = res.data.result.filter(subject => subject.status === 1);
          // const filteredSubjectsOption = res.data.result.filter(subject => subject.status === 1 && subject.assigned === 0);
          const filteredSubjectsOption = res.data.result.filter(subject => subject.status === 1 );

          setSubjectList(filteredSubjects)
          setOptionSubjectList(filteredSubjectsOption)
          console.log(filteredSubjects, "setSubjectList");

        } else {
          setSubjectList([])
          console.log("not getting data");
        }
      }).catch(err => console.log(err))
  }

  const fetchDataByTempEditId = async () => {
    await axios.get(`${REST_API_END_POINT}get-hod-for-updating/${hodEditId}`)
      .then(res => {
        if (res.data.status === 1) {
          setData(res.data.result);
         
        } else {
          console.log("not getting data");
        }
      }).catch(err => console.log(err))
  }

  useEffect(() => {
    const subjectIds = data.subjects ? data.subjects.split(',') : [];
  
    const selectedSubjects = subjectIds
      .map(id => subjectsList.find(subject => subject.id === parseInt(id)))
      .filter(Boolean); 

    setAssignedSubject(selectedSubjects);
  
    console.log("selectedSubjects", selectedSubjects);
  }, [data, subjectsList]);
  
  useEffect(() => {
    if (data.id) {
      formik.setValues({
        hodName: data.name || '',
        avatarUrl: data.image || null,
        password: data.password || '',
        email: data.email || '',
        phone: data.phoneNumber || '',
        subjects: assignedSubject.length  ? assignedSubject : [],
        schoolId: data.schoolId || schoolId || null,
        departmentId: data.departmentId || departmentId ||theDeparmentId|| null,
        status: data?.status,
        hodId: data?.id
      });
    }


  }, [data,assignedSubject]);

  const NewBlogSchema = Yup.object().shape({
    hodName: Yup.string().required('HOD Name is required')
      .matches(/^[a-zA-Z\s]+$/, 'HOD Name should not contain numbers or special characters')
      .min(2, 'Too Short!')
      .max(50, 'Too Long!'),
    avatarUrl: Yup.mixed().required('HOD Image is required'),
    email: Yup.string().required('Email is required')
      .email('Email must be a valid email address')
      .test('at-least-one-letter', 'Email must contain at least one letter before @', value => {
        if (!value) return false;
        const beforeAtSymbol = value.split('@')[0];
        return /[a-zA-Z]/.test(beforeAtSymbol);
      }),
    password: Yup.string().required('Password is required'),
    phone: Yup.string().required('Phone Number is required').min(10, '10 Numbers Should Type').max(10, 'More Than 10 Numbers Is Not Allowed'),
    subjects: Yup.array().min(1, 'At least one Subject is required')
  });

  const formik = useFormik({
    initialValues: {
      hodName: user_type === 1 ? data?.name || '' : user_type === 2 ? '' : user_type === 3 ? 'Marlon Cambell' : '',
      avatarUrl: user_type === 1 ? data?.image || null : user_type === 2 ? null : user_type === 3 ? Image : null,
      password: user_type === 1 ? data?.password || '' : user_type === 2 ? '' : user_type === 3 ? 'marlon@123' : '',
      email: user_type === 1 ? data?.email || '' : user_type === 2 ? '' : user_type === 3 ? 'marlon@gmail.com' : '',
      phone: user_type === 1 ? data?.phoneNumber || '' : user_type === 2 ? '' : user_type === 3 ? '9837482364' : '',
      subjects: user_type === 3 ? ['Mathematics'] : [],
      schoolId: schoolId,
      departmentId: theDeparmentId,
      status: data?.status || null,
      hodId: data?.id || null
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar(user_type === 1 ? 'HOD Added Successfully' : user_type === 2 ? 'HOD Added Successfully': user_type === 3 ? 'Profile Updated Successfully' :'' , { variant: 'success' });
        // user_type === 1 ? setHod(false) : user_type === 2 ? setHod(false) : user_type === 3 ? navigate(PATH_DASHBOARD.general.hodDetails) : ''
        // console.log('Form Values : ', values);
        const response = await axios.post(`${REST_API_END_POINT}${hodEditId ? "edit-hod-data/" + hodEditId : "add-hod"}`, { values })
        if (response.data.status === 2) {
          enqueueSnackbar(`Account Already Exist with ${values.email}`, { variant: 'warning' });
        } else if (response.data.status === 1) {
          enqueueSnackbar(user_type === 1 ? `HOD ${hodEditId ? "Updated" : "Added"} Successfully` : user_type === 2 ? 'HOD Added Successfully' : user_type === 3 ? 'Profile Updated Successfully' : '', { variant: 'success' });
          setHod(false);
          window.location.reload()
        } else {
          enqueueSnackbar(user_type === 1 ? 'HOD Not Added' : user_type === 2 ? 'HOD Not Added' : user_type === 3 ? 'Profile Not Updated' : '', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDropAvatar = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadImgToFirebase(file)
        // setFieldValue('avatarUrl', {
        //   ...file,
        //   preview: URL.createObjectURL(file)
        // });
      }
    },
    [setFieldValue]
  );

  const uploadImgToFirebase = (file) => {
    // Create a storage reference
    const storageRef = storage.ref(`images/${file.name}`);

    // Upload the file
    const uploadTask = storageRef.put(file);

    // Monitor upload progress
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Upload failed:', error);
      },
      () => {
        // Handle successful uploads on complete
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);

          setFieldValue('avatarUrl', downloadURL)

        });
      }
    );
  };

  const handleGoBack = () => {
    window.history.back();
  };



  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper variant={user_type === 3 ? 'outlined' : 'none'} sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'column', md: 'column' }} spacing={{ xs: 2, sm: 2, md: 2 }}>
                  <TextField
                    fullWidth
                    label="HOD Name"
                    {...getFieldProps('hodName')}
                    error={Boolean(touched.hodName && errors.hodName)}
                    helperText={touched.hodName && errors.hodName}
                    disabled={tempEditId ? false : deptLimit}

                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} sx={{ mt: 2.5 }} spacing={{ xs: 3, sm: 2, md: 2 }}>
                  <CopyClipboard
                    label="HOD Email"
                    placeholder="HOD Email"
                    value={values.email}
                    onChange={(e) => setFieldValue('email', e.target.value)}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={tempEditId ? false : deptLimit}
                  />
                  <CopyClipboard
                    label="HOD Password"
                    placeholder="HOD Password"
                    value={values.password}
                    onChange={(e) => setFieldValue('password', e.target.value)}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                    disabled={tempEditId ? false : deptLimit}
                  />
                  <TextField
                    fullWidth
                    label="HOD Phone Number"
                    {...getFieldProps('phone')}
                    InputProps={{
                      inputProps: {
                        pattern: "[0-9]*",
                        inputMode: "numeric",
                        maxLength: 10,
                        min: "0",
                      },
                      type: 'tel'
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '');

                      // Restrict length to 10
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }

                      // Prevent exactly ten 0s
                      if (e.target.value === '0000000000') {
                        e.target.value = ''; // Clear the input if it is all zeros
                      }
                    }}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                    disabled={tempEditId ? false : deptLimit}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'column', md: 'column' }} sx={{ mt: 2.5 }} spacing={{ xs: 2, sm: 2, md: 2 }}>
                  <Autocomplete
                    multiple
                    disabled={tempEditId ? false : deptLimit}
                    freeSolo={false}
                    value={values.subjects}
                    onChange={(event, newValue) => {
                      console.log(newValue);
                      setFieldValue('subjects', newValue);
                    }}
                    options={optionSubjectList} // Pass the whole object as options
                    getOptionLabel={(option) => option.subjectName || ''} // Make sure to handle option as string
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          color="primary"
                          key={option.id} // Use a unique key, like the id
                          size="small"
                          label={option.subjectName} // Display the subjectName, not the whole object
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.secondary' }}>{user_type === 1 ? 'Add HOD Image' : user_type === 2 ? 'Add HOD Image' : user_type === 3 ? 'Update HOD Image' : ''}</Typography>
                  <Paper variant='outlined' sx={{ p: 2 }}>
                    <UploadAvatar
                    disabled={tempEditId ? false : deptLimit}
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
                            mx: 'auto',
                            display: 'block',
                            textAlign: 'center',
                            color: 'text.secondary'
                          }}
                        >
                          Allowed *.jpeg, *.jpg, *.png, *.gif
                          <br /> max size of {fData(3145728)}
                        </Typography>
                      }
                    />
                    <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                      {touched.avatarUrl && errors.avatarUrl}
                    </FormHelperText>
                  </Paper>
                </Box>
              </Paper>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <LoadingButton   disabled={tempEditId ? false : deptLimit} color='success' sx={{ color: '#fff', }} type="submit" variant="contained" loading={isSubmitting} loadingIndicator={user_type === 1 ? "Adding..." : user_type === 2 ? "Adding..." : user_type === 3 ? "Updating..." : user_type === 4 ? "Updating..." : ''}>
                  {user_type === 1 ? `${hodEditId ? "Update" : "Add"} HOD` : user_type === 2 ? 'Add HOD' : user_type === 3 ? 'Update Profile' : user_type === 4 ? 'Update Profile' : ''}
                </LoadingButton>
                <Button
              
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() =>
                    user_type === 1 ? setHod(false) : user_type === 2 ? setHod(false) : user_type === 3 ? handleGoBack() : user_type === 4 ? handleGoBack() : ''
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
  );
}
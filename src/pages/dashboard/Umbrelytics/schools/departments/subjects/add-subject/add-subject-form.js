import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@material-ui/lab';
import { experimentalStyled as styled } from '@material-ui/core/styles';
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
  Paper
} from '@material-ui/core';
import fakeRequest from 'src/utils/fakeRequest';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
// utils

// ----------------------------------------------------------------------

const HOD = [
  { id: 1, label: 'Marlon Cambell' },
  { id: 2, label: 'Keisha Miller' },
  { id: 3, label: 'Jassica Thompson' },
];

// ----------------------------------------------------------------------

export default function AddSubjectForm({ subject, setSubject, departmentId ,schoolId, tempEditId}) {
  const { enqueueSnackbar } = useSnackbar();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
 const [data,setData] =useState(null)


  useEffect(()=>{
    fetchData()
  },[tempEditId])

  const fetchData = async ()=>{
    await axios.get(`${REST_API_END_POINT}get-subject-for-updating/${tempEditId}`)
    .then(res =>{
      if(res.data.status===1) {
        console.log(res.data.result);
        setData(res.data.result)
      }else{
        console.log("not getting data");
        
      }
    }).catch(err =>console.log(err))
  }

  useEffect(() => {
    if (data) {
      formik.setValues({
        subjectName: data.subjectName || '',
       
      });
    }
  }, [data]); 

  const NewBlogSchema = Yup.object().shape({
    subjectName: Yup.string().required('Subject Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Subject Name should not contain numbers or special characters')
    .min(2, 'Too Short!')
    .max(50, 'Too Long!'),
  });

  const formik = useFormik({
    initialValues: {
      subjectName:data? data.subjectName: '',
      departmentId:departmentId || null,
      schoolId:schoolId || null,
      user_type:user_type
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar('Subject Added Successfully', { variant: 'success' });
        // setSubject(false);
        // console.log('Form Values : ',values);
      const response =  await axios.post(`${REST_API_END_POINT}${tempEditId?"edit-subject/"+tempEditId :"add-subject"}`,{values})
         if(response.data.status===1) {
        
          enqueueSnackbar(`Subject ${tempEditId?"Updated": "Added"} Successfully`, { variant: 'success' });
          window.location.reload()
          setSubject(false);
         }else{
          enqueueSnackbar('Subject Not Added', { variant: 'error' });
          setSubject(false);
         }
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'column', md: 'column' }} spacing={{ xs: 2, sm: 2, md: 2 }}>
                  <Typography variant="subtitle2">Subject Name</Typography>
                  <TextField
                    fullWidth
                    placeholder="Subject Name"
                    {...getFieldProps('subjectName')}
                    error={Boolean(touched.subjectName && errors.subjectName)}
                    helperText={touched.subjectName && errors.subjectName}
                  />
                </Stack>
              </Paper>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <LoadingButton sx={{color:'#fff',}} color='success'  type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Submitting...">
                  {tempEditId? "Update" : "Add"} Subject
                </LoadingButton>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() => setSubject(false)}
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
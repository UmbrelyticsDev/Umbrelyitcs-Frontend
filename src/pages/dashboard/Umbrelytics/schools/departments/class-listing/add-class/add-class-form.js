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

export default function AddClassForm({ gradename, setGrade,subjectId ,schoolId,tempEditId}) {
  const { enqueueSnackbar } = useSnackbar();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  const [data,setData] = useState([])

  useEffect(()=>{
    fetchDataForEditing()
  },[tempEditId])

  const fetchDataForEditing= async()=>{
await axios.get(`${REST_API_END_POINT}get-grade-for-editing/${tempEditId}`)
.then(res =>{
if(res.data.status===1) {
console.log(res.data.result);
setData(res.data.result)
}else{
  console.log("not getting data");
  
}
}).catch(err =>console.log(err))
  }

  const NewBlogSchema = Yup.object().shape({
    gradeName: Yup.string()
    .required('Grade Name is required')
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Grade Name must contain at least one alphabet and special characters are only allowed after alphabets'),
  });

  const formik = useFormik({
    enableReinitialize:true,
    initialValues: {
      gradeName: data? data.name :'',
      subjectId:subjectId || null,
      schoolId:schoolId || null,
      user_type:user_type || null
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar('Grade Added Successfully', { variant: 'success' });
        // setGrade(false);
        // console.log('Form Values : ',values);
        const response = await axios.post(`${REST_API_END_POINT}${tempEditId?'edit-grade/'+tempEditId : 'add-grade'}`,{values})
        if(response.data.status===1) {
          setGrade(false);
          enqueueSnackbar('Grade Added Successfully', { variant: 'success' });
          window.location.reload()
        }else{
          enqueueSnackbar('Grade Not Added', { variant: 'error' });
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
                  <Typography variant="subtitle2">Grade Name</Typography>
                  <TextField
                    fullWidth
                    placeholder="1st Grade"
                    {...getFieldProps('gradeName')}
                    error={Boolean(touched.gradeName && errors.gradeName)}
                    helperText={touched.gradeName && errors.gradeName}
                  />
                </Stack>
              </Paper>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <LoadingButton sx={{color:'#fff',}} color='success'  type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Adding...">
                  {tempEditId? "Update" : "Add"} Grade
                </LoadingButton>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() => setGrade(false)}
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
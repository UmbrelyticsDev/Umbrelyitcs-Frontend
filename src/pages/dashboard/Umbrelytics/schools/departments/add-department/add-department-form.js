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
// utils
import fakeRequest from '../../../../../../utils/fakeRequest';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import axios from 'axios';

// ----------------------------------------------------------------------

const HOD = [
  { id: 1, label: 'Marlon Cambell' },
  { id: 2, label: 'Keisha Miller' },
  { id: 3, label: 'Jassica Thompson' },
];

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
}));


export default function AddDepartmentForm({ department, setDepartement,schoolId ,id}) {
  const { enqueueSnackbar } = useSnackbar();
  const user = JSON.parse(localStorage.getItem('user'));
  const user_type = JSON.parse(localStorage.getItem('user_type'));
 const [data,setData] =useState(null)
 const [isLoading,setIsLoading] = useState(false)

  useEffect(()=>{
    fetchDataById()
  },[id])
  const fetchDataById= async()=>{
   await axios.get(`${REST_API_END_POINT}get-departments-data/${id}`)
   .then(res=>{
   if(res.data.status===1){
    setData(res.data.result)
    console.log(res.data.result);
  }else{
    console.log("not etting data");
    
  }
})
  }

  useEffect(() => {
    if (data) {
      formik.setValues({
        departmentName: data.departmentName || '',
        isVerified: data.verified || false,
      });
    }
  }, [data]); 
  
  const NewBlogSchema = Yup.object().shape({
    departmentName: Yup.string().required('Department Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Department Name should not contain numbers or special characters')
    .min(2, 'Too Short!')
    .max(50, 'Too Long!'),
    // hods: Yup.array().min(1, 'At least one HOD is required')
  });

  const formik = useFormik({
    initialValues: {
      departmentName:data? data.departmentName : '',
      // hods: []
      isVerified:data?data.verified : false ,
      schoolId:schoolId? schoolId :user?.schoolId || null,
      user_type:user_type || null
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar('Department Added Successfully', { variant: 'success' });
        // setDepartement(false);
        // console.log('Form Values : ',values);
        setSubmitting(true); 
        setIsLoading(true)
       await axios.post(`${REST_API_END_POINT}${id? `update-departments-data/`+id :"add-department"}`,{values})
        .then(res=>{
          setDepartement(false);
          if(res.data.status===1){
            enqueueSnackbar(`Department ${id ?"Updated":"Added"} Successfully`, { variant: 'success' });
            window.location.reload()
          }else{
            enqueueSnackbar('Department Not Added', { variant: 'error' });
          }
        })
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }finally {
        setSubmitting(false); 
        setIsLoading(false)
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
                  <Typography variant="subtitle2">Department Name</Typography>
                  <TextField
                    fullWidth
                    placeholder="Department Name"
                    {...getFieldProps('departmentName')}
                    error={Boolean(touched.departmentName && errors.departmentName)}
                    helperText={touched.departmentName && errors.departmentName}
                  />
                  {/* <Typography variant="subtitle2">Select HODs</Typography>
                  <Autocomplete
                    multiple
                    freeSolo
                    value={values.hods}
                    onChange={(event, newValue) => {
                      setFieldValue('hods', newValue);
                    }}
                    options={HOD.map((option) => option.label)}
                    getOptionLabel={(option) => option}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip color="primary" key={option} size="small" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select HODs"
                        error={Boolean(touched.hods && errors.hods)}
                        helperText={touched.hods && errors.hods}
                      />
                    )}
                  /> */}
                  <FormControlLabel
                    control={<Android12Switch {...getFieldProps('isVerified')} checked={values.isVerified} 
                    disabled={values.isVerified===1}
                    onChange={(event) => {
                      setFieldValue('isVerified', event.target.checked);
                    }}/>}
                    label={
                      <>
                        <Typography variant="subtitle2" sx={{mt:-0.2}}>
                            Department have more than one subject ?
                        </Typography>
                      </>
                    }
                  />
                </Stack>
              </Paper>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" color='success' sx={{color:'#fff'}} variant="contained" loading={isSubmitting} loadingIndicator="Submitting..."  disabled={isLoading} >
                {id? 'Update':"Add"} Department
                </LoadingButton>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() => setDepartement(false)}
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
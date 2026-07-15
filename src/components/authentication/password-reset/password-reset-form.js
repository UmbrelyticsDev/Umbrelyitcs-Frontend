import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// material
import { LoadingButton } from '@material-ui/lab';
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
  Button,
  InputAdornment,
  IconButton
} from '@material-ui/core';
// utils
import { fData } from '../../../utils/formatNumber';
import fakeRequest from '../../../utils/fakeRequest';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//
import Label from '../../Label';
import { UploadAvatar } from '../../upload';
import { JWT_SECRET, REST_API_END_POINT } from 'src/constants/Defaultvalues';
import jwt from 'jsonwebtoken';
import axios from 'axios';
// ----------------------------------------------------------------------

export default function PasswordResetForm({ setResetPass }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('searchParamssearchParams',searchParams)
    console.log('searchParamssearchParamstoken',token)
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);
        setUserData(decoded); // Store user data from token
      } catch (err) {
        console.error('Invalid or expired token:', err);
      
      }
    } else {
      console.error('No token provided.');
    }
  }, [searchParams]);


  const NewUserSchema = Yup.object().shape({
    password: Yup.string()
    .required('New Password is required'),
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    //   'Password must contain at least 6 characters, including one uppercase letter, one lowercase letter, one number, and one special character'
    // ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // setSubmitting(false);
        // enqueueSnackbar('Reset password success', { variant: 'success' });
        // navigate('/');
        const result = await axios.post(`${REST_API_END_POINT}updatePassword`,{values,userData})
        if(result.data.status===1) {
        enqueueSnackbar('Reset password success', { variant: 'success' });
        navigate('/');
        }else{
          enqueueSnackbar('Reset password failed', { variant: 'error' });

        }
        if(result) {

        }
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };
  const handleShowConfirmPassword = () => {
    setShowPasswordConfirm((show) => !show);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid item xs={12} md={12}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'column' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    autoComplete="new-password"
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    {...getFieldProps('password')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowPassword} edge="end">
                            <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <TextField
                    fullWidth
                    type={showPasswordConfirm ? 'text' : 'password'}
                    label="Confirm Password"
                    {...getFieldProps('confirmPassword')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleShowConfirmPassword} edge="end">
                            <Icon icon={showPasswordConfirm ? eyeFill : eyeOffFill} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Stack>
                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                  Update Password
                </LoadingButton>
              </Stack>
          </Grid>
      </Form>
    </FormikProvider>
  );
}
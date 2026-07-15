import React, { useRef } from 'react';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { OutlinedInput, FormHelperText, Stack, Button } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// utils
import fakeRequest from '../../../utils/fakeRequest';

// ----------------------------------------------------------------------

export default function VerifyCodeForm({setResetPass}) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const inputRefs = useRef([]);

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required').length(1, 'Code must be 1 digit'),
    code2: Yup.string().required('Code is required').length(1, 'Code must be 1 digit'),
    code3: Yup.string().required('Code is required').length(1, 'Code must be 1 digit'),
    code4: Yup.string().required('Code is required').length(1, 'Code must be 1 digit'),
    code5: Yup.string().required('Code is required').length(1, 'Code must be 1 digit'),
    code6: Yup.string().required('Code is required').length(1, 'Code must be 1 digit')
  });

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');
    const codeValues = pastedData.slice(0, 6).split('');
    const newValues = { ...formik.values };
    Object.keys(newValues).forEach((key, index) => {
      if (codeValues[index] !== undefined) {
        newValues[key] = codeValues[index];
      }
    });
    formik.setValues(newValues);
  };

  const formik = useFormik({
    initialValues: {
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      code6: ''
    },
    validationSchema: VerifyCodeSchema,
    onSubmit: async () => {
      await fakeRequest(500);
      enqueueSnackbar('OTP Verify success', { variant: 'success' });
      formik.resetForm();
      setResetPass(true)
      // navigate(PATH_DASHBOARD.root);
    }
  });

  const { values, errors, isValid, touched, isSubmitting, handleSubmit, getFieldProps, setFieldValue } = formik;

  const handleKeyUp = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'Delete' && index < inputRefs.current.length - 1) {
      setFieldValue(`code${index + 1}`, '');
      inputRefs.current[index + 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    } else if (e.target.value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Allow only numeric characters from numpad
    if ((e.key >= '0' && e.key <= '9') || (e.key === 'Backspace' || e.key === 'Delete')) {
      // If Backspace is pressed and the input is empty, move focus to the previous input
      if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.value === '' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1].focus();
      }
      // If Delete is pressed, clear the current input value and move focus to the next input
      else if (e.key === 'Delete' && index < inputRefs.current.length - 1) {
        e.preventDefault();
        setFieldValue(`code${index + 1}`, '');
        inputRefs.current[index + 1].focus();
      }
      // If a numeric key is pressed and the current input has a value, move focus to the next input
      else if (e.key >= '0' && e.key <= '9' && e.target.value.length === 1 && index < inputRefs.current.length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1].focus();
      }
    } else {
      e.preventDefault(); // Prevent typing other characters
    }
  };
  
  
  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack direction="row" spacing={2} justifyContent="center">
          {Object.keys(values).map((item, index) => (
            <OutlinedInput
            key={item}
            {...getFieldProps(item)}
            type="number"
            placeholder="-"
            onInput={(e) => {
              e.target.value = e.target.value.slice(0, 1).replace(/[^0-9]/g, ''); // Allow only numeric characters
            }}
            onPaste={handlePaste}
            error={Boolean(touched[item] && errors[item])}
            inputProps={{
              maxLength: 1,
              sx: {
                p: 0,
                textAlign: 'center',
                width: { xs: 36, sm: 56 },
                height: { xs: 36, sm: 56 }
              },
              ref: (ref) => (inputRefs.current[index] = ref),
              onKeyUp: (e) => handleKeyUp(e, index),
              onKeyDown: (e) => handleKeyDown(e, index)
            }}
          />
          
          ))}
        </Stack>

        <FormHelperText error={!isValid} style={{ textAlign: 'right' }}>
          {!isValid && 'Code is required'}
        </FormHelperText>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting} sx={{ mt: 3 }}>
          Verify
        </LoadingButton>
      </Form>
    </FormikProvider>
  );
}

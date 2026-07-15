import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Button, Container, Link, Typography } from '@material-ui/core';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import { ResetPasswordForm } from '../../components/authentication/reset-password';
//
import { SentIcon } from '../../assets';
import { VerifyCodeForm } from 'src/components/authentication/verify-code';
import PasswordResetForm from 'src/components/authentication/password-reset/password-reset-form';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function ChangePassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetPass, setResetPass] = useState(false);

  return (
    <RootStyle title="Reset Password | Umbrelytics ">
      <LogoOnlyLayout />

      <Container>
        <Box sx={{ maxWidth: 480, mx: 'auto' }}>
          
        <>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" paragraph>
              Reset your password?
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 5 }}>
               Set the new password for your account so you can login and access all featuress.
              </Typography>

              <PasswordResetForm setResetPass={setResetPass} />
              <Button fullWidth size="large" onClick={() => setResetPass(false)} sx={{ mt: 1 }}>
                Back
              </Button>
            </Box>
            </>
        </Box>
      </Container>
    </RootStyle>
  );
}

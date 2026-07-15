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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetPass, setResetPass] = useState(false);

  return (
    <RootStyle title="Reset Password | Umbrelytics ">
      <LogoOnlyLayout />

      <Container>
        <Box sx={{ maxWidth: 480, mx: 'auto' }}>
          {!sent ? (
            <>
              <Typography variant="h3" paragraph>
                Forgot your password?
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                Please enter the email address associated with your account and We will email you a link to reset your
                password.
              </Typography>

              <ResetPasswordForm onSent={() => setSent(true)} onGetEmail={(value) => setEmail(value)} />

              <Button fullWidth size="large" onClick={() => navigate('/')} sx={{ mt: 1 }}>
                Back
              </Button>
            </>
          ) : !resetPass ?(
            <Box sx={{ textAlign: 'center' }}>
              <SentIcon sx={{ mb: 3, mx: 'auto', height: 105 }} />

              <Typography variant="h3" gutterBottom>
                Request sent successfully
              </Typography>
              <Typography>
                We have sent a confirmation email to &nbsp;
                <strong>{email}</strong>
                <br />
                Please check your email.
              </Typography>

              {/* <Box sx={{ mt: 3,mb:4 }}>
                <VerifyCodeForm setResetPass={setResetPass} />
              </Box>

              <Typography variant="body2" align="center">
                Don’t have a code? &nbsp;
                <Link variant="subtitle2" underline="none" onClick={() => {}}>
                  Resend code
                </Link>
              </Typography> */}
              <Button size="large" variant="contained" onClick={() => navigate('/')} sx={{ mt: 5 }}>
                Back
              </Button>
            </Box>
          ):''}
          {resetPass &&(<>
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
            </>)}
        </Box>
      </Container>
    </RootStyle>
  );
}

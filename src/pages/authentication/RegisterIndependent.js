import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import {
  Box,
  Card,
  Link,
  Container,
  Typography,
  Stack,
} from '@material-ui/core'
import { PATH_AUTH } from '../../routes/paths'
import Page from '../../components/Page'
import { MHidden } from '../../components/@material-extend'
import RegisterIndependentForm from '../../components/authentication/register/RegisterIndependentForm'

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: { display: 'flex' },
}))
const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}))
const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 560,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(6, 0),
}))

export default function RegisterIndependent() {
  const [submittedEmail, setSubmittedEmail] = useState(null)

  return (
    <RootStyle title="Register | Umbrelytics">
      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            Plan smarter. Join Umbrelytics.
          </Typography>
          <img
            src="/static/illustrations/illustration_login.png"
            alt="register"
          />
        </SectionStyle>
      </MHidden>

      <Container maxWidth="sm">
        <ContentStyle>
          <Card variant="outlined" sx={{ p: 3, borderRadius: '15px' }}>
            {submittedEmail ? (
              <Stack spacing={2} sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h4">Almost there</Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  We&apos;ve sent a verification link to{' '}
                  <strong>{submittedEmail}</strong>. Click it to confirm your
                  email. After that, your account will be reviewed and
                  you&apos;ll be emailed once it&apos;s approved.
                </Typography>
                <Link
                  component={RouterLink}
                  to={PATH_AUTH.login}
                  variant="subtitle2"
                >
                  Back to sign in
                </Link>
              </Stack>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    Create your teacher account
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    For independent teachers — no school required.
                  </Typography>
                </Box>
                <RegisterIndependentForm onRegistered={setSubmittedEmail} />
                <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to={PATH_AUTH.login}
                    variant="subtitle2"
                  >
                    Sign in
                  </Link>
                </Typography>
              </>
            )}
          </Card>
        </ContentStyle>
      </Container>
    </RootStyle>
  )
}

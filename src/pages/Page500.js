import { Link as RouterLink } from 'react-router-dom';
import { experimentalStyled as styled } from '@material-ui/core/styles';
// material
import { Box, Button, Typography, Container } from '@material-ui/core';
// components
import Page from '../components/Page';
import { SeverErrorIllustration } from '../assets';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

// ----------------------------------------------------------------------

export default function Page500() {
  return (
    <RootStyle title="500 Internal Server Error  | Umbrelytics ">
      <Container>
        <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
          <Typography variant="h3" paragraph>
            Data Not Found
          </Typography>
          {/* <Typography sx={{ color: 'text.secondary' }}>Unable to load data</Typography> */}

          <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />

          {/* <Button to="/" size="large" variant="contained" component={RouterLink}>
            Go to Home
          </Button> */}
        </Box>
      </Container>
    </RootStyle>
  );
}

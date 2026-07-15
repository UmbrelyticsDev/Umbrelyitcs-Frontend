import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import plusFill from '@iconify/icons-eva/plus-fill';
import cloudFill from '@iconify/icons-eva/cloud-upload-fill';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Tooltip,
  Stack,
  Link,
  Avatar,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormHelperText,
  TextField,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import { fDate } from 'src/utils/formatTime';
import { fCurrency } from 'src/utils/formatNumber';
import ClassImg from '../../../../../../../src/images/class-icon.png'
import Label from 'src/components/Label';
import { sentenceCase } from 'change-case';
import { useTheme } from '@emotion/react';
import Page from 'src/components/Page';
import { PATH_DASHBOARD } from 'src/routes/paths';
import Logo from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import Scrollbar from 'src/components/Scrollbar';
import { MLinearProgress } from 'src/components/@material-extend';
import { ArrowBack, Person, School } from '@material-ui/icons';
import { UploadSingleFile } from 'src/components/upload';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import fakeRequest from 'src/utils/fakeRequest';
import { useSnackbar } from 'notistack';
import LightboxModal from 'src/components/LightboxModal';
import Page500 from 'src/pages/Page500';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import AnalyticsSearch from '../department-analytics/analytics-search';

// ----------------------------------------------------------------------

const user_type = JSON.parse(localStorage.getItem('user_type'));
console.log('user_type', user_type);

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt:{xs:14,sm:33,md:13,lg:13},
};

const CaptionStyle = styled(CardContent)(({ theme }) => ({
  bottom: 0,
  width: '100%',
  height:'60px',
  marginTop:'50px',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  backdropFilter: 'blur(103px)',
  WebkitBackdropFilter: 'blur(103px)',
  justifyContent: 'space-between',
  color: theme.palette.common.white,
  backgroundColor: alpha(theme.palette.grey[900], 0.52),
  borderBottomLeftRadius: theme.shape.borderRadiusMd,
  borderBottomRightRadius: theme.shape.borderRadiusMd
}));

const GalleryImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

const staticGallery = [
  {
    id: 1,
    imageUrl: 'https://www.researchgate.net/publication/317798300/figure/fig2/AS:508152673837056@1498164446854/Percentage-of-students-positive-to-academic-interest-by-level-of-satisfaction-with.png',
    title: 'Mid Term Subject Analytics',
    postAt: '2023-06-15T12:00:00Z'
  },
  {
    id: 2,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGXtN1V_KeHQbKr3ShEV2Qh3tWYqvE44A5pPNlhronF7YuJcD3gwBekijIo2VZ_c7pGqQ&usqp=CAU',
    title: 'Half Early Subject Analytics',
    postAt: '2023-07-01T10:30:00Z'
  },
  {
    id: 3,
    imageUrl: 'https://pub.mdpi-res.com/environments/environments-06-00081/article_deploy/html/images/environments-06-00081-g001.png?1564572397',
    title: 'Annual Subject Analytics',
    postAt: '2023-07-10T15:45:00Z'
  }
];

function GalleryItem({ image, onOpenLightbox }) {
  const { imageUrl, title, postAt } = image;
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(null);
  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    };
    
    const handleClose = () => {
      setOpen(null);
      };
  return (
    <Card variant='outlined' sx={{ pt: '100%', cursor: 'pointer', boxShadow: 'none', }}>
      <GalleryImgStyle alt="gallery image" src={imageUrl} onClick={() => onOpenLightbox(imageUrl)} />

      <CaptionStyle>
        <div>
            <Tooltip title={title}>
                <Typography variant="subtitle1" sx={{maxWidth: {xs:user_type !== 1 ? 250 : 200, sm:user_type !== 1 ? 200 : 160, md:user_type !== 1 ? 200 : 160}, overflow: 'hidden',textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                {title}
            </Typography>
            </Tooltip>
          <Typography variant="body2" sx={{ opacity: 0.72 }}>
            {fDate(postAt)}
          </Typography>
        </div>
        {user_type === 1 ? (<IconButton ref={ref} onClick={handleOpen} color="inherit">
          <Icon icon={moreVerticalFill} width={20} height={20} />
        </IconButton>) : ''}
        <Menu
          open={isOpen}
          anchorEl={ref.current}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: { width: 200, maxWidth: '100%' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleClose} sx={{ color: 'primary.main' }}>
            <ListItemIcon>
              <Icon icon={editFill} width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
          <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Icon icon={trash2Outline} width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
        </Menu>
      </CaptionStyle>
    </Card>
  );
}

GalleryItem.propTypes = {
  image: PropTypes.object,
  onOpenLightbox: PropTypes.func
};

export default function TeacherAnalytics() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [valueScrollable, setValueScrollable] = useState('1');
  const { enqueueSnackbar } = useSnackbar();
  const [analytics, setAnalytics] = useState(false);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState(staticGallery);

  const imagesLightbox = filteredUsers.map((img) => img.imageUrl);

  const handleOpenLightbox = (url) => {
    const selectedImageIndex = filteredUsers.findIndex((img) => img.imageUrl === url);
    setOpenLightbox(true);
    setSelectedImage(selectedImageIndex);
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredUsers(staticGallery);
    } else {
      const filtered = staticGallery.filter(user =>
        user.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const NewUserSchema = Yup.object().shape({
    cover: Yup.mixed().required('Analytics Image is required'),
    analyticsName: Yup.string().required('Analytics Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Analytics Name should not contain numbers or special characters')
    .min(2, 'Too Short!')
    .max(50, 'Too Long!'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      cover: null,
      analyticsName: '',
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        await fakeRequest(500);
        console.log('Form Values :', values);
        resetForm();
        setSubmitting(false);
        enqueueSnackbar('Analytics Image Uploaded', { variant: 'success' });
        setAnalytics(false);
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFieldValue('cover', {
          ...file,
          preview: URL.createObjectURL(file)
        });
      }
    },
    [setFieldValue]
  );

  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Page title="Subject Analytics Listing | Umbrelytics ">
      <Container>
        {user_type !== 3 && user_type !== 4 && user_type !== 2 && valueScrollable === '1' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              sx={{ color: '#fff' }} color='success'
              onClick={() => setAnalytics(true)}
              startIcon={<Icon icon={cloudFill} />}
            >
              Upload Analytics
            </Button>
          </Box>)}

          <Modal handleClose={() => setAnalytics(false)} modalTitle={'Upload Analytics Image'} open={analytics}>
          <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <DialogContent>
                <Stack direction={'column'} spacing={2}>
                  <TextField
                    fullWidth
                    label="Analytics Name"
                    {...getFieldProps('analyticsName')}
                    error={Boolean(touched.analyticsName && errors.analyticsName)}
                    helperText={touched.analyticsName && errors.analyticsName}
                  />
                  <div>
                    <UploadSingleFile
                      maxSize={3145728}
                      accept="image/*"
                      file={values.cover}
                      onDrop={handleDrop}
                      error={Boolean(touched.cover && errors.cover)}
                      onDelete={() => setFieldValue('cover', null)}
                    />
                    {touched.cover && errors.cover && (
                      <FormHelperText error sx={{ px: 2 }}>
                        {touched.cover && errors.cover}
                      </FormHelperText>
                    )}
                  </div>
                </Stack>
              </DialogContent>
              <DialogActions sx={{mt:-3}}>
                <Box sx={{ flexGrow: 1 }} />
                <LoadingButton startIcon={<Icon icon={cloudFill} />} type="submit" color='success' sx={{ color: '#fff' }} variant="contained" loading={isSubmitting} loadingIndicator={"Uploading..."}>
                  Upload Analytics
                </LoadingButton>
                <Button type="button" variant="outlined" color="error" onClick={() => setAnalytics(false)}>
                  Cancel
                </Button>
              </DialogActions>
            </Form>
          </FormikProvider>
        </Modal>

        {loading ? (
          <Grid>
            <Paper sx={style}>
              <Box sx={{ width: '100%' }}>
                <MLinearProgress color='inherit' />
                <MLinearProgress color='warning' sx={{ mt: 2 }} />
                <MLinearProgress color='success' sx={{ mt: 2, }} />
                <MLinearProgress color='inherit' sx={{ mt: 2, }} />
              </Box>
            </Paper>
          </Grid>) : (
          <>
            <Stack sx={{ mt: 5 }}>
                <AnalyticsSearch sx={{ mb: 4 }} staticData={staticGallery} onSearch={handleSearch} />
                {filteredUsers.length === 0 ? ( 
                    <>
                    <Box sx={{mt:-13}}>
                        <Page500 />
                    </Box>   
                    </>
                ) : (
                  <Grid container spacing={3}>
                    {filteredUsers.map((image) => (
                      <Grid key={image.id} item xs={12} sm={6} md={4}>
                        <GalleryItem image={image} onOpenLightbox={handleOpenLightbox} />
                      </Grid>
                    ))}
                  </Grid>
                )}

                <LightboxModal
                  images={imagesLightbox}
                  photoIndex={selectedImage}
                  setPhotoIndex={setSelectedImage}
                  isOpen={openLightbox}
                  onClose={() => setOpenLightbox(false)}
                />
            </Stack>
          </>)}

      </Container>
    </Page>
  );
}
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
import { fDate } from 'src/utils/formatTime';
import { useTheme } from '@emotion/react';
import Page from 'src/components/Page';
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import Scrollbar from 'src/components/Scrollbar';
import { MLinearProgress } from 'src/components/@material-extend';
import { UploadSingleFile } from 'src/components/upload';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import fakeRequest from 'src/utils/fakeRequest';
import { useSnackbar } from 'notistack';
import LightboxModal from 'src/components/LightboxModal';
import Page500 from 'src/pages/Page500';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import AnalyticsSearch from '../../department-analytics/analytics-search';
import { storage } from 'src/firebase/Constant';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

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
    imageUrl: 'https://www.hubspot.com/hs-fs/hubfs/Google%20Drive%20Integration/types%20of%20charts_32023-May-22-2023-10-17-23-9455-PM.png?width=600&height=451&name=types%20of%20charts_32023-May-22-2023-10-17-23-9455-PM.png',
    title: 'Mid Term Class Analytics',
    postAt: '2023-06-15T12:00:00Z'
  },
  {
    id: 2,
    imageUrl: 'https://wac-cdn.atlassian.com/dam/jcr:2f531e03-7689-44e8-b6ed-0aaa3db6832d/grouped-bar-chart.png?cdnVersion=2037',
    title: 'Half Early Class Analytics',
    postAt: '2023-07-01T10:30:00Z'
  },
  {
    id: 3,
    imageUrl: 'https://wac-cdn.atlassian.com/dam/jcr:a082bd10-59d5-4419-88c4-c7aa9dd1e17f/stacked-bar-chart.png?cdnVersion=2037',
    title: 'Annual Class Analytics',
    postAt: '2023-07-10T15:45:00Z'
  }
];

function GalleryItem({ image, onOpenLightbox ,setAnalytics,setTempEditId,setRefresh,refresh}) {
  // const { imageUrl, title, postAt } = image;
  const { analyticsName, analyticsImage, analyticsuploadedTime ,id} = image;
  const { enqueueSnackbar } = useSnackbar();

  const ref = useRef(null);
  const [isOpen, setOpen] = useState(null);

  const handleEditPageOpen = ()=>{
    setTempEditId(id)
    setAnalytics(true)
  }  

  const handleDelete=async()=>{
    await axios.delete(`${REST_API_END_POINT}delete-class-analytics/${id}`)
    .then(res =>{
       enqueueSnackbar('Deleted Successfully' , { variant: 'success' });
       setRefresh(!refresh)
       // window.location.reload()
    }).catch(err=>console.log(err))
     }



  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    };
    
    const handleClose = () => {
      setOpen(null);
      };
  return (
    <Card variant='outlined' sx={{ pt: '100%', cursor: 'pointer', boxShadow: 'none', }}>
      <GalleryImgStyle alt="gallery image" src={analyticsImage} onClick={() => onOpenLightbox(analyticsImage)} />

      <CaptionStyle>
        <div>
            <Tooltip title={analyticsName}>
                <Typography variant="subtitle1" sx={{maxWidth: {xs:user_type !== 1 ? 250 : 200, sm:user_type !== 1 ? 200 : 160, md:user_type !== 1 ? 200 : 160}, overflow: 'hidden',textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                {analyticsName}
            </Typography>
            </Tooltip>
          <Typography variant="body2" sx={{ opacity: 0.72 }}>
            {analyticsuploadedTime}
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
          <MenuItem onClick={handleEditPageOpen} sx={{ color: 'primary.main' }}>
            <ListItemIcon>
              <Icon icon={editFill} width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
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

export default function ClassAnalyticsListing({classId}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [valueScrollable, setValueScrollable] = useState('1');
  const { enqueueSnackbar } = useSnackbar();
  const [analytics, setAnalytics] = useState(false);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tempEditId, setTempEditId] = useState(null);
  const [data,setData] = useState([])
  const [refresh,setRefresh] = useState(false)

  useEffect(()=>{
    fetchAnalyticsData()
    fetchDataForEditing()
  },[refresh,tempEditId])

const fetchAnalyticsData = async () => {
await axios.get(`${REST_API_END_POINT}get-class-analytics/${classId}`)
.then(res =>{
  if(res.data.status === 1) {
    setFilteredUsers(res.data.result)
  }else{
    console.log('not getting data');
  }
}).catch(err =>console.log(err))
  }

  const fetchDataForEditing= async()=>{
    await axios.get(`${REST_API_END_POINT}get-class-analytics-for-editing/${tempEditId}`)
    .then(res => {
      if(res.data.status=== 1){
        setData(res.data.result[0])
      }else{
     console.log('not getting data');
     
      }
    })
  }

  const imagesLightbox = filteredUsers.map((img) => img.analyticsImage);

  const handleOpenLightbox = (url) => {
    const selectedImageIndex = filteredUsers.findIndex((img) => img.analyticsImage === url);
    setOpenLightbox(true);
    setSelectedImage(selectedImageIndex);
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      fetchAnalyticsData()
    } else {
      const filtered = filteredUsers.filter(user =>
        user.analyticsName.toLowerCase().includes(searchQuery.toLowerCase())
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
      cover: data? data.analyticsImage : null,
      analyticsName: data?data.analyticsName : '',
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        // await fakeRequest(500);
        // console.log('Form Values :', values);
        // resetForm();
        // setSubmitting(false);
        // enqueueSnackbar('Analytics Image Uploaded', { variant: 'success' });
        // setAnalytics(false);

        const response = await axios.post(`${REST_API_END_POINT}${tempEditId?'edit-class-analytics-data/'+tempEditId :'add-class-analytics/'+classId}`,{values})
        if(response.data.status === 1){
        enqueueSnackbar('Analytics Image Uploaded', { variant: 'success' });
        setAnalytics(false);
        resetForm();
        setRefresh(!refresh)
        }else{
          enqueueSnackbar('Analytics Image Not Uploaded', { variant: 'error' });
        }
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
        uploadImgToFirebase(file)
        // setFieldValue('cover', {
        //   ...file,
        //   preview: URL.createObjectURL(file)
        // });
      }
    },
    [setFieldValue]
  );


  const uploadImgToFirebase = (file) => {
 
    const storageRef = storage.ref(`images/${file.name}`);

 
    const uploadTask = storageRef.put(file);


    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Upload failed:', error);
      },
      () => {
      
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);
      
            setFieldValue('cover',downloadURL)
        
        });
      }
    );
  };

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
    <Page title="Class Analytics Listing | Umbrelytics ">
      <Container>
        {user_type !== 3 && user_type !== 4 && user_type !== 2 && valueScrollable === '1' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              sx={{ color: '#fff' }} color='success'
              onClick={() => {
                setTempEditId(null)
                setAnalytics(true)}
              }
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
                <AnalyticsSearch sx={{ mb: 4 }} staticData={filteredUsers} onSearch={handleSearch} />
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
                        <GalleryItem image={image} onOpenLightbox={handleOpenLightbox} setAnalytics={setAnalytics} setTempEditId={setTempEditId} setRefresh={setRefresh} refresh={refresh}/>
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
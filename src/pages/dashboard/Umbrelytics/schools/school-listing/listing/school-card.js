import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import twitterFill from '@iconify/icons-eva/twitter-fill';
import linkedinFill from '@iconify/icons-eva/linkedin-fill';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import facebookFill from '@iconify/icons-eva/facebook-fill';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import instagramFilled from '@iconify/icons-ant-design/instagram-filled';
// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Card, Grid, Avatar, Tooltip, Divider, Typography, IconButton, Stack, Link, Button, Popover, MenuItem, Menu, ListItemIcon, ListItemText } from '@material-ui/core';
// utils
import { fShortenNumber } from '../../../../../../utils/formatNumber';
import SvgIconStyle from 'src/components/SvgIconStyle';
import { MIconButton } from 'src/components/@material-extend';
import Label from 'src/components/Label';
import { useTheme } from '@emotion/react';
import { useRef, useState } from 'react';
import { CloseRounded, ContactMail, Edit, Email, FlightTakeoff, Person, Phone } from '@material-ui/icons';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useSnackbar } from 'notistack';
import { setSchoolId } from '../../DynamicId/dynamicId';

//


// ----------------------------------------------------------------------

const CardMediaStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  justifyContent: 'center',
  paddingTop: 'calc(100% * 9 / 16)',
  '&:before': {
    top: 0,
    zIndex: 9,
    content: "''",
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderTopLeftRadius: theme.shape.borderRadiusMd,
    borderTopRightRadius: theme.shape.borderRadiusMd,
    backgroundColor: alpha(theme.palette.primary.darker, 0.42)
  }
}));

const CardMediaStyle1 = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  justifyContent: 'center',
  height: 200,
  '&:before': {
    top: 0,
    zIndex: 9,
    content: "''",
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderTopLeftRadius: theme.shape.borderRadiusMd,
    borderTopRightRadius: theme.shape.borderRadiusMd,
    backgroundColor: alpha(theme.palette.primary.darker, 0.32)
  }
}));

const CoverImgStyle = styled('img')({
  top: 0,
  zIndex: 8,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------


SchoolCard.propTypes = {
  user: PropTypes.object.isRequired
};

export default function SchoolCard({ user, ...other }) {
  // const { name, cover, email, verified, totalPost, avatarUrl, following,status } = user;
  const { school_name, school_image,location,contact_name, contact_email,contact_phoneNumber,contact_designation, verified, totalPost, school_logo,status,id } = user;
  const theme = useTheme();
  const ref = useRef(null);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setOpen] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);

  const handleActicvate = async()=>{
    if(status===1){
      axios.put(`${REST_API_END_POINT}updateSchool/${id}`,{status: 0})
      .then(res=>{
        if(res.data.status===1){
          enqueueSnackbar(`School Deactivated successfully`, { variant: 'success' });
          window.location.reload()
        }else{
          enqueueSnackbar(`School Deactivation Failed`, { variant: 'error' });
        }
      })
    }else{
      axios.put(`${REST_API_END_POINT}updateSchool/${id}`,{status: 1})
      .then(res=>{
        if(res.data.status===1){
          enqueueSnackbar(`School Activated successfully`, { variant: 'success' });
          window.location.reload()
        }else{
          enqueueSnackbar(`Failed to Activate School`, { variant: 'error' });
        }
      })
    }
  }

  const handleDelete = async()=>{
    axios.delete(`${REST_API_END_POINT}deleteSchool/${id}`)
    .then(res=>{
      if(res.data.status===1){
        enqueueSnackbar(`Deleted successfully`, { variant: 'success' });
        window.location.reload()
      }else{
        enqueueSnackbar(`Not deleted`, { variant: 'error' });
      }
    })
    }

  const handleNavigateToSchoolDetails=()=>{
    localStorage.setItem('schoolId', id);
    console.log(id,status,verified);
    setSchoolId(id)
    
    if(status === 0 && verified ===0){
      enqueueSnackbar(`School is not active and verified`, { variant: 'error' });
    }else if(status === 0 ){
      enqueueSnackbar(`School is not active `, { variant: 'warning' });
    }else if(verified ===0){
      enqueueSnackbar(`School is not verified`, { variant: 'error' });

    }else{
      // navigate(PATH_DASHBOARD.general.department)
      navigate(PATH_DASHBOARD.general.department, { state: { schoolId: id } });
    }
  }

  const handleNavigateToEditPag=()=>{
    if(status ===0){
      enqueueSnackbar(`School is not active `, { variant: 'warning' });
      return
    }
    const editSchoolPath = PATH_DASHBOARD.general.editSchool.replace(':id', id);
    navigate(editSchoolPath)
  }


  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    };
    
    const handleClose = () => {
      setOpen(null);
      };
  const [pointOfContact, setPointOfContact] = useState(null);
  const handleOpenPointContact = (event) => {
    setPointOfContact(event.currentTarget);
  };

  const handleClosePointContact = () => {
    setPointOfContact(null);
  };

  return (
    <Card {...other} sx={{boxShadow:'0 0 2px 0 rgba(145, 158, 171, 0.24),0 16px 32px -4px rgba(145, 158, 171, 0.54)',transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
      {user_type === 1 ? (<CardMediaStyle>
        
        <SvgIconStyle
          color="paper"
          src="/static/icons/shape-avatar.svg"
          sx={{
            width: 144,
            height: 62,
            zIndex: 10,
            bottom: -26,
            position: 'absolute'
          }}
        />
        <Avatar
          alt={school_name}
          src={school_logo}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            position: 'absolute',
            transform: 'translateY(-50%)'
          }}
        />
        <CoverImgStyle alt="cover" src={school_image} />
        <Stack sx={{display:'flex',justifyContent:'space-between',flexDirection:'row'}}>
            <Box sx={{ position: 'absolute', top: 8, left: 8,zIndex:999 }}>
                {status === 1 ? (<Label sx={{color:'#54D62C',backgroundColor:'#E4F8DD'}}>Active</Label>) : <Label sx={{color:'#FF4842',backgroundColor:'#FFE2E1'}}>Inactive</Label>}
            </Box>
            <Box sx={{ position: 'absolute', top: 8, right: 8,zIndex:999, }}>
              <MIconButton sx={{color:'white',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}} ref={ref} onClick={handleOpen}>
                <Icon icon={moreVerticalFill} width={20} height={20} />
              </MIconButton>
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
                  <ListItemText onClick={handleNavigateToEditPag} primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
                <MenuItem onClick={handleActicvate} sx={{ color:status===1?'error.main' :`success.dark`}}>
                  <ListItemIcon>
                    <Stack className='lets-icons--check-fill' sx={{fontSize:'1.5rem'}} />
                  </ListItemIcon>
                  {
                    status===1?
                    <ListItemText  primary="Deactivate" primaryTypographyProps={{ variant: 'body2' }} />
                    :
                    <ListItemText  primary="Activate" primaryTypographyProps={{ variant: 'body2' }} />

                  }
                </MenuItem>
                <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <Icon icon={trash2Outline} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText onClick={handleDelete} primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
              </Menu>
            </Box>
        </Stack>
        
      </CardMediaStyle>) : <CardMediaStyle1>
        
        <SvgIconStyle
          color="paper"
          src="/static/icons/shape-avatar.svg"
          sx={{
            width: 144,
            height: 62,
            zIndex: 10,
            bottom: -26,
            position: 'absolute'
          }}
        />
        <Avatar
          alt={school_name}
          src={school_logo}
          sx={{
            width: 64,
            height: 64,
            zIndex: 11,
            position: 'absolute',
            transform: 'translateY(260%)'
          }}
        />
        <CoverImgStyle alt="cover" src={school_image} />
      </CardMediaStyle1>}
      <Stack direction={'row'} justifyContent={'center'} sx={{textAlign:'center',mt: 6,mb:0.5,}}>
        <Link>
            <Tooltip title={school_name}>
                <Typography variant="subtitle1" onClick={handleNavigateToSchoolDetails} sx={{  maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer' }}>
                 {school_name}
                </Typography>     
            </Tooltip>
        </Link>
      </Stack>
      <Stack direction={'row'} justifyContent={'center'} sx={{textAlign:'center',mb:0.5}}>
        <Stack className='fluent--location-20-regular' sx={{fontSize:'1.1rem',mr:0.3,color: 'text.secondary',mt:0.1}}/>
        <Tooltip title={location}>
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer' }} noWrap>
            {location}
          </Typography>     
        </Tooltip>
      </Stack>
      {verified === 1 ?(<Stack direction={'row'} sx={{mb:2.5}} justifyContent={'center'}>
          <Stack className='lets-icons--check-fill' sx={{fontSize:'1.1rem',mr:0.5,color: 'success.main',mt:0.2}}/>
          <Box>
            <Typography variant="body2" align="center" sx={{ color: 'success.main', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer' }} noWrap>
              Verified
            </Typography>     
          </Box>
        </Stack>) : <Stack direction={'row'} sx={{mb:2.5}} justifyContent={'center'}>
          <Stack className='carbon--close-filled' sx={{fontSize:'1rem',mr:0.5,color: 'error.main',mt:0.3}}/>
          <Box>
            <Typography variant="body2" align="center" sx={{ color: 'error.main', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer' }} noWrap>
              Not Verified
            </Typography>     
          </Box>
        </Stack>}

      <Divider />

      <Grid container sx={{ py: 3, textAlign: 'center',display:'flex',justifyContent:'center' }}>
        <Stack direction={'row'} justifyContent={'center'}>
          <Button onClick={handleOpenPointContact} variant='outlined'>Point Of Contact</Button>
        </Stack>
      </Grid>
      <Popover
        open={!!pointOfContact}
        anchorEl={pointOfContact}
        anchorOrigin={{ vertical: 1270, horizontal: 130 }}
        transformOrigin={{ vertical: 1250, horizontal: 210 }}
        PaperProps={{
          sx: { width: 'fit-content' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1, pt: 1,pb:1 }}>
          <Typography variant='h6' sx={{fontWeight:'bold',ml:2,}}>
             Point Of Contact
          </Typography>
          <MIconButton size="small" onClick={handleClosePointContact}>
            <CloseRounded  sx={{color:'#0f171e'}} />
          </MIconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
            <MenuItem>
              <Person sx={{ mr: 1,mt:-0.5 }} />
              Name
            </MenuItem>
            <MenuItem>
             {contact_name}
            </MenuItem>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
            <MenuItem>
              <Email sx={{ mr: 1.3,mt:-0.4,fontSize:'1.3rem' }} />
              Email
            </MenuItem>
            <MenuItem>
              {contact_email}
            </MenuItem>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
            <MenuItem>
              <Phone  sx={{ mr: 1.3,mt:-0.4,fontSize:'1.3rem' }}/>
              Phone
            </MenuItem>
            <MenuItem>
                {contact_phoneNumber}
            </MenuItem>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
            <MenuItem>
              <ContactMail  sx={{ mr: 1.3,mt:-0.4,fontSize:'1.3rem' }}/>
              Designation
            </MenuItem>
            <MenuItem>
                {contact_designation}
            </MenuItem>
        </Box>
      </Popover>
    </Card>
  );
}

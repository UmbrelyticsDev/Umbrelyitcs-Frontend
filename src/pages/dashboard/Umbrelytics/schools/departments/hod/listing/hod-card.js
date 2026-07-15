import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import twitterFill from '@iconify/icons-eva/twitter-fill';
import linkedinFill from '@iconify/icons-eva/linkedin-fill';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import facebookFill from '@iconify/icons-eva/facebook-fill';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import syncOutline from '@iconify/icons-eva/sync-outline';
import instagramFilled from '@iconify/icons-ant-design/instagram-filled';
// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Card, Grid, Avatar, Tooltip, Typography, IconButton, Stack, Link, Button, Popover, MenuItem, Menu, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
// utils
import { fShortenNumber } from '../../../../../../../utils/formatNumber';
import SvgIconStyle from 'src/components/SvgIconStyle';
import { MIconButton } from 'src/components/@material-extend';
import Label from 'src/components/Label';
import { useTheme } from '@emotion/react';
import { useRef, useState } from 'react';
import { CloseRounded, ContactMail, Edit, Email, FlightTakeoff, Person, Phone } from '@material-ui/icons';
import { useLocation, useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useSnackbar } from 'notistack';

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
    // backgroundColor: alpha(theme.palette.primary.darker, 0.42)
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


HODCard.propTypes = {
  user: PropTypes.object.isRequired,
  
};

export default function HODCard({ user,isDetailsPage,setTempEditId,setHod, ...other }) {
  const location = useLocation();
  const isDepartmentDetailsPage = location.pathname === "/dashboard/schools/department/hod-listing";
  console.log('kkkkkkkkkk',isDepartmentDetailsPage);
  // const { name, cover, email,phone, verified, totalPost, avatarUrl, following,status } = user;
  const { name, cover, email,	phoneNumber	, verified, totalPost, image, following,status,id } = user;
  const theme = useTheme();
  const ref = useRef(null);
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setOpen] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleActivateHod= async()=>{
    if(status===1) {
      await axios.put(`${REST_API_END_POINT}update-status-hod/${id}`,{status:0})
    .then(res =>{
      if(res.data.status===1) {
        enqueueSnackbar('HOD Deactivated Successfully' , { variant: 'success' });
        window.location.reload()
      }else {
        enqueueSnackbar('HOD Deactivated Failed' , { variant: 'error' });
         
      }
    }).catch(err =>console.log(err))
    }else{
      await axios.put(`${REST_API_END_POINT}update-status-hod/${id}`,{status:1})
    .then(res =>{
      if(res.data.status===1) {
        enqueueSnackbar('HOD Activated Successfully' , { variant: 'success' });
        window.location.reload()
      }else {
        enqueueSnackbar('HOD Activated Failed' , { variant: 'error' });
         
      }
    }).catch(err =>console.log(err))
    }
  }

const handleDeleteHod = async ()=>{
axios.delete(`${REST_API_END_POINT}delete-hod/${id}`)
.then(res => {
  if(res.data.status===1){
    window.location.reload()
    enqueueSnackbar('HOD Deleted Successfully' , { variant: 'success' });
  }else{
    enqueueSnackbar('HOD Not Deleted' , { variant: 'error' });

  }
}).catch(err =>console.log(err))
  }

  const handleEditOpen=(id,status)=>{
    if(status===0){
      enqueueSnackbar('HOD is Inactive' , { variant: 'error' });
      return
    }
    setTempEditId(id)
    setHod(true)
  }

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    };
    
    const handleClose = () => {
      setOpen(null);
      };

  const handleConvertToTeacher = async()=>{
    const response = await axios.post(`${REST_API_END_POINT}convert-hod-to-teacher/${id}`)
    if(response.data.status===1){
      window.location.reload()
      enqueueSnackbar('HOD Converted to Teacher Successfully' , { variant: 'success' });
    }else if(response.data.status===3){
      enqueueSnackbar('Teacher limit reached' , { variant: 'warning' });
    }else{
      enqueueSnackbar('Failed to Convert' , { variant: 'error' });
  
    }
  }

  return (
    <Card
      sx={{
        py: 10,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        flexDirection: 'column',
        boxShadow:'0 0 2px 0 rgba(145, 158, 171, 0.24),0 16px 32px -4px rgba(145, 158, 171, 0.54)',transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Avatar alt={name} src={image} sx={{ width: 64, height: 64, mb: 2, mt: user_type === 3 && -5 }} />
          <Stack sx={{display:'flex',justifyContent:'space-between',flexDirection:'row'}}>
             {user_type !== 3 && (<Box sx={{ position: 'absolute', top: 15, left: 15,zIndex:999 }}>
                 {status === 1 ? (<Label sx={{color:'#54D62C',backgroundColor:'#E4F8DD'}}>Active</Label>) : <Label sx={{color:'#FF4842',backgroundColor:'#FFE2E1'}}>Inactive</Label>}
             </Box>)}
             <Box sx={{ position: 'absolute', top: 8, right: 8,zIndex:999, }}>
             {!isDetailsPage ? (
              <MIconButton ref={ref} onClick={handleOpen}>
                 <Icon icon={moreVerticalFill} width={20} height={20} />
               </MIconButton>
              ) : ''}
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
                <MenuItem onClick={()=>handleEditOpen(id,status)} sx={{ color: 'primary.main' }}>
                  <ListItemIcon>
                    <Icon icon={editFill} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
                <MenuItem onClick={handleActivateHod} sx={{ color:status===1?'error.main' :'success.dark' }}>
                  <ListItemIcon>
                    <Stack className='lets-icons--check-fill' sx={{fontSize:'1.5rem'}} />
                  </ListItemIcon>
                  {
                    status===1?
                    <ListItemText primary="Deactivate" primaryTypographyProps={{ variant: 'body2' }} />
                    :
                    <ListItemText primary="Activate" primaryTypographyProps={{ variant: 'body2' }} />

                  }
                </MenuItem>
                <MenuItem onClick={handleDeleteHod} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <Icon icon={trash2Outline} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>

                <MenuItem onClick={handleConvertToTeacher} sx={{ color: 'success.main' }}>
                  <ListItemIcon>
                    <Icon icon={syncOutline} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Convert To Teacher" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>

              </Menu>
            </Box>
        </Stack>
        <Tooltip title={name}>
          <Typography variant="subtitle1" color="text.primary" sx={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer',textAlign:'center'}}>
            {name}
          </Typography>
        </Tooltip>
        {user_type !== 3 && (<Tooltip title={email}>
          <Typography variant="body2" sx={{ color: 'text.secondary',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer',textAlign:'center' }}>
            {email}
          </Typography>
        </Tooltip>)}
        {user_type === 3 && (
          <>
          <Tooltip title={email}>
          <Stack direction={'row'} sx={{mt:0}} justifyContent={'center'}>
          <Email sx={{fontSize:'1rem',mr:0.7,color: 'text.secondary',mt:0.7}}/>
          <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer',textAlign:'center',mt:0.5 }}>
            {email}
          </Typography>   
          </Box>
        </Stack>
        </Tooltip>

          <Tooltip title={	phoneNumber	}>
          <Stack direction={'row'} sx={{mb:0.5,mt:0.3,ml:-3}} justifyContent={'center'}>
          <Phone sx={{fontSize:'1rem',mr:0.7,color: 'text.secondary',mt:0.7}}/>
          <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer',textAlign:'center',mt:0.5 }}>
            {	phoneNumber	}
          </Typography>   
          </Box>
        </Stack>
        </Tooltip>
        </>
      )}

        {verified === 1 && user_type === 3 && (<Stack direction={'row'} sx={{mt:0.3,ml:-8}} justifyContent={'center'}>
          <Stack className='lets-icons--check-fill' sx={{fontSize:'1.2rem',mr:0.5,color: 'success.main',mt:0.2}}/>
          <Box>
            <Typography variant="body2" align="center" sx={{ color: 'success.main', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer' }} noWrap>
              Verified
            </Typography>     
          </Box>
        </Stack>)}

        {user_type === 3 && (
          <>
          <Grid container sx={{textAlign: 'center',display:'flex',justifyContent:'center',ml:1.5,mt:1.7,mb:-5}}>
            <Stack direction={'row'} justifyContent={'center'}>
              <Button onClick={() => navigate(PATH_DASHBOARD.general.Departmentsubjects)} variant='outlined'>View Subject Listing</Button>
            </Stack>
          </Grid>
          </>
          )}

    </Card>
  );
}

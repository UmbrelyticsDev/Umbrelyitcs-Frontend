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
import { Box, Card, Grid, Avatar, Tooltip, Typography, IconButton, Stack, Link, Button, Popover, MenuItem, Menu, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
// utils
import Folder from '../../../../../../../images/pdf-png.png';
import SvgIconStyle from 'src/components/SvgIconStyle';
import { MIconButton } from 'src/components/@material-extend';
import Label from 'src/components/Label';
import { useTheme } from '@emotion/react';
import { useRef, useState } from 'react';
import { Check, Close, CloseRounded, ContactMail, Edit, Email, FlightTakeoff, Person, Phone } from '@material-ui/icons';
import { useLocation, useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import ScrollToTop from 'src/components/ScrollToTop';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

//


// ----------------------------------------------------------------------
const ThumbImgStyle = styled('img')(({ theme }) => ({
    width: 42,
    height: 42,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadiusSm
  }));

// ----------------------------------------------------------------------


SubjectCard.propTypes = {
  user: PropTypes.object.isRequired
};

export default function SubjectCard({ user,handleActivateSubject,setRefresh,refresh,handleDeleteProduct,handleEditSubject,schoolId,departmentId, ...other }) {
  const location = useLocation();
  const isDepartmentDetailsPage = location.pathname === "/dashboard/schools/department/department-subject-listing";
  console.log('kkkkkkkkkk',isDepartmentDetailsPage);
  const isSubjectLisiting = location.pathname === "/dashboard/schools/department/subject-listing";
  console.log('kkkkkkkkkk',isSubjectLisiting);
  // const { name, createdby, email,phone, inventoryType,} = user;     //old
  const { subjectName, createdBy, email,phone, status,id} = user;
  const theme = useTheme();
  const ref = useRef(null);
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setOpen] = useState(null);
  const { enqueueSnackbar } = useSnackbar();



const handleActivate=async(id,status)=>{
  // handleActivateSubject(id,status)
  // setOpen(null)
  // setRefresh(!refresh)
  // window.location.reload()
  setOpen(false)
  if(status===1){
    await axios.put(`${REST_API_END_POINT}activate-subject/${id}`,{status:0})
    .then(res =>{
      if(res.data.status===1){
        enqueueSnackbar('Status Deactivated Successfully', { variant: 'success' });
        setRefresh(!refresh)
        
      }else{
        enqueueSnackbar('Status Deactivated Failed', { variant: 'error' });
     
      }
    }).catch(err=>console.log(err))
   }else{
    await axios.put(`${REST_API_END_POINT}activate-subject/${id}`,{status:1})
    .then(res =>{
      if(res.data.status===1){
        enqueueSnackbar('Subject Activate Successfully', { variant: 'success' });
        setRefresh(!refresh)
      }else{
        enqueueSnackbar('Subject Activate Failed', { variant: 'error' });
     
      }
    }).catch(err=>console.log(err))
   }
}

const handleDelete =(id)=>{
  handleDeleteProduct(id)
  setOpen(null)
  setRefresh(!refresh)
  window.location.reload()
}

const editSubject=(id,status)=>{
  if(status ===0){
    enqueueSnackbar('Subject was Inactive', { variant: 'error' })
    return
  }
  handleEditSubject(id,status)
}

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    };
    
    const handleClose = () => {
      setOpen(null);
      };
      const [subMenu, SetSubMenu] = useState(null);

      const handleOpenSubMenu = (event) => {
        SetSubMenu(event.currentTarget);
      };
    
      const handleCloseSubMenu = () => {
        SetSubMenu(null);
      };
  return (
    <Card
      sx={{
        display: 'flex',
        position: 'relative',
        py:2,
        flexDirection: 'column',
        boxShadow:'0 0 2px 0 rgba(145, 158, 171, 0.24),0 16px 32px -4px rgba(145, 158, 171, 0.54)',transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
            <Box sx={{display:'flex',flexDirection:'column',pl:3,mt:user_type ===3 ? 6 : user_type ===4 ? 6: 0}}>
                <ThumbImgStyle alt={subjectName} src={Folder} sx={{ mb: 1, mt: user_type === 3 ? -5 : user_type === 4 ? -5 : '' }} />
                <Tooltip title={subjectName}>
                    <Typography variant="subtitle2" sx={{ mb: 0.2,fontSize:'16px',fontWeight:600,textAlign:'left',cursor:'pointer',maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                     {subjectName}
                    </Typography>
                </Tooltip>
                <Typography variant='caption' sx={{ color:'text.disabled',mb: 0.8,textAlign:'left',cursor:'pointer',maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>Created by : {createdBy}</Typography>
            </Box>
        
          <Stack sx={{display:'flex',justifyContent:'space-between',flexDirection:'row',pl:3,}}>
            <Box>
                {status === 1 ? (
                    <Box sx={{display:'flex',flexDirection:'row',}}>
                        <Stack className='lets-icons--check-fill' sx={{color:'#00A76F',fontSize:'19px',mr:0.5,mt:-0.2}} />
                        <Typography variant='caption' sx={{color:'#00A76F',}}>Active</Typography>
                    </Box>
                ) : (
                    <Box sx={{display:'flex',flexDirection:'row'}}>
                        <Stack className='carbon--close-filled' sx={{color:'#FF4842',fontSize:'17px',mr:0.5,mt:0}} />
                        <Typography variant='caption' sx={{color:'#FF4842',}}>Inactive</Typography>
                    </Box>
                )}
                </Box>
                {
                   isDepartmentDetailsPage?
                   ""
                   :
                   <>
             <Box sx={{ position: 'absolute', top: 8, right: 8,zIndex:999, }}>
             {user_type !== 3 && user_type !== 4 && (<MIconButton ref={ref} onClick={handleOpen}>
                 <Icon icon={moreVerticalFill} width={20} height={20} />
               </MIconButton>
              )}
             
               

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
                <MenuItem onClick={()=>editSubject(id,status)} sx={{ color: 'primary.main' }}>
                  <ListItemIcon>
                    <Icon icon={editFill} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
                <MenuItem onClick={()=>handleActivate(id,status)} sx={{ color:status===1? 'error.main':'success.dark' }}>
                  <ListItemIcon>
                    <Stack className='lets-icons--check-fill' sx={{fontSize:'1.5rem'}} />
                  </ListItemIcon>
                  {
                    status===1 ?

                    <ListItemText primary="Deactivate" primaryTypographyProps={{ variant: 'body2' }} />
                    :
                    <ListItemText primary="Activate" primaryTypographyProps={{ variant: 'body2' }} />
                  }
                </MenuItem>
                <MenuItem onClick={()=>handleDelete(id)} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <Icon icon={trash2Outline} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
              </Menu>
            
            </Box>
            </>
                 }
        </Stack>
        <Divider sx={{borderStyle:'dashed',borderColor:'#cccccc',mt:2,mb:2}} />
        {/* {user_type !== 3 && user_type !== 4 && !isSubjectLisiting &&(<Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button onClick={handleOpenSubMenu} fullWidth variant='contained'>Sub Menu</Button>
        </Box>)} */}
        {!isSubjectLisiting &&(<Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button onClick={() => navigate(PATH_DASHBOARD.general.gradeListing,{ state: { subjectId: id ,subjectName: subjectName, schoolId:schoolId ,departmentId:departmentId}})} fullWidth variant='contained'>View Grades</Button>
        </Box>)}
        {isSubjectLisiting && (<Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button onClick={() => navigate(PATH_DASHBOARD.general.department, { state: { schoolId }})} fullWidth variant='contained'>View Departments</Button>
        </Box>)}
        <Popover 
        open={!!subMenu}
        anchorEl={subMenu}
        anchorOrigin={{ vertical: 1470, horizontal: 260 }}
        transformOrigin={{ vertical: 1275, horizontal: 230 }}
        PaperProps={{
          sx: { width: 190 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1, pt: 1,}}>
          <Typography variant='subtitle1' sx={{fontWeight:'bold',ml:2,}}>
             Sub Menus
          </Typography>
          <MIconButton size="small" onClick={handleCloseSubMenu}>
            <CloseRounded  sx={{color:'#0f171e'}} />
          </MIconButton>
        </Box>
        <Box sx={{mb:1,mt:-0.5}}>
            {/* <MenuItem sx={{mt:-0.5}} onClick={() => navigate(PATH_DASHBOARD.general.subjects)}>
              <Stack className='ic--twotone-menu-book' sx={{ mr: 1,mt:-0.3,ml:0.2,fontSize:'1.3rem' }} />
              Add Subjects
            </MenuItem> */}
            <MenuItem onClick={() => navigate(PATH_DASHBOARD.general.teacherListingSubmenu)} sx={{mt:-0.5}}>
              <Person sx={{ mr: 1,mt:-0.3 }} />
              Add Teachers
            </MenuItem>
        </Box>
      </Popover>
    </Card>
  );
}

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
import Folder from '../../../../../../../images/grade-icon.png';
import SvgIconStyle from 'src/components/SvgIconStyle';
import { MIconButton } from 'src/components/@material-extend';
import Label from 'src/components/Label';
import { useTheme } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { Check, Close, CloseRounded, ContactMail, Edit, Email, FlightTakeoff, Person, Phone } from '@material-ui/icons';
import { useLocation, useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import ScrollToTop from 'src/components/ScrollToTop';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import GradeListingMenu from '../grade-listing-menu';
import { useSnackbar } from 'notistack';

//


// ----------------------------------------------------------------------
const ThumbImgStyle = styled('img')(({ theme }) => ({
    width: 42,
    height: 42,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadiusSm
  }));

  const Teachers = [
    { id: 1, teachers: 'Michel Cambell', },
    { id: 2, teachers: 'Andre Thompson', },
    { id: 3, teachers: 'Aisha James',  },
  ];

// ----------------------------------------------------------------------


ClassCard.propTypes = {
  user: PropTypes.object.isRequired
};

export default function ClassCard({ user,departmentId, gradeId, schoolId, gradeName, subjectName, subjectId, refresh, setRefresh, handleActivate, handleDelete, handleEditPageOpen, ...other }) {
  const location = useLocation();
  const { id, name, cover, createdBy, createdOn, email, phone, inventoryType, status, teacherId } = user;
  const theme = useTheme();
  const ref = useRef(null);
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setOpen] = useState(null);
  const [teachers,setTeachers] = useState([])
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTeacher, setSelectedTeacher] = useState([]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
    };
    
  const handleClose = () => {
    setOpen(null);
  };
  const [subMenu, SetSubMenu] = useState(null);

  const fetchTeacherByDeptId = async ()=>{
    await axios.get(`${REST_API_END_POINT}get-teacher/${departmentId}`)
    .then(res =>{
    if(res.data.status) {
      setTeachers(res.data.result);
    }else{
 
      setTeachers([]);
    }
    }).catch(err =>console.log(err))
  }

  useEffect(()=>{
    if(departmentId){
      fetchTeacherByDeptId()
    }
  },[gradeId,departmentId])

  const handleOpenSubMenu = (event, teacherId) => {
    // Split the teacherId string into an array of individual IDs
    const teacherIdsArray = teacherId?.split(',').map(id => parseInt(id.trim()));
  
    // Find teacher details based on the array of teacherIds
    const selectedTeachers = teachers?.filter(teacher => teacherIdsArray.includes(teacher.id));
    if (selectedTeachers.length > 0) {
      setSelectedTeacher(selectedTeachers);
    } else {
      setSelectedTeacher([]);
    }
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
                <ThumbImgStyle alt={name} src={Folder} sx={{ mb: 1, mt: user_type === 3 ? -5 : user_type === 4 ? -5 : '' }} />
                <Tooltip title={name}>
                    {user_type !== 4 ?(<Link variant="subtitle2" onClick={() => navigate(PATH_DASHBOARD.general.gradedetails,{state:{departmentId:departmentId, gradeId:gradeId, schoolId:schoolId,classId:id,className:name, gradeName:gradeName, subjectName:subjectName, subjectId:subjectId}})} sx={{ mb: 0.2,fontSize:'16px',fontWeight:600,textAlign:'left',cursor:'pointer',maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                     {name}
                    </Link>) : <Typography variant="subtitle2" sx={{ mb: 0.2,fontSize:'16px',fontWeight:600,textAlign:'left',cursor:'pointer',maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                     {name}
                    </Typography>}
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
             <Box sx={{ position: 'absolute', top: 8, right: 8,zIndex:999, }}>
             {/* {user_type !== 3 && user_type !== 4 && (<MIconButton ref={ref} onClick={handleOpen}>
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
                <MenuItem onClick={handleClose} sx={{ color: 'primary.main' }}>
                  <ListItemIcon>
                    <Icon icon={editFill} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
                <MenuItem sx={{ color:'success.dark' }}>
                  <ListItemIcon>
                    <Stack className='lets-icons--check-fill' sx={{fontSize:'1.5rem'}} />
                  </ListItemIcon>
                  <ListItemText primary="Activate" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
                <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <Icon icon={trash2Outline} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
                </MenuItem>
              </Menu> */}

              {user_type !==3 && user_type !==4 &&(
                <GradeListingMenu productName={name} status={status} onActive={()=>handleActivate(id,status)} handleDelete={()=>handleDelete(id)} handleEditPageOpen={()=>handleEditPageOpen(id,status)}/>
              )}
            </Box>
        </Stack>
        <Divider sx={{borderStyle:'dashed',borderColor:'#cccccc',mt:2,mb:2}} />
        {user_type !==4 ?(<Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button fullWidth ref={ref} onClick={(event)=>handleOpenSubMenu(event,teacherId)} variant='contained'>Teachers</Button>
        </Box>) : <Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button ref={ref} fullWidth onClick={()=>navigate(PATH_DASHBOARD.general.gradedetails)} variant='contained'>View Tests</Button>
        </Box>}
        <Popover
        open={!!subMenu}
        anchorEl={ref.current}
        // anchorEl={subMenu}
        onClose={() => SetSubMenu(null)}
        anchorOrigin={{ vertical: 270, horizontal: 260 }}
        transformOrigin={{ vertical: 215, horizontal: 230 }}
        PaperProps={{
          sx: { width: 190 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1, pt: 1,}}>
          <Typography variant='subtitle1' sx={{fontWeight:'bold',ml:2,}}>
             Teachers
          </Typography>
          <MIconButton size="small" onClick={handleCloseSubMenu}>
            <CloseRounded  sx={{color:'#0f171e'}} />
          </MIconButton>
        </Box>
        <Box sx={{mb:1,mt:0.5}}>
          {selectedTeacher?.map((names,index) => (<MenuItem key={index} sx={{mt:-0.5}}>
            <Person sx={{ mr: 1,mt:-0.3,fontSize:'1.3rem' }} />
            {names?.name}
          </MenuItem>))}
        </Box>
      </Popover>
    </Card>
  );
}

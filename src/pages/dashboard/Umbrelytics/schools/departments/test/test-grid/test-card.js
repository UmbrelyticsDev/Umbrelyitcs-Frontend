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
import Folder from '../../../../../../../images/xlsx-png.png';
import SvgIconStyle from 'src/components/SvgIconStyle';
import { MIconButton } from 'src/components/@material-extend';
import Label from 'src/components/Label';
import { useTheme } from '@emotion/react';
import { useRef, useState } from 'react';
import { Check, Close, CloseRounded, ContactMail, Edit, Email, FlightTakeoff, Person, Phone } from '@material-ui/icons';
import { useLocation, useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import ScrollToTop from 'src/components/ScrollToTop';
import TestListingMenu from '../test-listing-menu';
import { useSnackbar } from 'notistack';

//


// ----------------------------------------------------------------------
const ThumbImgStyle = styled('img')(({ theme }) => ({
    width: 42,
    height: 42,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadiusSm
  }));

// ----------------------------------------------------------------------


TestCard.propTypes = {
  user: PropTypes.object.isRequired
};

export default function TestCard({ user, stateData, handleActivate, handleDelete, handleEditPageOpen, ...other }) {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const { id, name, marksheetStatus, typeOfTest, assignedTo, status,subject,subjectName,teacherName } = user;
  const theme = useTheme();
  const ref = useRef(null);
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setOpen] = useState(null);
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
                <Tooltip title={teacherName}>
                <Typography variant='caption' sx={{ color:'text.disabled',mb: 0.8,textAlign:'left',cursor:'pointer',maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>Teacher: {teacherName}</Typography>
                </Tooltip>
               
                {/* <Typography variant='caption' sx={{ color:'text.disabled',mb: 0.8,textAlign:'left',cursor:'pointer',maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>Assigned To : {assignedTo}</Typography> */}
                <Typography variant='caption' sx={{ color:'text.disabled',mb: 0.8,textAlign:'left',cursor:'pointer',maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>Type Of Test : {typeOfTest}</Typography>
            </Box>
        
          <Stack sx={{display:'flex',justifyContent:'space-between',flexDirection:'row',pl:3,}}>
            <Box>
                {marksheetStatus === 1 ? (
                    <Box sx={{display:'flex',flexDirection:'row',}}>
                        <Stack className='lets-icons--check-fill' sx={{color:'#00A76F',fontSize:'19px',mr:0.5,mt:-0.2}} />
                        <Typography variant='caption' sx={{color:'#00A76F',}}>Marksheet Uploaded</Typography>
                    </Box>
                ) : (
                    <Box sx={{display:'flex',flexDirection:'row'}}>
                        <Stack className='carbon--close-filled' sx={{color:'#FF4842',fontSize:'17px',mr:0.5,mt:0}} />
                        <Typography variant='caption' sx={{color:'#FF4842',}}>Marksheet Not Uploaded</Typography>
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
              {user_type !== 3 && user_type !== 4 && (
                <TestListingMenu productName={subjectName} onActive={()=>handleActivate(id,status)} status={status} handleDelete={()=>handleDelete(id)} handleEditPageOpen={()=>handleEditPageOpen(id,status)}/>
              )}
            </Box>
        </Stack>
        <Stack sx={{display:'flex',justifyContent:'space-between',flexDirection:'row',pl:3,pt:0.5}}>
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
        </Stack>
        <Divider sx={{borderStyle:'dashed',borderColor:'#cccccc',mt:2,mb:2}} />
        {user_type === 1 ? (
          <Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button fullWidth onClick={() => {
              if(status===0) return enqueueSnackbar('Test is Inactive', { variant: 'error' });
              marksheetStatus !== 1 ? 
              navigate(PATH_DASHBOARD.general.addMarksheet, { state: { testId :id, testName:subjectName, typeOfTest:typeOfTest, departmentId : stateData?.departmentId, classId : stateData?.classId, className : stateData?.className, gradeId : stateData?.gradeId, schoolId : stateData?.schoolId, gradeName : stateData?.gradeName, subjectName : stateData?.subjectName, subjectId : stateData?.subjectId } }) 
              : navigate(PATH_DASHBOARD.general.schoolAdminMarksheetView, { state: { testId :id, testName:subjectName, typeOfTest:typeOfTest, departmentId : stateData?.departmentId, classId : stateData?.classId, className : stateData?.className, gradeId : stateData?.gradeId, schoolId : stateData?.schoolId, gradeName : stateData?.gradeName, subjectName : stateData?.subjectName, subjectId : stateData?.subjectId } })}} variant='contained'>{marksheetStatus !== 1 ? 'Add Marksheet' : 'View Marksheet'}</Button>
          </Box> ) :  
          <Box sx={{display:'flex',justifyContent:'center',pl:3,pr:3}}>
            <Button disabled={ marksheetStatus===0 } fullWidth onClick={() => {
              if(status===0) return enqueueSnackbar('Test is Inactive', { variant: 'error' });
              marksheetStatus === 1 ? 
                navigate(PATH_DASHBOARD.general.schoolAdminMarksheetView, { state: { testId :id, testName:subjectName, typeOfTest:typeOfTest, departmentId : stateData?.departmentId, classId : stateData?.classId, className : stateData?.className, gradeId : stateData?.gradeId, schoolId : stateData?.schoolId, gradeName : stateData?.gradeName, subjectName : stateData?.subjectName, subjectId : stateData?.subjectId } })
              : enqueueSnackbar('Marksheet not yet uploaded', { variant: 'error' }) 
            }} variant='contained'>View Marksheet</Button>
          </Box>
        }
    </Card>
  );
}

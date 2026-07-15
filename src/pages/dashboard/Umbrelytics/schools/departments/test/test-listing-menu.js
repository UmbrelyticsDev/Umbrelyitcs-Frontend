import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { paramCase } from 'change-case';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import { Link as RouterLink } from 'react-router-dom';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText, Stack } from '@material-ui/core';
import { PATH_DASHBOARD } from 'src/routes/paths';
// routes


// ----------------------------------------------------------------------

export default function TestListingMenu({ onDelete, userName,onActive,status,handleDelete ,handleEditPageOpen}) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleActivate=()=>{
    onActive()
    setIsOpen(false)
  }

  const handleDeleteFun=()=>{
    handleDelete()
    setIsOpen(false)

  }
  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
        //   component={RouterLink}
        //   to={`${PATH_DASHBOARD.user.root}/${paramCase(userName)}/edit`}
          sx={{ color:'primary.main' }}
          onClick={()=>{
            handleEditPageOpen()
            setIsOpen(false)
          }}
        >
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem onClick={handleActivate} sx={{ color:status===1? 'error.main' : 'success.dark' }}>
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

        <MenuItem onClick={handleDeleteFun} sx={{ color: 'text.secondary',color:'error.main' }}>
          <ListItemIcon>
            <Icon icon={trash2Outline} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

      </Menu>
    </>
  );
}

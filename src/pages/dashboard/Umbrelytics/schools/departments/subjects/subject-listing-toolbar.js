import PropTypes from 'prop-types';
import { useState } from 'react'; 
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import roundFilterList from '@iconify/icons-ic/round-filter-list';
// material
import { useTheme, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Button, CircularProgress } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';

// ----------------------------------------------------------------------

const user_type = JSON.parse(localStorage.getItem('user_type'));
console.log('user_type', user_type);

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  height: 40,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));

// ----------------------------------------------------------------------

SubjectListingToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func
};

export default function SubjectListingToolbar({ numSelected, filterName, onFilterName,isDepartmentDetailsPage,handleClickOpen }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [loading, setLoading] = useState(false); 

  const handleGoBack = () => {
    window.history.back();
  };

  const handleInputChange = (event) => {
    setLoading(true); 
    onFilterName(event); 

    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: isLight ? 'primary.main' : 'text.primary',
          bgcolor: isLight ? 'primary.lighter' : 'primary.dark'
        })
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <SearchStyle
          value={filterName}
          onChange={handleInputChange} // Use custom change handler
          placeholder="Search Subject..."
          startAdornment={
            <InputAdornment position="start">
              <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              {loading && <Box className='spinner'/>}
              {/* {loading && <CircularProgress size={14} sx={{ ml: 1, color: 'text.secondary' }} />} */}
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton sx={{ color: 'error.dark' }}>
            <Icon icon={trash2Fill}  onClick={handleClickOpen}/>
          </IconButton>
        </Tooltip>
      ) : (
        <>
          {/* {user_type !== 3 && user_type !==4 && !isDepartmentDetailsPage && (<Tooltip title="Go Back">
            <Button sx={{ ml: 2, whiteSpace: 'nowrap' }} startIcon={<ArrowBack />} onClick={handleGoBack} type="button" variant="outlined" color="inherit">
              Go Back
            </Button>
          </Tooltip>)} */}
        </>
      )}
    </RootStyle>
  );
}
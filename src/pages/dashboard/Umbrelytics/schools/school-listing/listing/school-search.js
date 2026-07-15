import PropTypes from 'prop-types';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link as RouterLink } from 'react-router-dom';
import searchFill from '@iconify/icons-eva/search-fill';
// material
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, TextField, Typography, InputAdornment, CircularProgress, List, ListItem } from '@material-ui/core';
import { PATH_DASHBOARD } from '../../../../../../routes/paths'; // Import PATH_DASHBOARD

const RootStyle = styled('div')(({ theme }) => ({
  '& .MuiTextField-root': {
    width: 200,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter,
    }),
    '&.Mui-focused': {
      width: 240,
      boxShadow: theme.customShadows.z12,
    },
    '& fieldset': {
      borderWidth: `1px !important`,
      borderColor: `${theme.palette.grey[500_32]} !important`,
    },
  },
  '& .resultList': {
    marginTop: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    maxHeight: 300,
    overflowY: 'auto',
    boxShadow: theme.shadows[3],
  },
}));

SchoolSearch.propTypes = {
  sx: PropTypes.object,
  staticData: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default function SchoolSearch({ sx, staticData, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleChangeSearch = async (event) => {
    const { value } = event.target;
    setSearchQuery(value);
    setLoading(true);
  
    // Simulate async search operation
    setTimeout(() => {
      const filteredData = staticData.filter(
        (item) =>
          item?.name?.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filteredData);
      setLoading(false);
      onSearch(value); // Trigger the provided search callback
    }, 500);
  };
  

  return (
    <RootStyle sx={sx}>
      <TextField
        value={searchQuery}
        onChange={handleChangeSearch}
        placeholder="Search Schools..."
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component={Icon}
                icon={searchFill}
                sx={{ width: 20, height: 20, color: 'text.disabled' }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {loading && <Box sx={{pr:0.5}}><Box className='spinner'/></Box>}
            </>
          ),
        }}
      />
      {results.length > 0 && (
        <List className="resultList">
          {results.map((post) => (
            <ListItem key={post.id}>
              <RouterLink
                to={PATH_DASHBOARD.general.department}
                style={{ textDecoration: 'none' }}
              >
                <Typography variant="subtitle2" color="textPrimary">
                  {post.name}
                </Typography>
              </RouterLink>
            </ListItem>
          ))}
        </List>
      )}
    </RootStyle>
  );
}

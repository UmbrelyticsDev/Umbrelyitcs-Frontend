import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, InputAdornment, OutlinedInput, Stack, CircularProgress } from '@material-ui/core';

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  height: 40,
  marginBottom: theme.spacing(5),
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': {
    width: 240,
    height: 40,
    boxShadow: theme.customShadows.z8
  },
  '& fieldset': {
    borderWidth: '1px !important',
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));

TeacherSubjectSearch.propTypes = {
  sx: PropTypes.object,
  staticData: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired
};

export default function TeacherSubjectSearch({ sx, staticData, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    // Cleanup function for timer
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const handleChangeSearch = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
    setIsLoading(true); // Show loader when typing starts

    if (timerId) {
      clearTimeout(timerId); // Clear previous timer
    }

    // Set timer to execute search after 500ms delay
    setTimerId(
      setTimeout(() => {
        if (value.trim() !== '') {
          onSearch(value); // Trigger search function
        } else {
          onSearch(''); // Handle case for empty search (if needed)
        }
        setIsLoading(false); // Hide loader after search execution
      }, 500)
    );
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsLoading(false); // Stop loading when search query is cleared
    if (timerId) {
      clearTimeout(timerId); // Clear any pending timer when clearing search
    }
    onSearch(''); // Assuming you want to clear search results on clear button click
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <Stack>
      <SearchStyle
        placeholder="Search Subjects..."
        value={searchQuery}
        onChange={handleChangeSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        startAdornment={
          <InputAdornment position="start">
            <Box
              component={Icon}
              icon={searchFill}
              sx={{
                ml: 1,
                width: 20,
                height: 20,
                color: 'text.disabled'
              }}
            />
          </InputAdornment>
        }
        endAdornment={
          isFocused && searchQuery ? (
            isLoading && (
              <InputAdornment position="end">
                <Box className='spinner'/>
              </InputAdornment>
            )
          ) : null
        }
      />
    </Stack>
  );
};
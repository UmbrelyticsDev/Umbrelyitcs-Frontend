import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import copyFill from '@iconify/icons-eva/copy-fill';
import { CopyToClipboard } from 'react-copy-to-clipboard';
// material
import { Tooltip, TextField, IconButton, InputAdornment } from '@material-ui/core';
import { useState } from 'react';
import Icon from '@iconify/react';

CopyClipboard.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

export default function CopyClipboard({ placeholder, value, onChange, ...other }) {
  const { enqueueSnackbar } = useSnackbar();
  const [copied, setCopied] = useState(false);

  const handleChange = (event) => {
    onChange(event);
    setCopied(false);
  };

  const onCopy = () => {
    if (value.trim() === '') {
      enqueueSnackbar('Cannot copy empty field', { variant: 'error' });
    } else {
      setCopied(true);
      enqueueSnackbar(`${placeholder} copied to clipboard`, { variant: 'success' });
    }
  };

  return (
    <TextField
      fullWidth
      value={value}
      onChange={handleChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <CopyToClipboard text={value} onCopy={onCopy}>
              <Tooltip title="Copy">
                <IconButton>
                  <Icon icon={copyFill} width={24} height={24} />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          </InputAdornment>
        )
      }}
      {...other}
    />
  );
}

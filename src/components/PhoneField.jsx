import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'
import { Box, Typography } from '@material-ui/core'

// Reusable phone input with a searchable country / dial-code dropdown,
// defaulting to Jamaica. Requires: npm install react-phone-input-2
//
// The value held in form state is the digits INCLUDING the country code and
// WITHOUT a leading '+', e.g. "1876XXXXXXX". Callers prepend '+' when sending
// to the backend (so it is stored as "+1876XXXXXXX"). Keeping the form value as
// plain digits keeps comparisons stable (e.g. the Update Profile dirty-check).
export default function PhoneField({
  value,
  onChange,
  label = 'Phone number',
  error = false,
  helperText,
  disabled = false,
}) {
  return (
    <Box sx={{ width: '100%' }}>
      <PhoneInput
        country={'jm'}
        value={value || ''}
        onChange={(val) => onChange(val)}
        enableSearch
        disabled={disabled}
        specialLabel={label}
        countryCodeEditable={false}
        // Jamaica isn't given a NANP mask by default, so format it like the
        // other +1 countries: area code then 3-then-4 → (876) 678-5432.
        masks={{ jm: '... ....' }}
        inputStyle={{
          width: '100%',
          height: 56,
          ...(error && { borderColor: '#d32f2f' }),
        }}
        buttonStyle={error ? { borderColor: '#d32f2f' } : undefined}
      />
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            ml: 1.75,
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

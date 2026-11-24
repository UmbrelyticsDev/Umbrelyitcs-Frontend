import {
  Box,
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@material-ui/core'

// Shared qualifications/degree multi-select. Standard click-to-open dropdown:
// the menu renders in a portal, so it is never clipped by the card it sits in
// (the old hover overlay was clipped by the card's overflow). Used on the
// onboarding form and the add-teacher / salary form so they stay identical.
//
// `value` is an array of selected labels; `onChange(nextArray)` fires on every
// toggle. The default option list is the full degree ladder.
export const DEFAULT_QUALIFICATION_OPTIONS = [
  'Certificate',
  'Diploma',
  'Associate Degree',
  "Bachelor's Degree",
  'Postgraduate Diploma',
  'Masters Degree',
  'Doctoral Degree',
]

export default function QualificationsHoverSelect({
  value,
  onChange,
  options = DEFAULT_QUALIFICATION_OPTIONS,
  label = 'Qualifications',
  placeholder = 'Select your degrees',
  helperText = 'Tick all that apply',
}) {
  const selected = Array.isArray(value) ? value : []

  return (
    <Box>
      <TextField
        select
        fullWidth
        label={label}
        value={selected}
        onChange={(e) => {
          const v = e.target.value
          onChange(typeof v === 'string' ? v.split(',') : v)
        }}
        InputLabelProps={{ shrink: true }}
        helperText={helperText}
        SelectProps={{
          multiple: true,
          displayEmpty: true,
          renderValue: (sel) =>
            sel && sel.length ? (
              sel.join(', ')
            ) : (
              <span style={{ color: 'rgba(0,0,0,0.4)' }}>{placeholder}</span>
            ),
          // Anchor the menu below the field and render it full-height in a
          // portal so it is never clipped by the surrounding card.
          MenuProps: {
            getContentAnchorEl: null,
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
            PaperProps: { style: { maxHeight: 320 } },
          },
        }}
      >
        {options.map((q) => (
          <MenuItem key={q} value={q}>
            <Checkbox color="primary" checked={selected.indexOf(q) > -1} />
            <ListItemText primary={q} />
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

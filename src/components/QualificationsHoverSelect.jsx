import { useState } from 'react'
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TextField,
  Typography,
} from '@material-ui/core'

// Shared hover-reveal multi-select for qualifications/degrees.
// Used on both the onboarding form and the teacher profile-update form so the
// two stay identical. The field shows the current selection; hovering it drops
// a tickable bullet list that hides the instant the pointer leaves the field +
// list area (both live inside the same wrapper, so moving from the field onto
// the list keeps it open). It also opens on keyboard focus and closes on blur,
// so it is still usable without a mouse.
//
// `value` is an array of selected labels; `onChange(nextArray)` is called on
// every toggle. The default option list matches the four degrees collected at
// onboarding.
export const DEFAULT_QUALIFICATION_OPTIONS = [
  'Diploma',
  "Bachelor's Degree",
  'Masters Degree',
  'Doctoral Degree',
]

export default function QualificationsHoverSelect({
  value,
  onChange,
  options = DEFAULT_QUALIFICATION_OPTIONS,
  label = 'Qualifications',
  placeholder = 'Hover to select your degrees',
  helperText = 'Hover the field and tick all that apply',
}) {
  const [open, setOpen] = useState(false)
  const selected = Array.isArray(value) ? value : []

  const toggle = (q) =>
    onChange(
      selected.includes(q)
        ? selected.filter((x) => x !== q)
        : [...selected, q],
    )

  return (
    <Box
      sx={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        // Close only when focus leaves the whole widget (keyboard users).
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      {/* Inner wrapper is only as tall as the input, so the list anchors
          directly under it (top: 100%) regardless of the field's height. */}
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          label={label}
          placeholder={placeholder}
          value={selected.length ? selected.join(', ') : ''}
          onFocus={() => setOpen(true)}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        {open && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 30,
            }}
          >
            <List dense disablePadding>
              {options.map((q) => (
                <ListItem button key={q} onClick={() => toggle(q)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      color="primary"
                      checked={selected.includes(q)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={q} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
      {helperText ? (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mt: 0.5, ml: 1.75 }}
        >
          {helperText}
        </Typography>
      ) : null}
    </Box>
  )
}

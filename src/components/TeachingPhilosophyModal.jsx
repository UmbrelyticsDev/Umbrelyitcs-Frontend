import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Input,
  Typography,
} from '@material-ui/core'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// Website-side Teaching Style editor — kept in parity with the tool's modal.
// Two ways to set the core values the AI uses:
//   1) Pick them directly from the stored list (these take precedence), or
//   2) Write a teaching style/philosophy and let the AI infer them.
// Picks are saved on the website teacher record and synced to the tool, where
// lesson generation applies them (explicit picks override the inferred match).
export default function TeachingPhilosophyModal({ open, onClose, teacherId }) {
  const { enqueueSnackbar } = useSnackbar()
  const [philosophy, setPhilosophy] = useState('')
  // Explicit core-value picks (array of core_value names).
  const [selected, setSelected] = useState([])
  // The full catalogue of selectable core values ({ id, core_value, description }).
  const [coreValues, setCoreValues] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Fetch existing teacher data + the selectable list when the modal opens.
  useEffect(() => {
    if (open && teacherId) {
      fetchTeacherData()
      fetchCoreValues()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teacherId])

  const fetchTeacherData = async () => {
    try {
      setFetching(true)
      const response = await axios.get(
        `${REST_API_END_POINT}get-teacher-details-for-editing/${teacherId}`,
      )

      if (response.data.status === 1) {
        const result = response.data.result || {}
        setPhilosophy(result.teaching_philosophy || '')
        setSelected(
          Array.isArray(result.selected_core_values)
            ? result.selected_core_values
            : [],
        )
      }
    } catch (error) {
      console.error('Error fetching philosophy:', error)
      enqueueSnackbar('Error loading teaching style', { variant: 'error' })
    } finally {
      setFetching(false)
    }
  }

  // Load the selectable list independently — a failure here must not block the
  // rest of the form (the picker just shows an empty state).
  const fetchCoreValues = async () => {
    try {
      const response = await axios.get(`${REST_API_END_POINT}teacher-core-values`)
      setCoreValues(
        Array.isArray(response.data?.data) ? response.data.data : [],
      )
    } catch (error) {
      console.error('Error loading core values list:', error)
      setCoreValues([])
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${REST_API_END_POINT}update-teacher/${teacherId}`,
        {
          values: {
            hodId: teacherId,
            teaching_philosophy: philosophy,
            selected_core_values: selected,
          },
        },
      )

      if (response.data.status === 1) {
        enqueueSnackbar('Teaching Style updated successfully', {
          variant: 'success',
        })
        onClose()
        window.location.reload()
      } else {
        enqueueSnackbar('Failed to update teaching style', { variant: 'error' })
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Error updating teaching style', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveChip = (name) => {
    setSelected((prev) => prev.filter((v) => v !== name))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Teaching Style</DialogTitle>
      <DialogContent>
        {fetching ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CircularProgress />
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {/* Core-value picker — compact multi-select + chips */}
            <Typography variant="subtitle2" style={{ marginBottom: 4 }}>
              Your Core Values
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              style={{ display: 'block', marginBottom: 8 }}
            >
              Pick yours directly (these take priority), or leave empty to have
              them inferred from your teaching style below.
            </Typography>

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="core-values-label">Select core values</InputLabel>
              <Select
                labelId="core-values-label"
                multiple
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                input={<Input />}
                renderValue={(vals) =>
                  vals.length ? `${vals.length} selected` : ''
                }
                MenuProps={{
                  PaperProps: { style: { maxHeight: 320 } },
                  getContentAnchorEl: null,
                  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                }}
              >
                {coreValues.length === 0 ? (
                  <MenuItem disabled>
                    <ListItemText primary="No core values available to choose from." />
                  </MenuItem>
                ) : (
                  coreValues.map((cv) => {
                    const name = cv.core_value
                    return (
                      <MenuItem key={cv.id ?? name} value={name}>
                        <Checkbox
                          color="primary"
                          checked={selected.indexOf(name) > -1}
                        />
                        <ListItemText
                          primary={name}
                          secondary={cv.description || undefined}
                        />
                      </MenuItem>
                    )
                  })
                )}
              </Select>
            </FormControl>

            {/* Selected chips (removable) */}
            {selected.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {selected.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onDelete={() => handleRemoveChip(name)}
                  />
                ))}
              </div>
            )}

            {/* Teaching style / philosophy */}
            <TextField
              style={{ marginTop: 20 }}
              fullWidth
              label="Teaching Style"
              placeholder="Tell us how you prefer to teach and engage your students. This helps us create lesson plans that reflect your teaching style, preferences, and approach to learning. e.g., I prefer student-led discussions, collaborative activities, practical examples, and minimal lecturing."
              multiline
              rows={5}
              value={philosophy}
              inputProps={{ maxLength: 5000 }}
              helperText={`Used to infer your core values when you haven't picked any above. ${philosophy.length}/5000`}
              onChange={(e) => setPhilosophy(e.target.value)}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || fetching}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

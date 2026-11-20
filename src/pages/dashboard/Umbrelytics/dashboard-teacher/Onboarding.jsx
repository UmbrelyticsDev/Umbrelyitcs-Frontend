import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { LoadingButton } from '@material-ui/lab'
import Page from '../../../../components/Page'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// First-login teaching profile. Gated by OnboardingGuard; on save it flips the
// teacher's onboarded flag and lands them on their dashboard.

const user = JSON.parse(localStorage.getItem('user') || '{}')
const user_type = JSON.parse(localStorage.getItem('user_type'))

const QUALIFICATION_OPTIONS = [
  'Diploma',
  "Bachelor's Degree",
  'Masters Degree',
  'Doctoral Degree',
]

// Hover-reveal qualifications picker. The field shows the current selection;
// hovering it drops a tickable list of degrees that hides the instant the
// pointer leaves the field + list area (both live inside the same wrapper, so
// moving from the field onto the list keeps it open). It also opens on keyboard
// focus and closes on blur, so it's still usable without a mouse.
function QualificationsHoverSelect({ value, onChange }) {
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
          label="Qualifications"
          placeholder="Hover to select your degrees"
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
              {QUALIFICATION_OPTIONS.map((q) => (
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
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mt: 0.5, ml: 1.75 }}
      >
        Hover the field and tick all that apply
      </Typography>
    </Box>
  )
}

export default function Onboarding() {
  const [form, setForm] = useState({
    institution: '',
    country: '',
    location: '',
    subjects: [],
    gradeLevels: [],
    sessionPeriod: '',
    //teachingPhilosophy: '',
    classification: '',
    qualifications: [],
    posr: 'NONE',
  })
  const [classifications, setClassifications] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isTeacher = user_type === 4 || user_type === 5

  // Load the classification dropdown (same source as the Update Profile form).
  useEffect(() => {
    if (!isTeacher) return
    axios
      .get(`${REST_API_END_POINT}salary/classifications`)
      .then((res) => {
        if (res.data.status === 1) setClassifications(res.data.result || [])
      })
      .catch((e) => console.log('classifications load failed', e))
  }, [isTeacher])

  // Already onboarded (or not a teacher) — nothing to collect here.
  if (!isTeacher || Number(user?.onboarded) !== 0) {
    return <Navigate to="/dashboard/teacher-dashboard" replace />
  }

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.institution.trim()) return setError('Institution is required.')
    if (!form.country.trim()) return setError('Country is required.')
    if (!form.location.trim()) return setError('Location is required.')
    if (!form.subjects.length) return setError('Add at least one subject.')
    if (!form.gradeLevels.length)
      return setError('Add at least one grade level.')
    if (!form.classification) return setError('Select your classification.')

    try {
      setSaving(true)
      const res = await axios.post(
        `${REST_API_END_POINT}teacher/teaching-profile/${user.teacherId}`,
        { ...form, markOnboarded: true },
      )
      if (res.data.status === 1) {
        // Save employment basics (classification / qualification / POSR) to the
        // salary profile — same endpoint the Update Profile form uses. Kept
        // non-blocking so a hiccup here never traps the teacher on this screen;
        // the rest can be completed later from Update Profile.
        try {
          await axios.post(
            `${REST_API_END_POINT}salary/profile/${user.teacherId}`,
            {
              classification: form.classification,
              qualifications: form.qualifications,
              posr: form.posr,
            },
          )
        } catch (e) {
          console.error('salary profile save failed (non-blocking)', e)
        }

        // Reflect completion locally so the gate lets us through.
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        u.onboarded = 1
        localStorage.setItem('user', JSON.stringify(u))
        window.location.href = '/dashboard/teacher-dashboard'
      } else {
        setError(res.data.message || 'Could not save your profile.')
      }
    } catch (e) {
      console.error('onboarding save failed', e)
      setError('Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page title="Complete your profile | Umbrelytics">
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Welcome! Let&apos;s finish your profile
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Tell us a little about your teaching. You can change any of this later
          from your profile.
        </Typography>
        <Card>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Institution / School"
                  value={form.institution}
                  onChange={set('institution')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={form.country}
                  onChange={set('country')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location (city / parish)"
                  value={form.location}
                  onChange={set('location')}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={form.subjects}
                  onChange={(e, v) => setForm((f) => ({ ...f, subjects: v }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Subjects (Press Enter after each subject)"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={form.gradeLevels}
                  onChange={(e, v) =>
                    setForm((f) => ({ ...f, gradeLevels: v }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Grade levels (Press Enter after each grade level)"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Timetable Period (Mins)"
                  value={form.sessionPeriod}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sessionPeriod: e.target.value }))
                  }
                  inputProps={{ min: 10, max: 240 }}
                  helperText="One scheduled teaching block. Used as the default length for all your classes."
                />
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'text.secondary', mt: 0.5 }}
                >
                  Employment information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Classification"
                  value={form.classification}
                  onChange={set('classification')}
                >
                  {classifications.map((c) => (
                    <MenuItem
                      key={c.classification_name}
                      value={c.classification_name}
                    >
                      {c.classification_name} (Band {c.band})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <QualificationsHoverSelect
                  value={form.qualifications}
                  onChange={(next) =>
                    setForm((f) => ({ ...f, qualifications: next }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Post of Special Responsibility"
                  value={form.posr}
                  onChange={set('posr')}
                >
                  {['NONE', 'POSR I', 'POSR II', 'POSR III'].map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/*<Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Teaching philosophy (optional)"
                  value={form.teachingPhilosophy}
                  onChange={set('teachingPhilosophy')}
                />
              </Grid>*/}
            </Grid>
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                variant="contained"
                loading={saving}
                onClick={handleSubmit}
              >
                Save and continue
              </LoadingButton>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Page>
  )
}

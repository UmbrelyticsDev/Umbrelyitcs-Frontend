import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Stack,
  Alert,
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

export default function Onboarding() {
  const [form, setForm] = useState({
    institution: '',
    country: '',
    location: '',
    subjects: [],
    gradeLevels: [],
    teachingPhilosophy: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isTeacher = user_type === 4 || user_type === 5
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

    try {
      setSaving(true)
      const res = await axios.post(
        `${REST_API_END_POINT}teacher/teaching-profile/${user.teacherId}`,
        { ...form, markOnboarded: true },
      )
      if (res.data.status === 1) {
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
                  multiline
                  minRows={3}
                  label="Teaching philosophy (optional)"
                  value={form.teachingPhilosophy}
                  onChange={set('teachingPhilosophy')}
                />
              </Grid>
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

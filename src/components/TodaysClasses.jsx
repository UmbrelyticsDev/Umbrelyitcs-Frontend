import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from '@material-ui/core'
import { AccessTime as TimeIcon, Room as RoomIcon } from '@material-ui/icons'
import { useNavigate } from 'react-router-dom'
import { PATH_DASHBOARD } from 'src/routes/paths'
import toolAxios from 'src/_apis_/toolAxios'

// Dashboard section: the teacher's classes scheduled for today, pulled from the
// timetable. Self-contained — drop <TodaysClasses /> into the dashboard page.
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const trimTime = (t) => (t ? String(t).slice(0, 5) : '')

export default function TodaysClasses() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const today = DAY_NAMES[new Date().getDay()]
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    toolAxios
      .get('/api/timetables')
      .then((r) => {
        if (active) setEntries(r.data.data || [])
      })
      .catch((e) => console.log('Failed to load timetable', e))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const todays = entries
    .filter((e) => e.day_of_week === today)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section header */}
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Today&apos;s Classes</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {today}
        </Typography>
      </Stack>

      {loading ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading today&apos;s classes…
        </Typography>
      ) : todays.length === 0 ? (
        // The teacher has classes (the dashboard only renders this section when
        // they do) but nothing is scheduled for today — a neutral message, not
        // the onboarding "set up classes" CTA, which only belongs pre-setup.
        <Card variant="outlined">
          <CardContent sx={{ py: 2.5 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No classes scheduled for today.
              </Typography>
              <Typography
                variant="body2"
                onClick={() =>
                  navigate(PATH_DASHBOARD.general.teacherTimetable)
                }
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View timetable
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {todays.map((e) => (
            <Card key={e.id} variant="outlined">
              <CardContent sx={{ py: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600 }}
                      noWrap
                    >
                      {e.class_name}
                    </Typography>
                    {e.subject && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                        noWrap
                      >
                        {e.subject}
                      </Typography>
                    )}
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                  >
                    <Chip
                      size="small"
                      color="primary"
                      icon={<TimeIcon fontSize="small" />}
                      label={`${trimTime(e.start_time)} – ${trimTime(
                        e.end_time,
                      )}`}
                    />
                    {e.room && (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<RoomIcon fontSize="small" />}
                        label={e.room}
                      />
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}

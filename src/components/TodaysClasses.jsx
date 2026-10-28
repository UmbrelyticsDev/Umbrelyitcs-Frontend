import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from '@material-ui/core'
import { alpha } from '@material-ui/core/styles'
import {
  AccessTime as TimeIcon,
  Room as RoomIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
} from '@material-ui/icons'
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
        // Empty state → a soft, primary-tinted call-to-action meant to draw a
        // first-time teacher here first. Opens the Timetable with the Manage
        // Classes modal (independents) so they can add classes right away.
        <Card
          variant="outlined"
          onClick={() =>
            navigate(
              `${PATH_DASHBOARD.general.teacherTimetable}?manageClasses=1`,
            )
          }
          sx={{
            cursor: 'pointer',
            borderColor: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            transition: 'box-shadow 0.15s, background-color 0.15s',
            '&:hover': {
              boxShadow: 4,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: '#fff',
                }}
              >
                <CalendarIcon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  Set up your classes
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Add your classes and build your timetable to get started — it
                  only takes a minute.
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ color: 'primary.main', flexShrink: 0 }} />
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

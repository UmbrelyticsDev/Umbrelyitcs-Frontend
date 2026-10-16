import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Grid,
} from '@material-ui/core'
import {
  MenuBook as LessonIcon,
  OpenInNew as OpenIcon,
} from '@material-ui/icons'
import toolAxios from 'src/_apis_/toolAxios'

// Dashboard section: lessons related to the classes scheduled for today
// (matched by subject + grade, since saved lessons carry no class id). When
// there are no classes today — or none match — it falls back to the most
// recent lessons. Self-contained; drop <RecentLessons /> into the dashboard.
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const normGrade = (g) =>
  String(g || '')
    .toLowerCase()
    .replace(/grade/g, '')
    .replace(/\s+/g, '')
    .trim()

const keyOf = (subject, grade) =>
  `${String(subject || '')
    .toLowerCase()
    .trim()}|${normGrade(grade)}`

// Base URL of the tool app (where saved lessons open). Set REACT_APP_TOOL_URL
// in the website's env (e.g. https://app.umbrelytics.com); falls back to the
// local tool dev server.
const TOOL_APP_URL = process.env.REACT_APP_TOOL_URL || 'http://localhost:3001'

export default function RecentLessons() {
  const [lessons, setLessons] = useState([])
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const today = DAY_NAMES[new Date().getDay()]

  // Open a saved lesson in the tool app (separate app → new tab)
  const openLesson = (id) =>
    window.open(
      `${TOOL_APP_URL}/saved-lessons?open=${id}`,
      '_blank',
      'noopener,noreferrer',
    )

  useEffect(() => {
    let active = true
    Promise.all([
      toolAxios.get('/api/lessons'),
      toolAxios.get('/api/timetables'),
    ])
      .then(([lRes, tRes]) => {
        if (!active) return
        setLessons(lRes.data?.data || [])
        setTimetable(tRes.data?.data || [])
      })
      .catch((e) => console.log('Failed to load recent lessons', e))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Keys for today's scheduled classes, matched against lessons by subject+grade
  const todayKeys = new Set(
    timetable
      .filter((e) => e.day_of_week === today)
      .map((c) => keyOf(c.subject, c.grade_level)),
  )

  const related = todayKeys.size
    ? lessons.filter((l) => todayKeys.has(keyOf(l.subject, l.grade_level)))
    : []

  // Show lessons tied to today's classes; otherwise the 4 most recent.
  const hasRelated = related.length > 0
  const toShow = (hasRelated ? related : lessons).slice(0, hasRelated ? 6 : 4)
  const label = hasRelated ? "Related to today's classes" : 'Most recent'

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section header */}
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Recent Lessons</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>

      {loading ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading recent lessons…
        </Typography>
      ) : toShow.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No lessons yet. Head to the Lesson Generator to create your first.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {toShow.map((l) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <Card
                variant="outlined"
                onClick={() => openLesson(l.id)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          color: 'primary.main',
                          mt: 0.25,
                          display: 'flex',
                          flexShrink: 0,
                        }}
                      >
                        <LessonIcon fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                          noWrap
                        >
                          {l.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {[l.subject, l.grade_level]
                            .filter(Boolean)
                            .join(' • ')}
                        </Typography>
                        {l.topic && (
                          <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
                            {l.topic}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.disabled',
                            display: 'block',
                            mt: 1,
                          }}
                        >
                          {new Date(l.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                    <OpenIcon
                      fontSize="small"
                      sx={{ color: 'text.disabled', flexShrink: 0 }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

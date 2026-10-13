import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Stack,
} from '@material-ui/core'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import Page from '../../../../components/Page'
import toolAxios from 'src/_apis_/toolAxios'

// Website (MUI) version of the tool's Syllabuses page. Same two tool endpoints
// via toolAxios → identical data, rendered as collapsible subject accordions.

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export default function Syllabuses() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teacherSubjects, setTeacherSubjects] = useState([])
  const [objectives, setObjectives] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [classesRes, objRes] = await Promise.all([
          toolAxios.get('/api/timetables/classes'),
          toolAxios.get('/api/curriculum/objectives'),
        ])

        const classes = classesRes.data?.data || []
        const subs = [
          ...new Set(
            classes
              .map((c) => (c.subject || '').trim())
              .filter(Boolean)
              .map((s) => s.toLowerCase()),
          ),
        ]
        setTeacherSubjects(subs)

        const payload = objRes.data
        setObjectives(payload?.data || (Array.isArray(payload) ? payload : []))
      } catch (e) {
        console.error('Failed to load syllabuses:', e)
        setError('Failed to load syllabus data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Subject -> Syllabus -> Overarching -> Theme -> Topic -> [objectives]
  const buildTree = () => {
    const tree = {}
    objectives.forEach((o) => {
      const subj = o.subject_name
      if (!subj) return
      if (
        teacherSubjects.length > 0 &&
        !teacherSubjects.includes(subj.trim().toLowerCase())
      )
        return

      const syl = o.syllabus_name || 'Syllabus'
      const ot = o.overarching_theme_name || 'General'
      const th = o.theme_name || 'Uncategorised'
      const tp = o.topic_name || 'General'

      if (!tree[subj]) tree[subj] = {}
      if (!tree[subj][syl]) tree[subj][syl] = {}
      if (!tree[subj][syl][ot]) tree[subj][syl][ot] = {}
      if (!tree[subj][syl][ot][th]) tree[subj][syl][ot][th] = {}
      if (!tree[subj][syl][ot][th][tp]) tree[subj][syl][ot][th][tp] = []
      tree[subj][syl][ot][th][tp].push(o)
    })

    Object.values(tree).forEach((syls) =>
      Object.values(syls).forEach((ots) =>
        Object.values(ots).forEach((ths) =>
          Object.values(ths).forEach((topics) =>
            Object.values(topics).forEach((list) =>
              list.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
            ),
          ),
        ),
      ),
    )

    return tree
  }

  const tree = buildTree()
  const subjects = Object.keys(tree).sort()

  const expandedSubject = location.state?.subject
    ? subjects.find((s) => slug(s) === slug(location.state.subject))
    : null

  return (
    <Page title="Syllabuses | Umbrelytics">
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">My Syllabuses</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            The full curriculum for the subjects you teach
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && subjects.length === 0 && (
          <Alert severity="info">
            No syllabuses found for the subjects you teach. Add classes under
            “Manage Classes” on your timetable so their subjects show here.
          </Alert>
        )}

        {!loading &&
          !error &&
          subjects.map((subject) => {
            const syllabuses = tree[subject]
            const sylNames = Object.keys(syllabuses).sort()
            return (
              <Accordion
                key={subject}
                defaultExpanded={subject === expandedSubject}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="h6">{subject}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {sylNames.length} syllabus
                      {sylNames.length !== 1 ? 'es' : ''}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={4} sx={{ width: '100%' }}>
                    {sylNames.map((syl) => {
                      const overarching = syllabuses[syl]
                      return (
                        <Box key={syl}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 'bold',
                              borderBottom: '2px solid',
                              borderColor: 'primary.light',
                              pb: 1,
                              mb: 2,
                            }}
                          >
                            {syl}
                          </Typography>
                          <Stack spacing={3}>
                            {Object.keys(overarching).map((ot) => (
                              <Box key={ot}>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {ot}
                                </Typography>
                                <Stack spacing={2} sx={{ ml: 1, mt: 1 }}>
                                  {Object.keys(overarching[ot]).map((th) => (
                                    <Box key={th}>
                                      <Typography variant="subtitle2">
                                        {th}
                                      </Typography>
                                      <Stack
                                        spacing={1.5}
                                        sx={{ ml: 2, mt: 0.5 }}
                                      >
                                        {Object.keys(overarching[ot][th]).map(
                                          (tp) => (
                                            <Box key={tp}>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: 500,
                                                  color: 'text.secondary',
                                                }}
                                              >
                                                {tp}
                                              </Typography>
                                              <Box
                                                component="ul"
                                                sx={{ mt: 0.5, mb: 0, pl: 3 }}
                                              >
                                                {overarching[ot][th][tp].map(
                                                  (o) => (
                                                    <li key={o.id}>
                                                      <Typography
                                                        variant="body2"
                                                        sx={{
                                                          whiteSpace:
                                                            'pre-line',
                                                        }}
                                                      >
                                                        {o.objective_text}
                                                      </Typography>
                                                    </li>
                                                  ),
                                                )}
                                              </Box>
                                            </Box>
                                          ),
                                        )}
                                      </Stack>
                                    </Box>
                                  ))}
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )
          })}
      </Container>
    </Page>
  )
}

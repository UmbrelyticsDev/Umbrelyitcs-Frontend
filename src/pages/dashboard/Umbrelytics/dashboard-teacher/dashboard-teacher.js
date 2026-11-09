import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Box,
  Card,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core'
import { ArrowForward as ArrowForwardIcon } from '@material-ui/icons'
import Page from '../../../../components/Page'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PATH_DASHBOARD } from '../../../../routes/paths'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import toolAxios from 'src/_apis_/toolAxios'
import TodaysClasses from 'src/components/TodaysClasses'
import RecentLessons from 'src/components/RecentLessons'
import RecentNotes from 'src/components/RecentNotes'
import NewsUpdates from 'src/components/NewsUpdates'
import AddClassesDialog from 'src/components/AddClassesDialog'
import TeachingPhilosophyModal from 'src/components/TeachingPhilosophyModal'

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 23, sm: 40, md: 18, lg: 18 },
}

export default function DashboardTeacher() {
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const user = JSON.parse(localStorage.getItem('user'))
  const [teacherData, setTeacherData] = useState([])
  const [classes, setClasses] = useState([])
  const [classesLoaded, setClassesLoaded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [philosophyOpen, setPhilosophyOpen] = useState(false)
  const [selectedClassModal, setSelectedClassModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeacherDataById()
    fetchTeacherClasses()
  }, [])

  const fetchTeacherDataById = async () => {
    try {
      const response = await axios.get(
        `${REST_API_END_POINT}get-teacher-details-for-editing/${user.teacherId}`,
      )
      if (response.data.status === 1) {
        setTeacherData(response.data.result)
      } else {
        console.log('not getting data')
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Independent teachers keep their classes in the tool (teacher_classes);
  // school-based teachers have school-linked classes on the website instead.
  // Try the tool first, and fall back to the website list (normalized into the
  // tool's shape) when the tool has none — so the cards/modal render the same.
  const fetchTeacherClasses = async () => {
    const normalizeWebsiteClass = (c) => ({
      id: c.id,
      class_name: c.name,
      subject: c.subjectName,
      grade_level: c.gradeName,
    })

    let toolClasses = []
    try {
      const toolRes = await toolAxios.get('/api/timetables/classes')
      toolClasses = toolRes.data?.data || []
    } catch (err) {
      console.log('Tool classes fetch failed', err)
    }

    if (toolClasses.length > 0) {
      setClasses(toolClasses)
      setClassesLoaded(true)
      return
    }

    try {
      const webRes = await axios.post(
        `${REST_API_END_POINT}class/get-class-by-teacher-id`,
        { teacherId: user.teacherId },
      )
      if (webRes.data.status === 1) {
        setClasses((webRes.data.data || []).map(normalizeWebsiteClass))
      } else {
        setClasses([])
      }
    } catch (err) {
      console.log('Website classes fetch failed', err)
    } finally {
      setClassesLoaded(true)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Page title="Dashboard | Umbrelytics">
      {loading ? (
        <Grid>
          <Paper sx={style}>
            <Box sx={{ width: '100%' }}>
              <CircularProgress color="inherit" />
            </Box>
          </Paper>
        </Grid>
      ) : (
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            sx={{ mt: -2, mb: 3, pl: { xs: 1, sm: 1, md: 1, lg: 0 } }}
          >
            Welcome {teacherData?.name || ''},
          </Typography>

          {/* ── Dashboard sections ──────────────────────────────────────────
              Each section is its own self-contained component. Add new ones
              below as they're built. */}

          {/* Dev news / updates */}
          <NewsUpdates />

          {/* Section 1 — today's scheduled classes. Hidden until the teacher
              has at least one class, so onboarding users aren't shown an empty
              "today" strip before they've set anything up. */}
          {classes.length > 0 && <TodaysClasses />}

          {/* My Classes — the teacher's full class list (sits directly below
              Today's Classes) */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              My Classes
            </Typography>
            <Grid container spacing={3}>
              {classes.map((cls) => (
                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                  <Card
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      // Per-class colour accent down the left edge.
                      borderLeft: '5px solid',
                      borderLeftColor:
                        /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
                          cls.color || '',
                        )
                          ? cls.color
                          : 'grey.300',
                      '&:hover': { boxShadow: 6 },
                    }}
                    onClick={() => setSelectedClassModal(cls)}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {cls.class_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[cls.subject, cls.grade_level]
                        .filter(Boolean)
                        .join(' • ')}
                    </Typography>
                  </Card>
                </Grid>
              ))}
              {classesLoaded && classes.length === 0 && (
                <Grid item xs={12}>
                  {/* Empty state → clickable: opens the Timetable with the
                      Manage Classes modal (independents) so first-time users
                      can add classes right away. Guarded by classesLoaded so it
                      doesn't flash before the class list has been fetched. */}
                  <Card
                    variant="outlined"
                    onClick={() => {
                      // Independents add classes in-place via the popup; school
                      // teachers still go to the timetable (school-linked flow).
                      if (user_type === 5) setAddOpen(true)
                      else
                        navigate(
                          `${PATH_DASHBOARD.general.teacherTimetable}?manageClasses=1`,
                        )
                    }}
                    sx={{
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.lighter',
                      transition: 'box-shadow 0.15s',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        label="START HERE"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                      />
                      <Typography
                        sx={{ fontWeight: 500, color: 'text.primary' }}
                      >
                        Set up your classes to get started.
                      </Typography>
                    </Stack>
                    <ArrowForwardIcon
                      sx={{ color: 'primary.main', flexShrink: 0 }}
                    />
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Teaching philosophy — prompt the teacher to set it once onboarded.
              Hidden entirely once they've entered one. */}
          {!teacherData?.teaching_philosophy?.trim() && (
            <Card
              sx={{
                mb: 3,
                p: 3,
                border: '2px dashed',
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    ✍️ Add your teaching philosophy
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Set it once and every lesson plan is aligned to the core
                    values behind how you teach — it only takes a minute.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setPhilosophyOpen(true)}
                  sx={{ flexShrink: 0 }}
                >
                  Add philosophy
                </Button>
              </Stack>
            </Card>
          )}

          {/* Section 2 — lessons tied to today's classes (else most recent) */}
          <RecentLessons />

          {/* Section 3 — most recent research notes */}
          <RecentNotes />

          <Dialog
            open={!!selectedClassModal}
            onClose={() => setSelectedClassModal(null)}
            maxWidth="sm"
            fullWidth
          >
            {selectedClassModal && (
              <>
                <DialogTitle>{selectedClassModal.class_name}</DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Subject
                      </Typography>
                      <Typography variant="body1">
                        {selectedClassModal.subject || '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Grade
                      </Typography>
                      <Typography variant="body1">
                        {selectedClassModal.grade_level || '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="contained"
                    onClick={() =>
                      navigate(
                        `${PATH_DASHBOARD.general.teacherTimetable}?editClass=${selectedClassModal.id}`,
                      )
                    }
                  >
                    View Timetable
                  </Button>
                  <Button onClick={() => setSelectedClassModal(null)}>
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          <TeachingPhilosophyModal
            open={philosophyOpen}
            onClose={() => {
              setPhilosophyOpen(false)
              fetchTeacherDataById()
            }}
            teacherId={user.teacherId}
          />

          {/* Add Classes — opens in place from the Set-up-classes CTA and
              closes once a class is added (independents). */}
          <AddClassesDialog
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onAdded={fetchTeacherClasses}
          />
        </Container>
      )}
    </Page>
  )
}

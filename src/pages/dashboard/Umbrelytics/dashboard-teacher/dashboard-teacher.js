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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core'
import Page from '../../../../components/Page'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PATH_DASHBOARD } from '../../../../routes/paths'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import toolAxios from 'src/_apis_/toolAxios'
import TodaysClasses from 'src/components/TodaysClasses' // adjust path to where you saved it
import RecentLessons from 'src/components/RecentLessons' // adjust path to where you saved it
import RecentNotes from 'src/components/RecentNotes' // adjust path to where you saved it
import NewsUpdates from 'src/components/NewsUpdates' // adjust path to where you saved it

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

          {/* Section 1 — today's scheduled classes */}
          <TodaysClasses />

          {/* Section 2 — lessons tied to today's classes (else most recent) */}
          <RecentLessons />

          {/* Section 3 — most recent research notes */}
          <RecentNotes />

          {/* My Classes — the teacher's full class list */}
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
              {classes.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No classes assigned yet.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Dev news / updates — after My Classes */}
          <NewsUpdates />

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
        </Container>
      )}
    </Page>
  )
}

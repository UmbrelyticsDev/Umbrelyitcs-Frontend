import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Grid,
  Stack,
  Box,
  Avatar,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@material-ui/core'
import { Icon } from '@iconify/react'
import editFill from '@iconify/icons-eva/edit-2-fill'
import emailFill from '@iconify/icons-eva/email-fill'
import phoneFill from '@iconify/icons-eva/phone-fill'
import bookOpenFill from '@iconify/icons-eva/book-open-fill'
import homeFill from '@iconify/icons-eva/home-fill'
import Page from '../../../../components/Page'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import { PATH_DASHBOARD } from 'src/routes/paths'

// Read-only view of the signed-in teacher's own details. Loads the same data
// the edit form (AddTeacherForm) loads — get-teacher-details-for-editing/:id for
// the teacher record, and get-subject/:departmentId to resolve subject names —
// but renders it as a display card with an "Update Profile" button that routes
// to the editor at /dashboard/teacher-details/profile.

const user = JSON.parse(localStorage.getItem('user') || '{}')
const user_type = JSON.parse(localStorage.getItem('user_type'))

export default function TeacherDetailsView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teacher, setTeacher] = useState(null)
  const [subjectNames, setSubjectNames] = useState([])
  const [school, setSchool] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const teacherId = user?.teacherId
        const res = await axios.get(
          `${REST_API_END_POINT}get-teacher-details-for-editing/${teacherId}`,
        )

        if (res.data?.status !== 1 || !res.data?.result) {
          setError('Could not load your details.')
          return
        }

        const data = res.data.result
        setTeacher(data)

        // Resolve subject ids (CSV) -> subject names via the department list.
        const theDepartmentId = data.departmentId || user?.departmentId
        if (data.subjects && theDepartmentId) {
          try {
            const subRes = await axios.get(
              `${REST_API_END_POINT}get-subject/${theDepartmentId}`,
            )
            const subjectsList = (subRes.data?.subjects || []).filter(
              (s) => s.status === 1,
            )
            const selectedIds = String(data.subjects)
              .split(',')
              .map((id) => parseInt(id, 10))
              .filter((id) => !Number.isNaN(id))
            const names = selectedIds
              .map((id) => subjectsList.find((s) => s.id === id)?.subjectName)
              .filter(Boolean)
            setSubjectNames(names)
          } catch (e) {
            console.error('Failed to resolve subject names:', e)
          }
        }

        // School-linked teachers (user_type 4) also show their school card.
        if (user_type === 4 && data.schoolId) {
          try {
            const schoolRes = await axios.get(
              `${REST_API_END_POINT}getSchool-details/${data.schoolId}`,
            )
            if (schoolRes.data?.status === 1) {
              setSchool(schoolRes.data.result)
            }
          } catch (e) {
            console.error('Failed to load school details:', e)
          }
        }
      } catch (e) {
        console.error('Failed to load teacher details:', e)
        setError('Could not load your details.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToEdit = () => navigate('/dashboard/teacher-details/profile')

  return (
    <Page title="Teacher Details | Umbrelytics">
      <Container maxWidth="lg">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4">Teacher Details</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Your current profile information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Icon icon={editFill} />}
            onClick={goToEdit}
          >
            Update Profile
          </Button>
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && teacher && (
          <Grid container spacing={3}>
            {/* Identity card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  src={teacher.image || ''}
                  alt={teacher.name}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h5">{teacher.name}</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  {user_type === 4 ? 'School Teacher' : 'Teacher'}
                </Typography>
                {teacher.status === 1 ? (
                  <Chip label="Active" color="success" size="small" />
                ) : (
                  <Chip label="Inactive" size="small" />
                )}
              </Card>
            </Grid>

            {/* Details card */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Contact & Teaching
                  </Typography>

                  <Stack spacing={2.5}>
                    <InfoRow
                      icon={emailFill}
                      label="Email"
                      value={teacher.email}
                    />
                    <InfoRow
                      icon={phoneFill}
                      label="Phone"
                      value={teacher.phoneNumber || '—'}
                    />
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ mb: 1 }}
                      >
                        <Box
                          component={Icon}
                          icon={bookOpenFill}
                          sx={{
                            width: 22,
                            height: 22,
                            color: 'text.secondary',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          Subjects
                        </Typography>
                      </Stack>
                      {subjectNames.length > 0 ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            pl: 4.5,
                          }}
                        >
                          {subjectNames.map((name) => (
                            <Chip key={name} label={name} size="small" />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ pl: 4.5 }}>
                          —
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" sx={{ mb: 1.5 }}>
                    Teaching Philosophy
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: teacher.teaching_philosophy
                        ? 'text.primary'
                        : 'text.secondary',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {teacher.teaching_philosophy ||
                      'No teaching philosophy added yet.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* School card (school-linked teachers only) */}
            {user_type === 4 && school && (
              <Grid item xs={12} md={8} sx={{ ml: 'auto' }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        component={Icon}
                        icon={homeFill}
                        sx={{ width: 22, height: 22, color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography variant="subtitle2">
                          {school.school_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {school.location}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      sx={{ mt: 2 }}
                      size="small"
                      onClick={() =>
                        navigate(PATH_DASHBOARD.general.teacherTimetable)
                      }
                    >
                      View my classes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Page>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        component={Icon}
        icon={icon}
        sx={{ width: 22, height: 22, color: 'text.secondary' }}
      />
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  )
}

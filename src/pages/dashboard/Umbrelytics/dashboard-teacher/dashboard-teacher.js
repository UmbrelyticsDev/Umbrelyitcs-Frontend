import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Box,
  Autocomplete,
  TextField,
  Chip,
  Card,
  CardContent,
  Button,
  Stack,
} from '@material-ui/core'
import { School as SchoolIcon } from '@material-ui/icons'
import useAuth from '../../../../hooks/useAuth'
import Page from '../../../../components/Page'
import DepartmentAnalyticsCarousal from '../dashboard-school/department-analytics-carousal'
import GradeAnalyticsCarousal from '../dashboard-school/grade-analytics-carousal'
import SubjectAnalyticsCarousal from '../dashboard-school/subject-analytics-carousal'
import ClassAnalyticsCarousal from '../schools/departments/grades-listing/class-analytics-caroussal'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PATH_DASHBOARD } from '../../../../routes/paths'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 23, sm: 40, md: 18, lg: 18 },
}

const SORT_OPTIONS = [
  { value: 'department', label: 'Department Analytics' },
  { value: 'grade', label: 'Grade Analytics' },
  { value: 'subject', label: 'Subject Analytics' },
  { value: 'class', label: 'Class Analytics' },
]

const applySort = (selectedFilters) => {
  if (selectedFilters.length === 0) {
    return [
      'DepartmentAnalyticsCarousal',
      'GradeAnalyticsCarousal',
      'SubjectAnalyticsCarousal',
      'ClassAnalyticsCarousal',
    ]
  }

  return selectedFilters
    .map((filter) => {
      switch (filter.value) {
        case 'department':
          return 'DepartmentAnalyticsCarousal'
        case 'grade':
          return 'GradeAnalyticsCarousal'
        case 'subject':
          return 'SubjectAnalyticsCarousal'
        case 'class':
          return 'ClassAnalyticsCarousal'
        default:
          return null
      }
    })
    .filter(Boolean)
}

export default function DashboardTeacher() {
  // const { user } = useAuth();
  const [filters, setFilters] = useState([])
  const sortedComponents = applySort(filters)
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const user = JSON.parse(localStorage.getItem('user'))
  const [data, setData] = useState([])
  const [teacherData, setTeacherData] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClassModal, setSelectedClassModal] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    fetchTeacherDataById()
    fetchTeacherClasses()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await axios.post(`${REST_API_END_POINT}dashboard-details`, {
        user_type: user_type,
        teacherId: user.teacherId,
        departmentId: user.departmentId,
      })

      if (res.data.status === 1) {
        console.log('dataaaa', res.data.result)
        setData(res.data.result)
      } else {
        console.log('not getting data')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchTeacherDataById = async () => {
    const response = await axios.get(
      `${REST_API_END_POINT}get-teacher-details-for-editing/${user.teacherId}`,
    )
    if (response.data.status === 1) {
      console.log('dataaaaaaaa', response.data.result)
      setTeacherData(response.data.result)
    } else {
      console.log('not getting data')
    }
  }

  const fetchTeacherClasses = async () => {
    try {
      const res = await axios.post(
        `${REST_API_END_POINT}class/get-class-by-teacher-id`,
        {
          teacherId: user.teacherId, // confirm this is the id that appears in class.teacherId (162)
        },
      )
      if (res.data.status === 1) setClasses(res.data.data)
      else setClasses([])
    } catch (err) {
      console.log('Error fetching classes', err)
    }
  }

  const handleChangeSort = (event, value) => {
    setFilters(value)
  }
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getGridSize = (index) => {
    if (filters.length === 1) {
      return 12
    } else if (filters.length === 2) {
      return 6
    } else if (filters.length === 3) {
      return index < 2 ? 6 : 12
    } else if (filters.length === 4) {
      return 6
    }
    return 6
  }

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
            sx={{ mt: -2, mb: 1, pl: { xs: 1, sm: 1, md: 1, lg: 0 } }}
          >
            Welcome {teacherData?.name || ''},
          </Typography>

          {/* LESSON PLANNER CARD */}

          <Grid container spacing={2} sx={{ mb: -8 }}>
            <Grid item xs={12} md={12}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
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
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', mb: 1 }}
                      >
                        {cls.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cls.subjectName || 'Subject'} •{' '}
                        {cls.gradeName || 'Grade'}
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
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4.5}
              sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}
            >
              <Autocomplete
                multiple
                fullWidth
                options={SORT_OPTIONS}
                getOptionLabel={(option) => option.label}
                value={filters}
                onChange={handleChangeSort}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      color="primary"
                      size="medium"
                      label={option.label}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Sort by"
                    placeholder="Select options"
                  />
                )}
              />
            </Grid>
            <Grid container spacing={3} sx={{ p: 2 }}>
              {sortedComponents.map((component, index) => {
                const Component = {
                  GradeAnalyticsCarousal: GradeAnalyticsCarousal,
                  SubjectAnalyticsCarousal: SubjectAnalyticsCarousal,
                  DepartmentAnalyticsCarousal: DepartmentAnalyticsCarousal,
                  ClassAnalyticsCarousal: ClassAnalyticsCarousal,
                }[component]

                const componentData =
                  {
                    GradeAnalyticsCarousal: data.latestGradeAnalytics,
                    SubjectAnalyticsCarousal: data.latestSubjectAnalytics,
                    DepartmentAnalyticsCarousal: data.latestDepartmentAnalytics,
                    ClassAnalyticsCarousal: data.latestClassAnalytics,
                  }[component] || []

                return (
                  <Grid
                    item
                    xs={12}
                    md={getGridSize(index)}
                    sx={{ mt: 1.5 }}
                    key={component}
                  >
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      {component
                        .replace('AnalyticsCarousal', ' Analytics :')
                        .replace(/([A-Z])/g, ' $1')
                        .trim()}
                    </Typography>
                    <Component data={componentData} />
                  </Grid>
                )
              })}
            </Grid>
          </Grid>
          <Dialog
            open={!!selectedClassModal}
            onClose={() => setSelectedClassModal(null)}
            maxWidth="sm"
            fullWidth
          >
            {selectedClassModal && (
              <>
                <DialogTitle>{selectedClassModal.name}</DialogTitle>
                <DialogContent dividers>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Subject
                      </Typography>
                      <Typography variant="body1">
                        {selectedClassModal.subjectName || '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Grade
                      </Typography>
                      <Typography variant="body1">
                        {selectedClassModal.gradeName || '—'}
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

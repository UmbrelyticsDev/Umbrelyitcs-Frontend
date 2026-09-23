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
} from '@material-ui/core'
import { School as SchoolIcon } from '@material-ui/icons'
import useAuth from '../../../../hooks/useAuth'
import Page from '../../../../components/Page'
import DepartmentAnalyticsCarousal from '../dashboard-school/department-analytics-carousal'
import GradeAnalyticsCarousal from '../dashboard-school/grade-analytics-carousal'
import SubjectAnalyticsCarousal from '../dashboard-school/subject-analytics-carousal'
import SchoolDetailsHOD from './school-details-hod'
import ClassAnalyticsCarousal from '../schools/departments/grades-listing/class-analytics-caroussal'
import axios from 'axios'
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

export default function DashboardHOD() {
  // const { user } = useAuth();
  const [filters, setFilters] = useState([])
  const sortedComponents = applySort(filters)
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const user = JSON.parse(localStorage.getItem('user'))
  const [data, setData] = useState([])
  const [hodData, setHodData] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchHodDataById()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await axios.post(`${REST_API_END_POINT}dashboard-details`, {
        user_type: user_type,
        hodId: user.hodId,
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

  const fetchHodDataById = async () => {
    const response = await axios.get(
      `${REST_API_END_POINT}get-hod-for-updating/${user.hodId}`,
    )
    if (response.data.status === 1) {
      console.log('dataaaaaaaa', response.data.result)

      setHodData(response.data.result)
    } else {
      console.log('not getting data')
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
            Welcome {hodData?.name},
          </Typography>

          {/* LESSON PLANNER CARD */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SchoolIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Lesson Planner Tool
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    Create and manage lesson plans with AI assistance
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: 'white',
                      color: '#667eea',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                    onClick={() =>
                      window.open(window.location.origin, '_blank')
                    }
                  >
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: -8 }}>
            <Grid item xs={12} md={12}>
              <SchoolDetailsHOD data={data} />
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
                  DepartmentAnalyticsCarousal: DepartmentAnalyticsCarousal,
                  GradeAnalyticsCarousal: GradeAnalyticsCarousal,
                  SubjectAnalyticsCarousal: SubjectAnalyticsCarousal,
                  ClassAnalyticsCarousal: ClassAnalyticsCarousal,
                }[component]

                const componentData =
                  {
                    DepartmentAnalyticsCarousal: data.deptAnalyticsData,
                    GradeAnalyticsCarousal: data.gradeAnalyticsData,
                    SubjectAnalyticsCarousal: data.subjectAnalyticsData,
                    ClassAnalyticsCarousal: data.classAnalyticsData,
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
        </Container>
      )}
    </Page>
  )
}

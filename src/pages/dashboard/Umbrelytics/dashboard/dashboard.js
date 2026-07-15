import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Box,
} from '@material-ui/core'
import useAuth from '../../../../hooks/useAuth'
import Page from '../../../../components/Page'
import SchoolAnalytics from './school-analytics'
import SchoolCarousal from './school-carousal'
import { MLinearProgress } from 'src/components/@material-extend'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import axios from 'axios'

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 23, sm: 40, md: 18, lg: 18 },
}

export default function DashboardUmbrelytics() {
  // const { user } = useAuth();
  const [loading, setLoading] = useState(false)
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const user = JSON.parse(localStorage.getItem('user'))
  const [data, setData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await axios.post(`${REST_API_END_POINT}dashboard-details`, {
        user_type: user_type,
        schoolId: user.schoolId,
        hodId: user.hodId,
        teacherId: user.teacherId,
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
              <MLinearProgress color="inherit" />
              <MLinearProgress color="warning" sx={{ mt: 2 }} />
              <MLinearProgress color="success" sx={{ mt: 2 }} />
              <MLinearProgress color="inherit" sx={{ mt: 2 }} />
            </Box>
          </Paper>
        </Grid>
      ) : (
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            sx={{ mt: -2, mb: 1, pl: { xs: 1, sm: 1, md: 1, lg: 0 } }}
          >
            Welcome Admin,
          </Typography>

          <Grid container spacing={2} sx={{ mb: -8 }}>
            <Grid item xs={12} md={12}>
              <SchoolAnalytics data={data} />
            </Grid>
            <Grid item xs={12} md={12} sx={{ mt: 1.5 }}>
              <SchoolCarousal data={data} />
            </Grid>
          </Grid>
        </Container>
      )}
    </Page>
  )
}

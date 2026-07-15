import { Icon } from '@iconify/react';
import ReactApexChart from 'react-apexcharts';
import trendingUpFill from '@iconify/icons-eva/trending-up-fill';
import trendingDownFill from '@iconify/icons-eva/trending-down-fill';
// material
import { alpha, useTheme, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Card, Typography, Stack, Grid, CircularProgress } from '@material-ui/core';
// utils
import { fNumber, fPercent } from '../../../../utils/formatNumber';
import React, { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.success.main,
  backgroundColor: alpha(theme.palette.success.main, 0.16)
}));

// ----------------------------------------------------------------------

const CHART_COLORS = ['#6bbd5b', '#ec4561', '#35d8e7'];

// const staticData = [
//   { id: 1, percent: 2.6, totalUser: 500, title: 'Total Active Schools', chartColor: CHART_COLORS[0] },
//   { id: 2, percent: -1.2, totalUser: 300, title: 'Total Inactive Schools', chartColor: CHART_COLORS[1] },
//   { id: 3, percent: 5.8, totalUser: 800, title: 'Total Schools', chartColor: CHART_COLORS[2] }
// ];

export default function SchoolAnalytics({data}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [staticData,setStaticData] = useState([])

  useEffect(() => {
    if (data.activeSchools !== undefined && data.inactiveSchools !== undefined) {
      const activeSchoolsCount = data?.activeSchools || 0;
      const inactiveSchoolsCount = data?.inactiveSchools || 0;
      const totalSchoolsCount = activeSchoolsCount + inactiveSchoolsCount;
  
      // Update the staticData with new values
      setStaticData([
        {
          id: 1,
          percent: calculatePercentageChange(activeSchoolsCount, totalSchoolsCount),  // Example: Change this logic as needed
          totalUser: activeSchoolsCount,
          title: 'Total Active Schools',
          chartColor: CHART_COLORS[0]
        },
        {
          id: 2,
          percent: calculatePercentageChange(inactiveSchoolsCount, totalSchoolsCount),  // Example: Change this logic as needed
          totalUser: inactiveSchoolsCount,
          title: 'Total Inactive Schools',
          chartColor: CHART_COLORS[1]
        },
        {
          id: 3,
          percent: 100,  
          totalUser: totalSchoolsCount,
          title: 'Total Schools',
          chartColor: CHART_COLORS[2]
        }
      ]);
    }
  }, [data]); 
  

  const calculatePercentageChange = (part, total) => {
    return total > 0 ? ((part / total) * 100).toFixed(1) : 0;
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
        <Grid container spacing={3}>
          {staticData.map((data, index) => (
            <Grid item xs={12} sm={12} md={4} key={data.id}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">{data.title}</Typography>
                  {/* <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1 }}>
                    <IconWrapperStyle
                      sx={{
                        ...(data.percent < 0 && {
                          color: 'error.main',
                          bgcolor: alpha(theme.palette.error.main, 0.16)
                        })
                      }}
                    >
                      <Icon width={16} height={16} icon={data.percent >= 0 ? trendingUpFill : trendingDownFill} />
                    </IconWrapperStyle>
                    <Typography component="span" variant="subtitle2">
                      {data.percent > 0 && '+'}
                      {fPercent(data.percent)}
                    </Typography>
                  </Stack> */}
                  {loading ? (
                    <Grid container justifyContent="flex-start" alignItems="start" sx={{ mt: 3 }}>
                      <svg width={0} height={0}>
                        <defs>
                          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#000000" />
                            <stop offset="50%" stopColor="#009b3a" />
                            <stop offset="100%" stopColor="#fed100" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <CircularProgress size={25} sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
                    </Grid>
                    ) : (
                    <Typography variant="h5" sx={{ mt: 2 }}>{fNumber(data.totalUser)} Schools</Typography>
                    )}
                </Box>
                <ReactApexChart
  type="bar"
  series={[{ data: [2532, 6632, 4132, 8932, 6332, 2532, 4432, 1232, 3632, 932, 3354] }]}
  options={{
    colors: [data.chartColor],
    chart: { sparkline: { enabled: true } },
    plotOptions: { bar: { columnWidth: '68%', borderRadius: 2 } },
    labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
    tooltip: {
      enabled: false,  // Disable the tooltip completely
    },
    marker: { show: false }
  }}
  width={60}
  height={36}
/>

              </Card>
            </Grid>
          ))}
        </Grid>
    </>
  );
}

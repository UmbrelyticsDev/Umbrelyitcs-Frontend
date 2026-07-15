import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tooltip, Typography } from '@material-ui/core';
import { Add, ArrowBack } from '@material-ui/icons';
import Page500 from 'src/pages/Page500';
import { useLocation, useNavigate } from 'react-router';
import { MLinearProgress } from 'src/components/@material-extend';
import Page from 'src/components/Page';
import ClassSearch from './class-search';
import ClassCard from './class-card';

export default function ClassGrid({ staticProducts, departmentId, gradeId, schoolId, gradeName, subjectName, subjectId, refresh, setRefresh, handleActivate, handleDelete, handleEditPageOpen }) {
  const location = useLocation();
  const [filteredUsers, setFilteredUsers] = useState(staticProducts);
  const [loading, setLoading] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false); 
  const navigate = useNavigate();
  const user_type = JSON.parse(localStorage.getItem('user_type'));

  useEffect(() => {
    setFilteredUsers(staticProducts);
  }, [staticProducts]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setFilteredUsers(staticProducts);
      setSearchNotFound(false); 
    } else {
      const filtered = staticProducts.filter(user => 
        user.name && typeof user.name === 'string' && user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length === 0) {
        setSearchNotFound(true); 
      } else {
        setSearchNotFound(false);
      }
      setFilteredUsers(filtered);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };
  const [hod, setHod] = useState(false);

  const SkeletonLoad = (
    <>
      {[...Array(filteredUsers.length)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Skeleton variant="rectangular" width="100%" sx={{ paddingTop: '115%', borderRadius: 2 }} />
        </Grid>
      ))}
    </>
  );

  if (loading) {
    return(
      <>
        <Grid sx={{pl:7,pr:7}}>
          <Box sx={{alignItems:'center'}}>
            <MLinearProgress sx={{mt:{xs:26,sm:45,md:27,lg:27},mb:2,}} color='inherit'/>
          </Box>
          <Box>
            <MLinearProgress sx={{mt:2,mb:2}} color='warning'/>
  
          </Box>
          <Box>
            <MLinearProgress sx={{mt:2,mb:2}} color='success'/>
          </Box>
          <Box>
            <MLinearProgress sx={{mt:2,mb:2}} color='inherit'/>
          </Box>
        </Grid>
      </>
    ) 
  }

  return (
    <>
    <Page title="Class Listing | Umbrelytics">
      <Container>
        <ClassSearch sx={{ mb: 4, }} staticData={staticProducts} onSearch={handleSearch} />
        {searchNotFound ? (
          <Grid sx={{mt:{xs:0,sm:-4,md:-15}}}>
            <Page500 /> 
          </Grid>
        ) : (
          <Grid container spacing={3}>
              {(
              filteredUsers.map((user) => (
                <Grid key={user.id} item xs={12} sm={6} md={4}>
                  <ClassCard user={user} departmentId={departmentId} gradeId={gradeId} schoolId={schoolId} gradeName={gradeName} subjectName={subjectName} subjectId={subjectId}  refresh={refresh} setRefresh={setRefresh} handleActivate={handleActivate} handleDelete={handleDelete} handleEditPageOpen={handleEditPageOpen} />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
    </Page>
    </>
  );
}

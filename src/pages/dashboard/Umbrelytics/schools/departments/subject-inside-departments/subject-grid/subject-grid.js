import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tooltip, Typography } from '@material-ui/core';
// import Folder from '../../../../../../images/folder.png';
import { Add, ArrowBack } from '@material-ui/icons';
import Page500 from 'src/pages/Page500';
import { useLocation, useNavigate } from 'react-router';
import { MLinearProgress } from 'src/components/@material-extend';
import Page from 'src/components/Page';
import SubjectCard from './subject-card';
import DepartmentSearch from '../../grade-grid/grade-search';
import SubjectSearch from './subject-search';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

export default function SubjectGrid({ staticProducts ,departmentId,handleActivateSubject,handleDeleteProduct,handleEditSubject,schoolId}) {
  const location = useLocation();
  // const [filteredUsers, setFilteredUsers] = useState(staticProducts);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false); 
  const navigate = useNavigate();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const [refresh,setRefresh] = useState(false)
  const [data,setData] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'));

 const  getData=()=>{
  if(user.hodId){
    axios.get(`${REST_API_END_POINT}get-subject-by-hod-id/${user.hodId}`)
    .then(res =>{
      if(res.data.status===1){
        setFilteredUsers(res.data.result)
        console.log('dataaaaaaaaaaaaaaa',res.data.result);

      }else{
        console.log('not getting dataaaaaa');
        
      }
    }).catch(err =>console.log(err))

  }else{

  axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`)
  .then(res =>{
    if(res.data.status===1){
     console.log("dataaaaaaaaaaaaaaaa",res.data.result);
     setFilteredUsers(res.data.result)
     setData(res.data.result)
    }else{
      console.log("not getting data");
    }
  }).catch(err =>console.log(err))

}
 }
  useEffect(()=>{
    getData()
  },[refresh])

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      getData()
      setSearchNotFound(false); 
    } else {
      const filtered = filteredUsers.filter(user => 
        user.subjectName && typeof user.subjectName === 'string' && user.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
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
    <Page title="Subject Listing | Umbrelytics ">
      <Container>
        <SubjectSearch sx={{ mb: 4, }} staticData={staticProducts} onSearch={handleSearch} />
        {searchNotFound ? (
          <Grid sx={{mt:{xs:0,sm:-4,md:-15}}}>
            <Page500 /> 
          </Grid>
        ) : (
          <Grid container spacing={3}>
              {(
              filteredUsers.map((user) => (
                <Grid key={user.id} item xs={12} sm={6} md={4}>
                  <SubjectCard user={user} handleActivateSubject={handleActivateSubject} setRefresh={setRefresh} refresh={refresh} handleDeleteProduct={handleDeleteProduct} handleEditSubject={handleEditSubject} schoolId={schoolId} departmentId={departmentId}/>
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

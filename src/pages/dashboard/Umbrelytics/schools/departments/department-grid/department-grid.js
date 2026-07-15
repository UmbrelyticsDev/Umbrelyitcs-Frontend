import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tooltip, Typography } from '@material-ui/core';
import Folder from '../../../../../../images/folder.png';
import { Add, ArrowBack } from '@material-ui/icons';
import Page500 from 'src/pages/Page500';
import { useLocation, useNavigate } from 'react-router';
import { MLinearProgress } from 'src/components/@material-extend';
import DepartmentCard from './department-card';
import DepartmentSearch from './department-search';
import Page from 'src/components/Page';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

export default function DepartmentGrid({ staticUserList, view,schoolId ,setDepartement ,setTempEditId}) {
  const location = useLocation();
  // const [filteredUsers, setFilteredUsers] = useState(staticUserList);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false); 
  const [data,setData]= useState([])
  const navigate = useNavigate();
  const user_type = JSON.parse(localStorage.getItem('user_type'));

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
 

  useEffect(()=>{
    fetchDepartmentById()
  },[])

  const fetchDepartmentById= async()=>{
    await axios.get(`${REST_API_END_POINT}get-all-departments/${schoolId}`)
   .then(res=>{
    if(res.data.status===1){
     console.log("gridDataaaaaaaaaaaaaa",res.data.result);
     setFilteredUsers(res.data.result)
    }else{
     console.log("not getting data");
     setFilteredUsers([])
    }
   }).catch(err =>console.log(err))
   }



  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setFilteredUsers(staticUserList);
      setSearchNotFound(false); 
    } else {
      const filtered = staticUserList?.filter(user => 
        user?.departmentName && typeof user.departmentName === 'string' && user?.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
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
    <Page title="Department Listing | Umbrelytics ">
      <Container>
        <DepartmentSearch sx={{ mb: 4, }} staticData={staticUserList} onSearch={handleSearch} />
        {searchNotFound ? (
          <Grid sx={{mt:{xs:0,sm:-4,md:-15}}}>
            <Page500 /> 
          </Grid>
        ) : (
          <Grid container spacing={3}>
              {(
              filteredUsers.map((user) => (
                <Grid key={user.id} item xs={12} sm={6} md={4}>
                  <DepartmentCard user={user} view={view} setDepartement={setDepartement} setTempEditId={setTempEditId}/>
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

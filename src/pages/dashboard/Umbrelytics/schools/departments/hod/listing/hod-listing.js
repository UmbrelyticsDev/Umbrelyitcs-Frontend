import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tooltip, Typography } from '@material-ui/core';
import { PATH_DASHBOARD } from '../../../../../../../routes/paths';
import Page from '../../../../../../../components/Page';
import HeaderBreadcrumbs from '../../../../../../../components/HeaderBreadcrumbs';
import LogoSchool from '../../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Logo from '../../../../../../../../src/images/HOD1.png';
import Logo1 from '../../../../../../../../src/images/HOD2.png';
import Logo2 from "../../../../../../../../src/images/HOD3.png";
import { Add, ArrowBack } from '@material-ui/icons';
import Page500 from 'src/pages/Page500';
import { useLocation, useNavigate } from 'react-router';
import HODSearch from './hod-search';
import HODCard from './hod-card';
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import AddHODForm from '../add-hod/add-hod-form';
import { MLinearProgress } from 'src/components/@material-extend';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import axios from 'axios';
import LoadingScreen from 'src/components/LoadingScreen';

const staticUsers = [
  { id: 1, name: 'Marlon Cambell', email: 'marlon@gmail.com', avatarUrl: Logo,  status: 1, },
  { id: 2, name: 'Keisha Miller', email: 'miller@gmail.com', avatarUrl: Logo1,status: 2,},
  { id: 3, name: "Jasicca Thompson", email: 'jassica@gmail.com', avatarUrl: Logo2, status: 1,  },
];

const staticUsersSingle = [
  { id: 1, name: 'Marlon Cambell', email: 'marlon@gmail.com',phone:'9837482364', avatarUrl: Logo,  status: 1,verified: 1, },
];

export default function HODListing({deptId,schoolid}) {
  const location = useLocation();
  // const isDepartmentDetailsPage = location.pathname === "/dashboard/schools/department/grade-listing";
  const isDetailsPage = location.pathname === "/dashboard/hod-details";
  const isDepartmentDetailsPage = location.pathname === "/dashboard/schools/department/department-subject-listing";
  console.log('kkkkkkkkkk',isDepartmentDetailsPage);
  // const [filteredUsers, setFilteredUsers] = useState(staticUsers);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUser, setFilteredUser] = useState('');

  
  const [loading, setLoading] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false); 
  const navigate =  useNavigate();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  console.log('user_type', user_type);
  const user = JSON.parse(localStorage.getItem('user'));
  const [data,setData] = useState([])
  const [tempEditId,setTempEditId] = useState(null)
  const [deptLimit,setDeptLimit] = useState(false)
  const [hodData,setHodData] = useState([])
  const [SchoolData,setSchoolData] = useState([])


  // const { departmentId} = location.state || {}
  const schoolId = location.state?.schoolId || user?.schoolId || schoolid 
  const departmentId = location.state?.departmentId || deptId 
console.log("schoolIdschoolId",schoolId,departmentId);


  useEffect(()=>{
    fetchAllHod()
    fetchHodById()
    // fetchSchoolDataById()
},[departmentId,])
  
  const fetchAllHod=async()=>{
    console.log('responseeeeeeeeeeeee111111111',);
    let limitData=''
    setLoading(true);  

    await axios.get(`${REST_API_END_POINT}get-all-dept-hod/${departmentId}`)
    .then(res=>{
      if(res.data.status===1){
       console.log('responseeeeeeeeeeeee',res.data);
       setFilteredUsers(res.data.result)
       setFilteredUser(res.data?.datalength)
       limitData=res.data?.datalength
       console.log('responseeeeeeeeeeeee11',res.data?.datalength);
      }else{
         console.log("not getting data");
         setFilteredUsers([])
         
      }
    }).catch(err =>console.log(err))
    .finally(()=>{
      setTimeout(() => {
        setLoading(false);  
      }, 2000); // 
    })


    if(limitData){
      setLoading(true); 
      await axios.get(`${REST_API_END_POINT}getSchool-details/${schoolId}`)
      .then(res =>{
        if(res.data.status===1){
          console.log('responseeeeeeeeeeeee',res.data.result);
          setSchoolData(res.data.result);
          console.log('responseeeeeeeeeeeee2a',filteredUser);
          if(limitData >= res.data.result?.no_of_hod) {
            setDeptLimit(true)
          
          }else {
            setDeptLimit(false);
          }
          
        }else{
          console.log('not getting data');
          
        }
      }).catch(err =>console.log(err))
      .finally(()=>{
        setTimeout(() => {
          setLoading(false);  
        }, 2000); // 
      })
    }


  }
  const fetchHodById = async()=>{
    await axios.get(`${REST_API_END_POINT}get-hod-details-for-hod-login/${user.hodId}`)
    .then(res =>{
      if(res.data.status===1) {
         console.log(res.data.result,'dataaaaaaaaaaa');
         setHodData(res.data.result)
      }else{
        console.log("not getting data");
        setHodData([])
        
      }
    })
  }






  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      fetchAllHod()
      setSearchNotFound(false); 
    } else {
      const filtered = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // if (loading && !isDepartmentDetailsPage ) {
  //   return(
  //     <>
  //       <Grid sx={{pl:7,pr:7}}>
  //         <Box sx={{alignItems:'center'}}>
  //           <MLinearProgress sx={{mt:{xs:26,sm:45,md:27,lg:27},mb:2,}} color='inherit'/>
  //         </Box>
  //         <Box>
  //           <MLinearProgress sx={{mt:2,mb:2}} color='warning'/>
  
  //         </Box>
  //         <Box>
  //           <MLinearProgress sx={{mt:2,mb:2}} color='success'/>
  //         </Box>
  //         <Box>
  //           <MLinearProgress sx={{mt:2,mb:2}} color='inherit'/>
  //         </Box>
  //       </Grid>
  //     </>
  //   ) 
  // }
  //  if(loading && isDepartmentDetailsPage) {
  //   return(
  //     <>
  //       <Grid sx={{pl:7,pr:7}}>
  //         <Box sx={{alignItems:'center'}}>
  //           <MLinearProgress sx={{mt:{xs:22,sm:33,md:22,lg:22},mb:2,}} color='inherit'/>
  //         </Box>
  //         <Box>
  //           <MLinearProgress sx={{mt:2,mb:2}} color='warning'/>
  
  //         </Box>
  //         <Box>
  //           <MLinearProgress sx={{mt:2,mb:2}} color='success'/>
  //         </Box>
  //         <Box>
  //           <MLinearProgress sx={{mt:2,mb:2}} color='inherit'/>
  //         </Box>
  //       </Grid>
  //     </>
  //   ) 
  // }

  // if (loading) {
  //   return(
  //       <>
  //     <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',height:"100vh" }}>
  // <LoadingScreen/>
  //     </Box>

  //   </>
  //   ) 
  // }

  return (
    <>
    {user_type !== 3 ? (<Page title="HOD Listing | Umbrelytics">
      <Container>
      {!isDepartmentDetailsPage ? (
        <>
        <Stack direction="row">
        <Avatar alt={SchoolData?.contact_name} sx={{mt:-0.2}} src={LogoSchool} />
        <Box>
          <Tooltip title={SchoolData?.contact_name}>
            <Typography variant='h6' sx={{mt:1,ml:1,mb:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>{SchoolData?.contact_name}</Typography>
          </Tooltip>
        </Box>
      </Stack>
        <HeaderBreadcrumbs
          heading="HOD Listing"
          links={[
            { name: 'Department Lisiting', href: PATH_DASHBOARD.general.department },
            { name: 'HOD Listing' }
          ]}
          action={
            <>
                <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
            </>
          }
        />
        <Box sx={{display:'flex',justifyContent:'flex-end'}}>
          <Button variant='contained' color='success' 
          disabled={deptLimit}
          onClick={() => {
            setHod(true)
            setTempEditId(null)
            }} sx={{boxShadow:'none',color:'#fff',mb:{xs:3.5,sm:0,md:0},mt:{xs:-5,sm:0,md:0}}} startIcon={<Add />}>Add HOD</Button>
        </Box>
        
        </>
      ) : ''}
      {isDepartmentDetailsPage  && (<Box sx={{display:'flex',justifyContent:'flex-end',marginTop:'15px'}}>
          <Button variant='contained' color='success' 
          disabled={deptLimit}
          onClick={() => {
            if(!deptLimit){
              setHod(true)
            setTempEditId(null)}
            }} sx={{boxShadow:'none',color:'#fff',mb:{xs:3.5,sm:0,md:0},mt:{xs:-5,sm:0,md:0}}} startIcon={<Add />}>Add HOD</Button>
        </Box>)}
      <Modal
            open={hod}
            handleClose={() => {
              setHod(false);
              }}
            modalTitle={`${tempEditId?"Update" : "Add"} HOD`}> 

            <AddHODForm hod={hod} setHod={setHod} schoolId={schoolId} departmentId={departmentId} tempEditId={tempEditId} deptLimit={deptLimit} />
            
        </Modal>
        <HODSearch sx={{ mb: 4, }} staticData={filteredUsers} onSearch={handleSearch} />
        {searchNotFound ? (
          <Grid sx={{mt:{xs:0,sm:-4,md:-15}}}>
            <Page500 /> 
          </Grid>
        ) : (
          <Grid container spacing={3}>
              {(
              filteredUsers.map((user) => (
                <Grid key={user.id} item xs={12} sm={6} md={4}>
                  <HODCard user={user} email={user.email} setTempEditId={setTempEditId} setHod={setHod}/>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
    </Page>) : (
      <Page title="HOD Listing | Umbrelytics">
      <Container>
      {!isDepartmentDetailsPage ? (
        <>
        <Stack direction="row">
        <Avatar alt={SchoolData?.contact_name} sx={{mt:-0.2}} src={LogoSchool} />
        <Box>
          <Tooltip title={SchoolData?.contact_name}>
            <Typography variant='h5' sx={{mt:1,ml:1,mb:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>{SchoolData?.contact_name}</Typography>
          </Tooltip>
        </Box>
      </Stack>
        <HeaderBreadcrumbs
          heading={`Welcome HOD, ${hodData.name}`}
          links={[
            { name: 'Subject Listing', href: PATH_DASHBOARD.general.Departmentsubjects },
            { name: 'HOD Details' }
          ]}
        />
        </>
      ) : ''}

      {/* {staticUsersSingle.map((user) => (
          <HODCard user={user} email={user.email}  />
        ))} */}
     
          <HODCard isDetailsPage={isDetailsPage} user={hodData} email={hodData.email}  />
  

      </Container>
    </Page>
    )}
    </>
  );
}

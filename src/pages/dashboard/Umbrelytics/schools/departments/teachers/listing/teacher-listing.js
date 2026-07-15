import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Paper, Skeleton, Stack, Tooltip, Typography } from '@material-ui/core';
import { PATH_DASHBOARD } from '../../../../../../../routes/paths';
import Page from '../../../../../../../components/Page';
import HeaderBreadcrumbs from '../../../../../../../components/HeaderBreadcrumbs';
import LogoSchool from '../../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Logo from '../../../../../../../../src/images/Teacher1.png';
import Logo1 from '../../../../../../../../src/images/Teacher2.png';
import Logo2 from "../../../../../../../../src/images/Teacher3.png";
import { Add, ArrowBack } from '@material-ui/icons';
import Page500 from 'src/pages/Page500';
import { useLocation, useNavigate } from 'react-router';
import HODSearch from './teacher-search';
import HODCard from './teacher-card';
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import AddHODForm from '../add-teachers/add-teachers-form';
import AddTeacherForm from '../add-teachers/add-teachers-form';
import TeacherSearch from './teacher-search';
import TeacherCard from './teacher-card';
import { MLinearProgress } from 'src/components/@material-extend';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import LoadingScreen from 'src/components/LoadingScreen';

const staticUsers = [
  { id: 1, name: 'Michel Cambell', email: 'michel@gmail.com', avatarUrl: Logo,  status: 1,subjects:"Mathematics" },
  { id: 2, name: 'Andre Thompson', email: 'thomson@gmail.com', avatarUrl: Logo1,status: 2,subjects:"English, Chemistry"},
  { id: 3, name: "Aisha James", email: 'aisha@gmail.com', avatarUrl: Logo2, status: 1, subjects:"Physics" },
];
const staticUsersSingle = [
  { id: 1, name: 'Michel Cambell', email: 'michel@gmail.com', avatarUrl: Logo,  status: 1,verified:1,phone:'9676564534', },
];

export default function TeacherListing({departmentId,schoolId}) {
  const location = useLocation();
  const isDepartmentDetailsPage = location.pathname === "/dashboard/schools/department/grade-details/class-details";
  // const [filteredUsers, setFilteredUsers] = useState(staticUsers);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUser, setFilteredUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false); 
  const navigate =  useNavigate();
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  // const user = JSON.parse(localStorage.getItem('user'));
  // const schoolId=user?.schoolId
  const [teacher, setTeacher] = useState(false);
  const [tempEditId, setTempEditId] = useState(null);
  const [deptLimit,setDeptLimit] = useState(false)
  const [subjectsList, setSubjectList] = useState([])
  const [updatedUsers, setUpdatedUsers] = useState([]);
  const [isLoading,setIsLoading] = useState(false)
  const [teacherDetail,setTeacherDetail] = useState({})
  const [schoolDetail,setchoolDetail] = useState({})
  const user = JSON.parse(localStorage.getItem('user'));

console.log("teacherIdteacherId",user);


  const fetchTeacherDetailById=()=>{
    axios.get(`${REST_API_END_POINT}get-teacher-details-for-editing/${user?.teacherId}`)
    .then((res)=>{
      if(res.data.status ===1){
        setTeacherDetail(res.data.result)
        
      }
    })
    .catch((err)=>{
      console.log(err)
    })
  }


  if(user_type==4){
  useEffect(() => {
      fetchTeacherDetailById()
    }, []);
  }


  useEffect(()=>{
    fetchSubjectsByDepartmentId()
    
      fetchTeachers()
   
    // fetchSchoolDataById()

  },[departmentId])
// },[departmentId,filteredUsers])

const fetchSubjectsByDepartmentId = async () => {
  
  await axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`)
    .then(res => {
      if (res.data.status === 1) {
        const filteredSubjects = res.data.result.filter(subject => subject.status === 1);
        setSubjectList(filteredSubjects)

      } else {
        setSubjectList([])
      }
    }).catch(err => console.log(err))
}

  const fetchTeachers=async()=>{
  
    
    let limitData=''
  setIsLoading(true);  
    await axios.get(`${REST_API_END_POINT}get-teacher/${departmentId}`)
    .then(res =>{
      if(res.data.status===1) {
        setFilteredUsers(res.data.result)
        setFilteredUser(res.data.result.length)
        limitData=res.data.result.length
        
        setTimeout(() => {
          setIsLoading(false);  
        }, 2000); 
      }else{
        setFilteredUsers([])
        setIsLoading(false);  

      }
    }).catch(err =>console.log(err))


    if(limitData){
   
      await axios.get(`${REST_API_END_POINT}getSchool-details/${schoolId}`)
      .then(res =>{
        if(res.data.status===1){
          setchoolDetail(res.data.result)
          
          
          if(limitData >= res.data.result?.no_of_teacher) {
            setDeptLimit(true)
          }else {
            setDeptLimit(false);
          }
        }else{
          
        }
      }).catch(err =>console.log(err))
    }
  }

  // const fetchSchoolDataById=async()=>{
   
  //   await axios.get(`${REST_API_END_POINT}getSchool-details/${schoolId}`)
  //   .then(res =>{
  //     if(res.data.status===1){
  //       setchoolDetail(res.data.result)
        
  //     }else{
        
  //     }
  //   }).catch(err =>console.log(err))
  // }

 

  useEffect(() => {
    const usersWithSubjects = filteredUsers.map((user) => {
      const subjectIds = user.subjects ? user.subjects.split(',') : [];
  
      // Map subject IDs to subject names
      const selectedSubjects = subjectIds
        .map(id => subjectsList.find(subject => subject.id === parseInt(id)))
        .filter(Boolean) // Filter out any undefined subjects
        .map(subject => subject.subjectName); // Extract the subjectName
  
      // Return a new user object with updated subjects
      return {
        ...user,
        subjects: selectedSubjects.join(', ') // Join the subject names into a string
      };
    });
  
    // Save the updated users to a new state
    setUpdatedUsers(usersWithSubjects);
    

  }, [filteredUsers, subjectsList]); // Runs when filteredUsers or subjectsList changes
  

  const handleOpenEditPage=(id)=>{
    setTempEditId(id)
    setTeacher(true)

  }



  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      fetchTeachers()
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

  const SkeletonLoad = (
    <>
      {[...Array(filteredUsers.length)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Skeleton variant="rectangular" width="100%" sx={{ paddingTop: '115%', borderRadius: 2 }} />
        </Grid>
      ))}
    </>
  );

  if (loading && !isDepartmentDetailsPage) {
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

  if(loading && isDepartmentDetailsPage) {
    return(
      <>
        <Grid sx={{pl:7,pr:7}}>
          <Box sx={{alignItems:'center'}}>
            <MLinearProgress sx={{mt:{xs:20,sm:37,md:18,lg:18},mb:2,}} color='inherit'/>
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

  if (isLoading) {
    return(
        <>
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',height:"100vh" }}>
  <LoadingScreen/>
      </Box>

    </>
    ) 
  }

  return (
    <>
    {user_type !== 4 ?(<Page title="Teacher Listing | Umbrelytics">
      <Container sx={{pt:3}}>
        {!isDepartmentDetailsPage ? (<>
      {/* <Stack direction="row">
        <Avatar alt='Jamaica High School' sx={{mt:-0.2}} src={LogoSchool} />
        <Box>
          <Tooltip title={'Jamaica High School'}>
            <Typography variant='h6' sx={{mt:1,ml:1,mb:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>Jamaica High School</Typography>
          </Tooltip>
        </Box>
      </Stack>
        <HeaderBreadcrumbs
          heading="Teacher Listing"
          links={[
            { name: 'Subject Listing', href: PATH_DASHBOARD.general.Departmentsubjects },
            { name: 'Teacher Listing' }
          ]}
          action={
            <>
                <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
            </>
          }
        /> */}
        {user_type !== 3 && user_type !== 4 &&(<Box sx={{display:'flex',justifyContent:'flex-end'}}>
          <Button variant='contained' color='success' disabled={deptLimit}  onClick={() => {
            setTempEditId(null)
            setTeacher(true)}
             } sx={{boxShadow:'none',color:'#fff',mb:{xs:3.5,sm:0,md:0},mt:{xs:-5,sm:0,md:0}}} startIcon={<Add />}>Add Teacher</Button>
        </Box>)}
        <Modal
            open={teacher}
            handleClose={() => {
              setTeacher(false);
              }}
            modalTitle={`${tempEditId? 'Edit' : 'Add'} Teacher`}> 

            <AddTeacherForm teacher={teacher} setTeacher={setTeacher} deptLimit={deptLimit} departmentId={departmentId} schoolId={schoolId} tempEditId={tempEditId}/>
            
        </Modal>
        </>) : ''}
        <TeacherSearch sx={{ mb: 4,}} staticData={staticUsers} onSearch={handleSearch} />
        {searchNotFound ? (
          <Grid sx={{mt:{xs:0,sm:-4,md:-15}}}>
            <Page500 /> 
          </Grid>
        ) : (
          <Grid container spacing={3}>
            
            {(
              updatedUsers.map((user) => (
                <Grid key={user.id} item xs={12} sm={6} md={4}>
                  <TeacherCard user={user} email={user.email}  handleOpenEditPage={handleOpenEditPage}  schoolId={schoolId}/>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
    </Page>) : <Page title="Teacher Details | Umbrelytics">
      <Container>
        {!isDepartmentDetailsPage ? (<>
      <Stack direction="row">
        <Avatar alt={schoolDetail?.school_name} sx={{mt:-0.2}} src={LogoSchool} />
        <Box>
          <Tooltip title={schoolDetail?.school_name}>
            <Typography variant='h6' sx={{mt:1,ml:1,mb:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>{schoolDetail?.school_name}</Typography>
          </Tooltip>
        </Box>
      </Stack>
        <HeaderBreadcrumbs
          // heading="Welcome Teacher Michel Cambell,"
          heading={`Welcome Teacher ${teacherDetail?.name}`}
          links={[
            { name: 'Class Listing', href: PATH_DASHBOARD.general.departmentdetails },
            { name: 'Teacher Details' }
          ]}
        />
        </>) : ''}
         
          
            <TeacherCard user={teacherDetail}/>
        
      </Container>
    </Page>}
    </>
  );
}

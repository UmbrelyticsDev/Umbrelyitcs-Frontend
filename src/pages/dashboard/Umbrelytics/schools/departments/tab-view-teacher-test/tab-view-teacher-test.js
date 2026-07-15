import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tab, Tabs, Tooltip, Typography } from '@material-ui/core';
import { PATH_DASHBOARD } from '../../../../../../routes/paths';
import HeaderBreadcrumbs from '../../../../../../components/HeaderBreadcrumbs';
import LogoSchool from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import { Add, Analytics, ArrowBack, Class, Create, ImportContacts, Person, School, Subject } from '@material-ui/icons';
import Page from 'src/components/Page';
import TeacherListing from '../teachers/listing/teacher-listing';
import TestListingTable from '../test/test-listing-table';
import TeacherSubjectMarksheetView from '../teachers/teacher-subject-view-table/teacher-subject-marksheet-view';
import TeacherSubjectListing from '../teachers/teacher-subject-view-table/teacher-subject-view-table';
import Label from 'src/components/Label';
import TeacherAnalytics from '../teacher-analytics/teacher-analytics';
import ClassAnalyticsListing from '../grades-listing/class-analytics.js/class-analytics';
import { useLocation } from 'react-router';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useQuery } from 'src/utils/queryParams';

const user_type = JSON.parse(localStorage.getItem('user_type'));


const SCROLLABLE_TAB = [
    { value: '1', icon: <Label variant='ghost' color='warning' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Create /></Label>, label: 'Test Listing' },
    { value: '3', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Class Analytics' },
    // user_type !== 4 ? { value: '2', icon: <Label variant='ghost' color='error' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Person /></Label>, label: 'View Teachers' } : { value: '2', icon: <Label variant='ghost' color='success' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><ImportContacts /></Label>, label: 'Assigned Subjects' },
  ];
const SCROLLABLE_TAB1 = [
    { value: '1', icon: <Label variant='ghost' color='warning' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Create /></Label>, label: 'Test Listing' },
    user_type !== 4 ? { value: '2', icon: <Label variant='ghost' color='error' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Person /></Label>, label: 'View Teachers' } : { value: '2', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Test Analytics' },
    // user_type !== 4 ? { value: '2', icon: <Label variant='ghost' color='error' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Person /></Label>, label: 'View Teachers' } : { value: '2', icon: <Label variant='ghost' color='success' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><ImportContacts /></Label>, label: 'Assigned Subjects' },
    // user_type === 4 && { value: '3', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Assigned Subject Analytics' },
  ];

export default function TabViewTeacherTest() {
  const [loading, setLoading] = useState(false);
  const valueTabScrollableTest = localStorage.getItem('valueTabScrollableTest');
  const [valueScrollable, setValueScrollable] = useState(valueTabScrollableTest || '1');
  const viewType = localStorage.getItem('viewType');
  const location = useLocation();
  const query = useQuery();
  const departmentId = location.state?.departmentId || query?.get('departmentId')
  const classId = location.state?.classId || query?.get('classId')
  const className = location.state?.className || query.get('className')
  const gradeId = location.state?.gradeId || query.get('gradeId')
  const schoolId = location.state?.schoolId || query.get('schoolId')
  const gradeName = location.state?.gradeName || query.get('gradeName')
  const subjectName = location.state?.subjectName || query.get('subjectName')
  const subjectId = location.state?.subjectId || query.get('subjectId')

  

  const user = JSON.parse(localStorage.getItem('user'));
  const [singleSchoolData, setSingleSchoolData] = useState(false);
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'));
  const id = user?.schoolId || newSchoolId || schoolId

  const fetchSchoolById= async()=>{
    await axios.get(`${REST_API_END_POINT}getSchool-details/${id}`)
    .then(res =>{
      if(res.data.status===1){
        setSingleSchoolData(res.data.result)
      }else{
       
      }
    }).catch(err =>console.log(err))
  }

  useEffect(()=>{
    fetchSchoolById()
  },[])

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue);
    localStorage.setItem('valueTabScrollableTest',newValue)
    
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Page title="Test Details | Umbrelytics ">
    <Container>
      <Stack direction="row">
        <Avatar sx={{mt:-0.2}} alt={singleSchoolData?.school_name} src={LogoSchool} />
        <Box>
          <Tooltip title={singleSchoolData?.school_name}>
            <Typography variant='h6' sx={{mt:1,ml:1,mb:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>{singleSchoolData?.school_name}</Typography>
          </Tooltip>
        </Box>
      </Stack>
        {user_type ===1 ?(<HeaderBreadcrumbs
          heading={'Test Details'}
          links={[
            user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details',href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details',href: PATH_DASHBOARD.general.hodDetails} : { name: 'Teacher Details',href: PATH_DASHBOARD.general.teacherDetails},
            { name: 'Department Listing', href: PATH_DASHBOARD.general.department, state: { viewType: viewType, departmentId: departmentId, schoolId: schoolId } },
            { name: subjectName || 'Subject Listing', href: PATH_DASHBOARD.general.Departmentsubjects, state: { viewType: viewType, departmentId: departmentId, schoolId: schoolId } },
            { name: gradeName || 'Grade Details', href: PATH_DASHBOARD.general.gradeListing, state: { subjectName:subjectName, subjectId: subjectId , schoolId:schoolId ,departmentId:departmentId } },
            { name: className || 'Class Details', href: PATH_DASHBOARD.general.departmentdetails, state: { subjectName:subjectName, subjectId: subjectId , schoolId:schoolId ,departmentId:departmentId, classId:classId, className:className, gradeId:gradeId, gradeName:gradeName } },
            { name: 'Test Details' }
          ]}
          // action={
          //   <>
          //       <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
          //   </>
          // }
        />) : user_type === 2 ? <HeaderBreadcrumbs
        heading={'Test Details'}
        links={[
          user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details',href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details',href: PATH_DASHBOARD.general.hodDetails} : { name: 'Teacher Details',href: PATH_DASHBOARD.general.teacherDetails},
          { name: 'Department Listing', href: PATH_DASHBOARD.general.department, state: { viewType: viewType, departmentId: departmentId, schoolId: schoolId } },
          { name: subjectName || 'Subject Listing', href: PATH_DASHBOARD.general.Departmentsubjects, state: { viewType: viewType, departmentId: departmentId, schoolId: schoolId } },
          { name: gradeName || 'Grade Details', href: PATH_DASHBOARD.general.gradeListing, state: { subjectName:subjectName, subjectId: subjectId , schoolId:schoolId ,departmentId:departmentId } },
          { name: className || 'Class Details', href: PATH_DASHBOARD.general.departmentdetails, state: { subjectName:subjectName, subjectId: subjectId , schoolId:schoolId ,departmentId:departmentId, classId:classId, className:className, gradeId:gradeId, gradeName:gradeName } },
          { name: 'Test Details' }
        ]}
      /> : user_type === 3 ?
      <HeaderBreadcrumbs
          heading={'Test Details'}
          links={[
            user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details',href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details',href: PATH_DASHBOARD.general.hodDetails} : { name: 'Teacher Details',href: PATH_DASHBOARD.general.teacherDetails},
            { name: subjectName || 'Subject Listing', href: PATH_DASHBOARD.general.Departmentsubjects, state: { viewType: viewType, departmentId: departmentId, schoolId: schoolId } },
            { name: gradeName || 'Grade Details', href: PATH_DASHBOARD.general.gradeListing, state: { subjectName:subjectName, subjectId: subjectId , schoolId:schoolId ,departmentId:departmentId } },
            { name: className || 'Class Details', href: PATH_DASHBOARD.general.departmentdetails, state: { subjectName:subjectName, subjectId: subjectId , schoolId:schoolId ,departmentId:departmentId, classId:classId, className:className, gradeId:gradeId, gradeName:gradeName } },
            { name: 'Test Details' }
          ]}
        /> : <HeaderBreadcrumbs
        heading={'Test Details'}
        links={[
          user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details',href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details',href: PATH_DASHBOARD.general.hodDetails} : { name: 'Teacher Details',href: PATH_DASHBOARD.general.teacherDetails},
          { name: className || 'Class Details', href: PATH_DASHBOARD.general.departmentdetails, state: { 
              classId:classId, 
             className:className, 
              teacherId:user?.teacherId 
            } },
          { name: 'Test Details' }
        ]}
      />}
        <Tabs
          sx={{mt:-3}}
          allowScrollButtonsMobile
          value={valueScrollable}
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChangeScrollable}
        >
          {user_type === 1 && SCROLLABLE_TAB.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
          {user_type === 2 && SCROLLABLE_TAB.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
          {user_type === 3 && SCROLLABLE_TAB.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
          {user_type === 4 && SCROLLABLE_TAB1.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>
        {valueScrollable === '1' ? (
          <Box sx={{mt:{xs:4,sm:0,md:0},ml:{xs:-1,sm:-3,md:-3}}}>
            <TestListingTable departmentId={departmentId} classId={classId} className={className} gradeId={gradeId} schoolId={schoolId} gradeName={gradeName} subjectName={subjectName} subjectId={subjectId} />
          </Box>
          ): valueScrollable === '2' ? (
          <Box sx={{mt:5,ml:{xs:-1,sm:-3,md:-3}}}>
            {user_type !== 4 ? (<TeacherListing departmentId={departmentId} schoolId={schoolId} teacherId={user?.teacherId}/>)
             : <TeacherAnalytics />
            //  : <TeacherSubjectListing/>
             }
          </Box>) : 
           user_type !== 4 && <Box sx={{mt:3,ml:{xs:-1,sm:-3,md:-3}}}>
            <ClassAnalyticsListing classId={classId}/>
          </Box>
          }
      </Container>
    </Page>
      
  );
}

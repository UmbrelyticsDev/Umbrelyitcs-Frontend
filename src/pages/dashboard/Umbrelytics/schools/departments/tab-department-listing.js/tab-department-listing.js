import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tab, Tabs, Tooltip, Typography } from '@material-ui/core';
import { PATH_DASHBOARD } from '../../../../../../routes/paths';
import HeaderBreadcrumbs from '../../../../../../components/HeaderBreadcrumbs';
import LogoSchool from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import { Add, Analytics, ArrowBack, Class, Person, School } from '@material-ui/icons';
import Page from 'src/components/Page';
import TeacherListing from '../teachers/listing/teacher-listing';
import TestListingTable from '../test/test-listing-table';
import TeacherSubjectMarksheetView from '../teachers/teacher-subject-view-table/teacher-subject-marksheet-view';
import TeacherSubjectListing from '../teachers/teacher-subject-view-table/teacher-subject-view-table';
import DepartmentListingTable from '../departments-table';
import DepartmentAnalyticsListing from '../department-analytics/department-analytics';
import Logo from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Label from 'src/components/Label';
import SchoolAnalyticsListing from '../../school-analytics';
import { getSchoolId } from '../../DynamicId/dynamicId';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

const user_type = JSON.parse(localStorage.getItem('user_type'));
console.log('user_type', user_type);

const SCROLLABLE_TAB = [
    { value: '1', icon: <Label variant='ghost' color='error' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><School /></Label>, label: 'Department Listing' },
    { value: '2', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'School Analytics' },
  ];

export default function TabDepartmentAnalyticsListing() {
  const [loading, setLoading] = useState(false);
  const valueTabScrollableDepartment = localStorage.getItem('valueTabScrollableDepartment');
  const [valueScrollable, setValueScrollable] = useState(valueTabScrollableDepartment || '1');
  const [singleSchoolData,setSingleSchoolData] =useState({})
  const user = JSON.parse(localStorage.getItem('user'));
  const schoolId = JSON.parse(localStorage.getItem('schoolId'));
  const id = user?.schoolId || schoolId 

  const fetchSchoolById= async()=>{
    await axios.get(`${REST_API_END_POINT}getSchool-details/${id}`)
    .then(res =>{
      if(res.data.status===1){
        console.log(res.data.result,"reeeee")
        setSingleSchoolData(res.data.result)
      }else{
        console.log("not getting data");
        
      }
    }).catch(err =>console.log(err))
  }

  useEffect(()=>{
    fetchSchoolById()
  },[])

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue);
    localStorage.setItem('valueTabScrollableDepartment',newValue)
    
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
    <Page title="Department Listing | Umbrelytics ">
    <Container>
    <Stack direction="row">
      <Avatar alt={singleSchoolData?.school_name} sx={{mt:-0.2}} src={Logo} />
      <Box>
        <Tooltip title={singleSchoolData?.school_name}>
          <Typography variant='h6' sx={{mb:1,mt:1,ml:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>{singleSchoolData?.school_name}</Typography>
        </Tooltip>
      </Box>
    </Stack>
      
      <HeaderBreadcrumbs
        heading="Department Listing"
        links={[
          user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details', href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details', href: PATH_DASHBOARD.general.hodDetails} : user_type === 4 ? { name: 'Teacher Details', href: PATH_DASHBOARD.general.teacherDetails } : { name: 'School Details', href: PATH_DASHBOARD.general.schoolDetails },
          { name: 'Department List' }
        ]}
        action={
            <>
                <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
            </>
        }
      />

        <Tabs
          sx={{mt:-3}}
          allowScrollButtonsMobile
          value={valueScrollable}
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChangeScrollable}
        >
          {SCROLLABLE_TAB.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>
        {valueScrollable === '1' ? (
          <Box sx={{mt:{xs:3,sm:0,md:0},ml:{xs:-1,sm:-3,md:-3}}}>
            <DepartmentListingTable />
          </Box>
          ):
          <Box sx={{mt:3,ml:{xs:-1,sm:-3,md:-3}}}>
            <SchoolAnalyticsListing theSchoolId={user?.schoolId}/>
            {/* <DepartmentAnalyticsListing /> */}
          </Box>
          
          }
      </Container>
    </Page>
      
  );
}

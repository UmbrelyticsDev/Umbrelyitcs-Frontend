import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Container, Grid, Skeleton, Stack, Tab, Tabs, Tooltip, Typography } from '@material-ui/core';
import { PATH_DASHBOARD } from '../../../../../../routes/paths';
import HeaderBreadcrumbs from '../../../../../../components/HeaderBreadcrumbs';
import LogoSchool from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import { Add, Analytics, ArrowBack, Class, ImportContacts, Person, PersonSharp, School } from '@material-ui/icons';
import Maintenance from 'src/pages/Maintenance';
import Page from 'src/components/Page';
import HODListing from '../hod/listing/hod-listing';
import GradeListingTable from '../grades-listing/grade-listing-table';
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import AddGradeForm from '../grades-listing/add-grades/add-grade-form';
import Icon from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import SubjectListingTable from '../subjects/subject-listing-table';
import SubjectAnalytics from '../subject-analytics/subject-analytics';
import Label from 'src/components/Label';
import { useLocation } from 'react-router';
import TeacherListing from '../teachers/listing/teacher-listing';
import DepartmentAnalyticsListing from '../department-analytics/department-analytics';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useQuery } from 'src/utils/queryParams';

const user_type = JSON.parse(localStorage.getItem('user_type'));

const SCROLLABLE_TAB = [
    { value: '1', icon: <Label variant='ghost' color='success' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><ImportContacts /></Label>, label: 'Subject Listing' },
    { value: '2', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Department Analytics'},
    { value: '3', icon: <Label variant='ghost' color='warning' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Person /></Label>, label: 'Teachers Listing'},
    { value: '4', icon: <Label variant='ghost' color='error' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><PersonSharp /></Label>, label: 'HODs Listing' },
  ];

const SCROLLABLE_TAB1 = [
    { value: '1', icon: <Label variant='ghost' color='success' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><ImportContacts /></Label>, label: 'Subject Listing' },
    // { value: '2', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Department Analytics'},
    { value: '3', icon: <Label variant='ghost' color='warning' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Person /></Label>, label: 'Teachers Listing'},
  ];


export default function SubjectInsideDepartments() {
  const location = useLocation();
  const query = useQuery();

  const viewType = location?.state?.viewType || query.get('viewType')
  const user=JSON.parse(localStorage.getItem('user'));
  const departmentId = location?.state?.departmentId || query.get('departmentId')||user.departmentId
  const schoolId = location?.state?.schoolId || query.get('schoolId');
  const [loading, setLoading] = useState(false);
  const valueTabScrollableSubjectListTab = localStorage.getItem('valueTabScrollableSubjectListTab');
  const [valueScrollable, setValueScrollable] = useState(valueTabScrollableSubjectListTab || '1');
  const [data,setData] = useState([])

  const [singleSchoolData,setSingleSchoolData] =useState({})
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'));
  const id = user?.schoolId || schoolId || newSchoolId


console.log("loggggggg",departmentId,schoolId,id);

  const fetchSchoolById= async()=>{
    await axios.get(`${REST_API_END_POINT}getSchool-details/${id}`)
    .then(res =>{
      if(res.data.status===1){
        setSingleSchoolData(res.data.result)
      }else{
        console.log("not getting data");
        setSingleSchoolData(null)
      }
    }).catch(err =>console.log(err))
  }

  useEffect(()=>{
    fetchSchoolById()
  },[])
 
  

  // useEffect(()=>{
  //   axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`)
  //   .then(res =>{
  //     if(res.data.status===1){
  //      console.log("subject list",res.data.result);
  //      setData(res.data.result)
  //     }else{
  //       console.log("not getting data");
  //     }
  //   }).catch(err =>console.log(err))
  //   },[departmentId])
  
  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue);
    localStorage.setItem('valueTabScrollableSubjectListTab',newValue)
    
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
  const [classname, setClass] = useState(false);

  return (
    <Page title="Subject Details | Umbrelytics ">
    <Container>
      <Stack direction="row">
        <Avatar sx={{mt:-0.2}} alt={singleSchoolData?.school_name} src={LogoSchool} />
        <Box>
          <Tooltip title={singleSchoolData?.school_name}>
            <Typography variant='h6' sx={{mt:1,ml:1,mb:1,cursor:'pointer',maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}}>{singleSchoolData?.school_name}</Typography>
          </Tooltip>
        </Box>
      </Stack>
        {user_type !==3 ?(<HeaderBreadcrumbs
          heading={'Subject Listing'}
          links={[
            user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details',href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details',href: PATH_DASHBOARD.general.hodDetails} : { name: 'Teacher Details',href: PATH_DASHBOARD.general.teacherDetails},
            { name: 'Department Listing', href: PATH_DASHBOARD.general.department, state: { viewType: viewType, departmentId: departmentId, schoolId: schoolId } },
            { name: 'Subject Listing' }
          ]}
          // action={
          //   <>
          //     {/* {user_type !== 3 && user_type !== 4 &&(<Box sx={{display:'flex',justifyContent:'flex-end'}}>
          //       <Button
          //           variant="contained"
          //           sx={{color:'#fff',mb:4}} color='success' 
          //           onClick={() => setClass(true)}
          //           startIcon={<Icon icon={plusFill} />}
          //         >
          //           Add Class
          //       </Button>
          //     </Box>)} */}
          //       <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
          //   </>
          // }
        />): <HeaderBreadcrumbs
        heading={'Subject Listing'}
        links={[
          user_type === 1 ? { name: 'School Listing', href: PATH_DASHBOARD.general.schools } : user_type === 2 ? { name: 'School Details',href: PATH_DASHBOARD.general.schoolDetails} : user_type === 3 ? { name: 'HOD Details',href: PATH_DASHBOARD.general.hodDetails} : { name: 'Teacher Details',href: PATH_DASHBOARD.general.teacherDetails},
          { name: 'Subject Listing' }
        ]}
        // action={
        //   <>
        //     {/* {user_type !== 3 && user_type !== 4 &&(<Box sx={{display:'flex',justifyContent:'flex-end'}}>
        //       <Button
        //           variant="contained"
        //           sx={{color:'#fff',mb:4}} color='success' 
        //           onClick={() => setClass(true)}
        //           startIcon={<Icon icon={plusFill} />}
        //         >
        //           Add Class
        //       </Button>
        //     </Box>)} */}
        //       <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
        //   </>
        // }
      />}
        
        {/* <Modal
            open={classname}
            handleClose={() => {
                setClass(false);
            }}
            modalTitle={'Add Class'}> 

            <AddGradeForm classname={classname} setClass={setClass}/>
            
        </Modal> */}

          {/* <Box sx={{mt:{xs:4,sm:0,md:0},ml:{xs:-1,sm:-3,md:-3}}}>
            <GradeListingTable />
          </Box> */}
          <Tabs
          sx={{mt:-3}}
          value={valueScrollable}
          allowScrollButtonsMobile
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
          {user_type === 3 && SCROLLABLE_TAB1.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>
        {valueScrollable === '1' ? (
           <Box sx={{mt:{xs:4,sm:4,md:0},ml:{xs:-1,sm:-3,md:-3}}}>
              <SubjectListingTable view_Type={viewType} department_Id={departmentId} school_Id={schoolId} />
            </Box>
          ) : valueScrollable === '2' ? <Box sx={{mt:{xs:4,sm:4,md:0},ml:{xs:-1,sm:-3,md:-3}}}>
           <DepartmentAnalyticsListing  departmentId={departmentId}/>
           {/* <SubjectAnalytics /> */}
          </Box> : valueScrollable === '4' ? <HODListing deptId={departmentId} schoolid={schoolId}/> :
           user_type !==4 &&(<Box sx={{mt:{xs:9,sm:4,md:user_type == 4},ml:{xs:-1,sm:-3,md:-3}}}>
            <TeacherListing  departmentId={departmentId} schoolId={schoolId}/>
          </Box>)
          }
      </Container>
    </Page>
      
  );
}

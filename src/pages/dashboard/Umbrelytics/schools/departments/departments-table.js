import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Divider,
  Box,
  Link,
  Tooltip,
  Paper,
  MenuItem,
  Popover,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import DepartmentTableToolbar from './department-table-toolbar';
import { UserListHead } from 'src/components/_dashboard/user/list';
import DepartmentTableMenu from './department-table-menu';
import SearchNotFound from 'src/components/SearchNotFound';
import Label from 'src/components/Label';
import Scrollbar from 'src/components/Scrollbar';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import Page from 'src/components/Page';
import { styled } from '@material-ui/styles';
import { PATH_DASHBOARD } from 'src/routes/paths';
import Folder from '../../../../../../src/images/folder.png'
import { ProductListHead } from 'src/components/_dashboard/e-commerce/product-list';
import { fDate } from 'src/utils/formatTime';
import { MIconButton, MLinearProgress } from 'src/components/@material-extend';
import { Analytics, CloseRounded, Person, School, ViewList, ViewModule } from '@material-ui/icons';
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import AddDepartmentForm from './add-department/add-department-form';
import Logo from '../../../../../../src/images/jamaica-high-school-logo.jpg'
import DepartmentGrid from './department-grid/department-grid';
import { logDOM } from '@testing-library/react';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useSnackbar } from 'notistack';
import { setSchoolId } from '../DynamicId/dynamicId';
import LoadingScreen from 'src/components/LoadingScreen';
import MUltiDeleteConfirmationPopUp from './MultiDeleteConfirmationPopUp';

const user_type = JSON.parse(localStorage.getItem('user_type'));
console.log('user_type', user_type);

const style = {
    p: 4,
    minHeight: 160,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    mt:{xs:13,sm:33,md:12,lg:12},
  };

  const CustomToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
    color: 'text.disabled',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor:'#daedff'
    },
  }));

const TABLE_HEAD = [
  { id: 'name', label: 'Department Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'createdon', label: 'Created On', alignRight: false },
  { id: 'submenus', label: 'Sub Menus', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
]
const TABLE_HEAD1 = [
  { id: 'name', label: 'Department Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'createdon', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
]

const ThumbImgStyle = styled('img')(({ theme }) => ({
    width: 36,
    height: 36,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadiusSm
  }));

// ----------------------------------------------------------------------

const SCROLLABLE_TAB = [
  { value: '1', icon: <School />, label: 'Departments' },
  { value: '2', icon: <Analytics />, label: 'Analytics' },
];

export default function DepartmentListingTable() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('departmentName');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [valueScrollable, setValueScrollable] = useState('1');
  const [data,setData] = useState([])
  const { enqueueSnackbar } = useSnackbar();
  const [refresh,setRefresh] = useState(false)
  const [department, setDepartement] = useState(false);
  const [subMenu, SetSubMenu] = useState(null);
  const [tempEditId, setTempEditId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [deptLimit,setDeptLimit] = useState(false)
  const [isLoading,setIsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState([]); 

  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'));
  const schoolId = location.state?.schoolId || user?.schoolId || newSchoolId;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

 

  

// useEffect(()=>{
//   fetchDepartmentById()
//   setSchoolId(schoolId);
//   },[refresh,department,schoolId])

useEffect(()=>{
  fetchDepartmentById()
  setSchoolId(schoolId);
  },[refresh,schoolId])

const fetchDepartmentById= async()=>{
  setIsLoading(true);  
 await axios.get(`${REST_API_END_POINT}get-all-departments/${schoolId}`)
.then(res=>{
 if(res.data.status===1){
  console.log("dataaaaaaaaaa",res.data.result);
  setData(res.data.result)
  setTimeout(() => {
    setIsLoading(false);  
  }, 2000); 
 }else{
  console.log("not getting data");
  setData([])
 }
}).catch(err =>console.log(err))
  }

  useEffect(()=>{
    fetchSchoolDataById()
  },[data])
  const fetchSchoolDataById=async()=>{
    await axios.get(`${REST_API_END_POINT}getSchool-details/${schoolId}`)
    .then(res =>{
      if(res.data.status===1){
        console.log('responseeeeeeeeeeeee',res.data.result);
        console.log('responseeeeeeeeeeeee',data.length);
        if(data.length >= res.data.result?.no_of_dept) {
          setDeptLimit(true)
        }else {
          setDeptLimit(false);
        }
        
      }else{
        console.log('not getting data');
        
      }
    }).catch(err =>console.log(err))
  }

  // useEffect(()=>{
  //   axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`)
  //   .then(res =>{
  //     if(res.data.status===1){
  //      console.log("subject",res.data.result);
  //      setData(res.data.result)
  //     }else{
  //       console.log("not getting data");
  //     }
  //   }).catch(err =>console.log(err))
  //   },[departmentId])

    const goToAddHOD=async ()=>{
    axios.get(`${REST_API_END_POINT}get-subject/${selectedDepartmentId}`)
    .then(res =>{
      if(res.data.status===1){
        const statusOneData = res.data.result.filter(value => value.status === 1);
       console.log("subjectsubjectsubject",statusOneData);
       if(statusOneData.length > 0){
        navigate(PATH_DASHBOARD.general.hodListingSubmenu,{ state: { departmentId:selectedDepartmentId ,schoolId:schoolId} })
       }else{
        enqueueSnackbar(`Add atleast one active subject`, { variant: 'error' });
       }

      }else{
        console.log("not getting data");
      }
    }).catch(err =>console.log(err))
     
    }


  const handleDeleteDept= async(id,multi)=>{
    await axios.delete(`${REST_API_END_POINT}delete-departments/${id}`)
    .then(res => {
      if(res.data.status===1){
        if(!multi){
        enqueueSnackbar(`Department Deleted Successfully`, { variant: 'success' });
      }
        setRefresh(!refresh)
      }else{
        enqueueSnackbar(`Department Not Deleted`, { variant: 'error' });
      }
    }).catch(err =>console.log(err))
  }

  const handleMultiDelete = async () => {
    try {
      // Use Promise.all to wait for all delete operations to complete
      const deletePromises = selectedIds.map((id) => handleDeleteDept(id,1));
      await Promise.all(deletePromises);
  
      enqueueSnackbar('All selected items are deleted successfully', { variant: 'success' });
  
      setRefresh(!refresh); 
      setSelectedIds([]); 
      setOpen(false)
      setSelected([])
    } catch (err) {
      console.error('Error in multi-delete:', err);
      enqueueSnackbar('Failed to delete some or all selected departments.', { variant: 'error' });
    }
  };

  const handleActiveDept=async(id,status)=>{
   if(status===1) {
    await axios.put(`${REST_API_END_POINT}update-departments-status/${id}`,{status:0})
    .then(res =>{
         if(res.data.status===1){
          enqueueSnackbar(`Department Deactivated Successfully`, { variant: 'success' });
          setRefresh(!refresh)
         }else{
          enqueueSnackbar(`Department Deactivation Failed`, { variant: 'error' });
         }
    }).catch(err =>console.log(err))
   }else{
    await axios.put(`${REST_API_END_POINT}update-departments-status/${id}`,{status:1})
    .then(res =>{
         if(res.data.status===1){
          enqueueSnackbar(`Department Activate Successfully`, { variant: 'success' });
          setRefresh(!refresh)
         }else{
          enqueueSnackbar(`Department Activation Failed`, { variant: 'error' });
         }
    }).catch(err =>console.log(err))
   }
    
  }

  const handleEditDept=async(id,status)=>{
    if(status===0){
      enqueueSnackbar(`Department is inactive`, { variant: 'warning' });
      return
    }
    setTempEditId(id)
    setDepartement(true);
  }

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue);
  };



  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((user) => user.departmentName);
      const newSelectedIds = data.map((row) => row.id); // Capture all IDs
      setSelected(newSelecteds);
      setSelectedIds(newSelectedIds);
    } else {
      setSelected([]);
      setSelectedIds([]); 
    }
  };

  const handleClick = (event, departmentName,id) => {
    const selectedIndex = selected.indexOf(departmentName);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, departmentName];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1)
      ];
    }
    setSelected(newSelected);
   
       // Handle ID selection
       const idIndex = selectedIds.indexOf(id);
       let newSelectedIds = [];
   
       if (idIndex === -1) {
         newSelectedIds = [...selectedIds, id];
       } else {
         newSelectedIds = [
           ...selectedIds.slice(0, idIndex),
           ...selectedIds.slice(idIndex + 1),
         ];
       }
       setSelectedIds(newSelectedIds);
  
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const filteredUsers = data.filter(user =>
    user.departmentName.toLowerCase().includes(filterName.toLowerCase())
  );

  const isUserNotFound = filteredUsers.length === 0;



  const handleOpenSubMenu = (event,id) => {
    SetSubMenu(event.currentTarget);
    setSelectedDepartmentId(id);
  };

  const handleCloseSubMenu = () => {
    SetSubMenu(null);
    setSelectedDepartmentId(null);
  };
  const viewType = localStorage.getItem('viewType');
  const [view, setView] = useState(viewType || 'list');
  const handleChange = (event, nextView) => {
    console.log('viewType--nextView',nextView);
    if (nextView !== null) {
      setView(nextView);
      localStorage.setItem('viewType',nextView)
    }
  };


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
    <Page title="Department Listing | Umbrelytics ">
      <Container>
        { valueScrollable === '1' && (
          <Stack sx={{color:'#fff',mt:{xs:3.5,sm:3.5,md:3},mb:{xs:3,sm:3,md:0},gap:2,display:'flex',justifyContent:'flex-end'}} direction={{ xs: 'column', sm: 'row', md: 'row' }}>
            <ToggleButtonGroup
             size='small'
             sx={{pr:user_type === 3 ? {xs:3,sm:0,md:0} : user_type === 4 ? {xs:3,sm:0,md:0} : 0,display:'flex',justifyContent:'flex-end' }}
              orientation="horizontal"
              value={view}
              exclusive
              onChange={handleChange}
            >
            <CustomToggleButton value="list" selected={view === 'list'}>
              <ViewList />
            </CustomToggleButton>
            <CustomToggleButton value="module" selected={view === 'module'}>
              <ViewModule />
            </CustomToggleButton>
          </ToggleButtonGroup>
            {/* {user_type !== 4 &&  user_type !== 3 &&(<Button
              variant="outlined"
              color='success'
              onClick={() => navigate(PATH_DASHBOARD.general.hodListingSubmenu)}
              startIcon={<Icon icon={plusFill} />}
            >
              Add HOD
            </Button>)} */}
            {user_type !== 4 &&  user_type !== 3 &&(<Button
              variant="contained"
              // disabled
              color='success'
              sx={{boxShadow:'none',color:'#fff'}}
              onClick={() => {
                setDepartement(true)
                setTempEditId(null)
              }}
              startIcon={<Icon icon={plusFill} />}
              disabled={deptLimit}
            >
              Add Department
            </Button>)}
          </Stack>
        )}
        {/* <Stack sx={{color:'#fff',mt:{xs:3.5,sm:3.5,md:3},display:'flex',justifyContent:'flex-end'}} direction={{ xs: 'row', sm: 'row', md: 'row' }}>
            <ToggleButtonGroup
            orientation="horizontal"
            value={view}
            exclusive
            onChange={handleChange}
          >
            <CustomToggleButton value="list" selected={view === 'list'}>
              <ViewList />
            </CustomToggleButton>
            <CustomToggleButton value="module" selected={view === 'module'}>
              <ViewModule />
            </CustomToggleButton>
          </ToggleButtonGroup>
          </Stack> */}
         
        <Modal
            open={department}
            handleClose={() => {
                setDepartement(false);
            }}
            modalTitle={tempEditId? 'Edit Department':'Add Department'}> 

            <AddDepartmentForm department={department} setDepartement={setDepartement} schoolId={schoolId} id={tempEditId}/>
            
        </Modal>
        {loading ? (<Paper sx={style}>
              <Box sx={{ width: '100%' }}>
                <MLinearProgress color="inherit" />
                <MLinearProgress sx={{mt:2}} color="warning" />
                <MLinearProgress sx={{mt:2}} color="success" />
                <MLinearProgress sx={{mt:2}} color="inherit" />
              </Box>
            </Paper>) : <>
        {view === 'list' ? (<Card sx={{mt:user_type === 3 ? 3 : user_type === 4 ? 3 : 3}}>
        <DepartmentTableToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} handleClickOpen={handleClickOpen}/>

        <MUltiDeleteConfirmationPopUp  open={open} setOpen={setOpen} handleMultiDelete={handleMultiDelete}/>

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800,whiteSpace:'nowrap' }}>
              <Table size={user_type === 3 ? 'medium' : user_type === 4 ? 'medium' : 'small'}>
                <ProductListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={user_type === 3 ? TABLE_HEAD1 : user_type === 4 ? TABLE_HEAD1 : TABLE_HEAD}
                  rowCount={data.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, departmentName, createdOn, status, createdBy, verified } = row;
                    const isItemSelected = selected.indexOf(departmentName) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                        sx={{ borderBottom: '1.5px solid #e6e6e6' }}
                      >
                        {user_type !==3 && user_type !==4 &&(<TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, departmentName,id)} />
                        </TableCell>)}
                          <TableCell component="th" scope="row" padding="none">
                              <Stack direction="row" alignItems="center" sx={{ml: user_type !== 3 && user_type !== 4 && -1}}>
                               <ThumbImgStyle alt={departmentName} src={Folder} />
                               <Tooltip title={departmentName}>
                                <Link variant="subtitle2" onClick={() => {
                                  if(status===0){
                                    enqueueSnackbar(`Department is inactive`, { variant: 'warning' });
                                    return
                                  }
                                  navigate(PATH_DASHBOARD.general.Departmentsubjects,{state:{viewType:view,departmentId:id ,schoolId:schoolId}})} 
                                }sx={{mt:0.3,ml:1,cursor:'pointer',maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                                 {departmentName}
                                </Link>
                               </Tooltip>
                              </Stack>
                           </TableCell>
                           <Tooltip title={createdBy}>
                            <TableCell align="left"><Typography sx={{ml:user_type === 3 ? -1 : user_type === 4 ? -1 : -0.3,maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} variant="subtitle2">{createdBy}</Typography></TableCell>
                           </Tooltip>
                          <TableCell align="left"><Typography variant="subtitle2" sx={{ml:-0.3}}>{createdOn}</Typography></TableCell>
                           {user_type !== 3 && user_type !== 4 && (<TableCell align="left"><Button className='css-rl7xow-MuiButtonBase-root-MuiButton-root1' sx={{boxShadow:'none',ml:0.1}} onClick={(event)=>handleOpenSubMenu(event,id)} size='small' variant="contained">Sub Menu</Button></TableCell>)}
                           <TableCell align="left">
                             <Label
                              variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                              color={(status === 0?  'error' :'success') || 'success'}
                            >
                              {status===1? "Active" :"inactive"}
                            </Label>
                          </TableCell>
                          {user_type !== 3 && user_type !== 4 &&(<TableCell align="left">
                        <DepartmentTableMenu onDelete={() => handleDeleteDept(id)} userName={departmentName} onActive={()=>handleActiveDept(id,status)} onEdit={()=>handleEditDept(id,status)} status={status} />
                        </TableCell>)}
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6}>
                        <Box sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterName} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>) : <Box sx={{mt:{xs:2,sm:0,md:-2}}}><DepartmentGrid staticUserList={filteredUsers} view={view} schoolId={schoolId} setDepartement={setDepartement} setTempEditId={setTempEditId}/></Box>}
        </>}
        <Popover 
        open={!!subMenu}
        anchorEl={subMenu}
        onClose={() => SetSubMenu(null)}
        anchorOrigin={{ vertical: 1270, horizontal: 40 }}
        transformOrigin={{ vertical: 1275, horizontal: 230 }}
        PaperProps={{
          sx: { width: 190 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1, pt: 1,}}>
          <Typography variant='subtitle1' sx={{fontWeight:'bold',ml:2,}}>
             Sub Menus
          </Typography>
          <MIconButton size="small" onClick={handleCloseSubMenu}>
            <CloseRounded  sx={{color:'#0f171e'}} />
          </MIconButton>
        </Box>
        <Box sx={{mb:1,mt:-0.5}}>
            <MenuItem sx={{mt:-0.5}} onClick={() => navigate(PATH_DASHBOARD.general.subjects,{ state: { departmentId:selectedDepartmentId ,schoolId:schoolId} })}>
              <Stack className='ic--twotone-menu-book' sx={{ mr: 1,mt:-0.3,ml:0.2,fontSize:'1.3rem' }} />
              Add Subjects
            </MenuItem>
            <MenuItem onClick={goToAddHOD} sx={{mt:-0.5}}>
              <Person sx={{ mr: 1,mt:-0.3 }} />
              Add HODs
            </MenuItem>
        </Box>
      </Popover>
      </Container>
    </Page>
  );
}

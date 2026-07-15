import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import {
  Box,
  Card,
  Table,
  Button,
  TableRow,
  Checkbox,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Tooltip,
  Stack,
  Link,
  Avatar,
  CircularProgress,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Popover,
  MenuItem
} from '@material-ui/core';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import { fDate } from 'src/utils/formatTime';
import { fCurrency } from 'src/utils/formatNumber';
import { ProductListHead } from 'src/components/_dashboard/e-commerce/product-list';
import GradeIcon from '../../../../../../../src/images/grade-icon.png'
import Label from 'src/components/Label';
import { sentenceCase } from 'change-case';
import { useTheme } from '@emotion/react';
import Page from 'src/components/Page';
import { PATH_DASHBOARD } from 'src/routes/paths';
import Logo from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import GradeListingToolbar from './grade-listing-toolbar';
import GradeListingMenu from './grade-listing-menu';
import Scrollbar from 'src/components/Scrollbar';
import AddGradeForm from './add-grades/add-grade-form';
import { MIconButton, MLinearProgress } from 'src/components/@material-extend';
import { CloseRounded, Person, ViewList, ViewModule } from '@material-ui/icons';
import ClassGrid from './class-grid/class-grid';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useSnackbar } from 'notistack';
import useAuth from 'src/hooks/useAuth';
import MUltiDeleteConfirmationPopUp from '../MultiDeleteConfirmationPopUp';

// ----------------------------------------------------------------------
const user_type = JSON.parse(localStorage.getItem('user_type'));
console.log('user_type', user_type);

const style = {
    p: 4,
    minHeight: 160,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    mt:{xs:10,sm:20,md:10,lg:10},
  };

const TABLE_HEAD = [
  { id: 'name', label: 'Class Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'teacher', label: 'Assigned Educators', alignRight: false },
  { id: 'createdon', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
];

const TABLE_HEAD1 = [
  { id: 'name', label: 'Class Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'teacher', label: 'Teachers', alignRight: false },
  { id: 'createdon', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
];
const TABLE_HEAD2 = [
  { id: 'name', label: 'Class Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'createdon', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
];
const Teachers = [
  { id: 1, teachers: 'Michel Cambell', },
  { id: 2, teachers: 'Andre Thompson', },
  { id: 3, teachers: 'Aisha James',  },
];

const ThumbImgStyle = styled('img')(({ theme }) => ({
    width: 36,
    height: 36,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadiusSm
  }));

  const CustomToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
    color: 'text.disabled',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor:'#daedff'
    },
  }));



export default function GradeListingTable({ teacherId,subject_Name,grade_Name, subject_Id, school_Id, department_Id, grade_Id }) {
  const theme = useTheme();
  const {user} = useAuth()
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('name');
  const viewType = localStorage.getItem('viewType');
  const location = useLocation()
  const schoolId = location.state?.schoolId || school_Id
  const departmentId = user.departmentId || location?.state?.departmentId || department_Id
  const subjectId = location?.state?.subjectId || subject_Id
  const gradeId = location?.state?.gradeId || grade_Id
  const gradeName = location?.state?.gradeName || grade_Name
  const subjectName = location?.state?.subjectName || subject_Name
  const [data,setData] = useState([])
  const [teachers,setTeachers] = useState([])
  const [hodData,setHodData] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState([]);
  const [selectedHod, setSelectedHod] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [refresh,setRefresh] = useState(false)
  const [tempEditId,setTempEditId] =useState(null)
  const [classname, setClass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  useEffect(()=>{
    if(user?.teacherId){
      fetchClassDatasByTeacherId()
    }
    if(gradeId){
      fetchClassByGrade()
    }
    if(departmentId){
      fetchTeacherByDeptId()
    }
  },[gradeId,departmentId,refresh,user?.teacherId])
 
  const fetchClassDatasByTeacherId=()=>{
    axios.post(`${REST_API_END_POINT}class/get-class-by-teacher-id`,{
      teacherId:user?.teacherId
    })
    .then((res)=>{
      if(res.data.status===1){
        setData(res.data.data)
       
      }
    })
    .catch((err)=>{
      console.log(err)
    })
  }
  const fetchClassByGrade = async()=>{
    await axios.get(`${REST_API_END_POINT}get-class-by-grade/${gradeId}`)
    .then(res =>{
      if(res.data.status ===1) {
        setData(res.data.result)
        console.log('dddddddddddddddddddddddddd',res.data.result)
      }else{
        console.log("not getting data");
        setData([])
      }
    }).catch(err =>console.log(err))
  }
    
  // const fetchTeacherByDeptId = async ()=>{
  //   console.log(departmentId,'dataaaaaaaaaaaaaaa');
    
  //   await axios.get(`${REST_API_END_POINT}get-teacher/${departmentId}`)
  //   .then(res =>{
  //     if(res.data.status) {
  //       setTeachers(res.data.result)
  //       console.log("dataaaaaaaaaaaaaaa",res.data.result)
  //     }else{
  //       setTeachers([])
  //     }
  //   }).catch(err =>console.log(err))
  // }

  const fetchTeacherByDeptId = async ()=>{
    console.log(departmentId,'dataaaaaaaaaaaaaaa');
    
    await axios.get(`${REST_API_END_POINT}class/get-all-hod-teacher-by-deptid/${departmentId}`)
    .then(res =>{
      if(res.data.status) {
        setTeachers(res.data.teacherData)
        setHodData(res.data.hodData)
        console.log('setTeacherssetTeachers',res.data.teacherData)
        console.log('setTeacherssetTeachers hodData',res.data.hodData)
      }else{
        setTeachers([])
      }
    }).catch(err =>console.log(err))
  }

  const handleActivate= async(id,status)=>{
  await axios.put(`${REST_API_END_POINT}update-class-status/${id}`,{status:status===1?0:1})
  .then(res =>{
    if(res.data.status===1) {
      enqueueSnackbar(`Class ${status===1? "Deactivated" :"Activated"} Successfully`, { variant: 'success' });
      setRefresh(!refresh)
      // window.location.reload()
    }else{
      enqueueSnackbar(`Class ${status===1? "Deactivation" :"Activation"} failed`, { variant: 'error' });

    }
  })
  }

  const handleDelete = async(id,multi)=>{
    await axios.delete(`${REST_API_END_POINT}delete-class/${id}`)
    .then(res => {
      if(res.data.status===1) {
        if(!multi){

          enqueueSnackbar('Class Deleted Successfully', { variant: 'success' });
        }
        setRefresh(!refresh)
        // window.location.reload()
      }else{
        enqueueSnackbar('Class Not Deleted', { variant: 'error' });
    
      }
    }).catch(err =>console.log(err))
  }

  const handleMultiDelete = async () => {
    try {
      // Use Promise.all to wait for all delete operations to complete
      const deletePromises = selectedIds.map((id) => handleDelete(id,1));
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

  const handleEditPageOpen= (id,status)=>{
    if(status===0) return enqueueSnackbar('Class is Inactive', { variant: 'error' });
    setTempEditId(id)
    setClass(true)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelectedIds = data.map((row) => row.id); 
      const newSelecteds = data?.map((n) => n.name);
      setSelected(newSelecteds);
      setSelectedIds(newSelectedIds);

      return;
    }else {
      setSelected([]);
      setSelectedIds([]); 
    }
  };

  // const handleClick = (event, name) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [];
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, name);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  //   }
  //   setSelected(newSelected);
  // };


  const handleClick = (event, name,id) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
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

  const handleDeleteProduct = (productId) => {
    // Handle delete action
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data?.length) : 0;

  const filteredProducts = data?.filter((product) =>
    product.name.toLowerCase().includes(filterName.toLowerCase())
  );

  const [subMenu, SetSubMenu] = useState(null);

  // const handleOpenSubMenu = (event,teacherId) => {
  //   console.log("teacherId",teacherId);
  //   SetSubMenu(event.currentTarget);
  // };


  const handleOpenSubMenu = (event, teacherId,hodId) => {
    const teacherIdsArray = teacherId.split(',').map(id => parseInt(id.trim()));
    const hodIdsArray = hodId.split(',').map(id => parseInt(id.trim()));
  
    const selectedTeachers = teachers.filter(teacher => teacherIdsArray.includes(teacher.id));
    const selectedHods = hodData.filter(hod => hodIdsArray.includes(hod.id));
  
    if (selectedTeachers.length > 0 || selectedHods.length > 0) {
      setSelectedTeacher(selectedTeachers);
      setSelectedHod(selectedHods);
    } else {
      setSelectedTeacher([]);
      setSelectedHod([])
    }
    SetSubMenu(event.currentTarget);
  };

  const handleCloseSubMenu = () => {
    SetSubMenu(null);
  };

  const isProductNotFound = filteredProducts.length === 0;

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);

  const [view, setView] = useState(viewType || 'list');
  const handleChange = (event, nextView) => {
    if (nextView !== null) {
      setView(nextView);
      localStorage.setItem('viewType',nextView);
    }
  };
  return (
    <Page title="Class Listing | Umbrelytics">
    <Container sx={{mt: user_type === 3 ? 4 : user_type === 4 ? 4 : 0}}>
        {loading ? (
        <Grid>
            <Paper sx={style}>
              <Box sx={{ width: '100%' }}>
                <MLinearProgress color='inherit' />
                <MLinearProgress color='warning' sx={{mt:2}} />
                <MLinearProgress color='success' sx={{mt:2,}} />
                <MLinearProgress color='inherit' sx={{mt:2,}} />
              </Box>
            </Paper>
          </Grid>) : <>
          {/* <Stack sx={{color:'#fff',mt:{xs:3.5,sm:3.5,md:3},display:'flex',justifyContent:'flex-end',mb:user_type !== 3 && user_type !== 4 && 3}} direction={{ xs: 'row', sm: 'row', md: 'row' }}>
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
        <Stack sx={{ display: 'flex', justifyContent: 'flex-end',mb:user_type !== 3 && user_type !== 4 && 3 }} direction={{ xs: 'row', sm: 'row', md: 'row' }}  spacing={1}>
        <ToggleButtonGroup
          size='small'
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
          {user_type !== 3 && user_type !== 4 &&(<Button
              variant="contained"
              sx={{color:'#fff',mb:4}} color='success' 
              onClick={() => {
                setTempEditId(null)
                setClass(true)}}
              startIcon={<Icon icon={plusFill} />}
            >
              Add Class
          </Button>)}
        </Stack>
        <Modal
            open={classname}
            handleClose={() => {
                setClass(false);
            }}
            modalTitle={`${tempEditId? 'Update' : 'Add'} Class`}>
            <AddGradeForm classname={classname} setClass={setClass} departmentId={departmentId} gradeId={gradeId} schoolId={schoolId} tempEditId={tempEditId}/>
        </Modal>
         {view === 'list' ?( <Card sx={{mt:2}}>
        <GradeListingToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName}  handleClickOpen={handleClickOpen}/>
        <MUltiDeleteConfirmationPopUp  open={open} setOpen={setOpen} handleMultiDelete={handleMultiDelete}/>
        <Scrollbar>
        <TableContainer sx={{ minWidth: 800,whiteSpace:'nowrap', }}>
          <Table size={user_type === 3 ? 'medium' : user_type === 4 ? 'medium' : 'small'}>
            <ProductListHead
              order={order}
              orderBy={orderBy}
              headLabel={user_type === 3 ? TABLE_HEAD1 : user_type === 4 ? TABLE_HEAD2 : TABLE_HEAD}
              rowCount={data?.length}
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
            />
            <TableBody>
              {filteredProducts?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                const { id, name, cover, createdBy, createdOn, inventoryType ,status,teacherId,hodId} = row;

                const isItemSelected = selected.indexOf(name) !== -1;

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
                    {user_type !== 3 && user_type !== 4 && (<TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, name,id)} />
                    </TableCell>)}
                    <TableCell component="th" scope="row" padding="none">
                      <Stack direction="row" alignItems="center" sx={{ml:user_type !== 3 && user_type !== 4 && -1}}>
                        <ThumbImgStyle alt={name} src={GradeIcon} />
                        <Tooltip title={name}>
                         <Link variant="subtitle2" onClick={() => {
                          if(status===0) return enqueueSnackbar('Class is Inactive', { variant: 'error' });
                          navigate(PATH_DASHBOARD.general.gradedetails,{ state: { classId:id ,departmentId:departmentId, gradeId:gradeId, schoolId:schoolId,className:name, gradeName:gradeName, subjectName:subjectName, subjectId:subjectId} })} 
                         }sx={{mt:0.3,ml:1,maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',cursor:'pointer'}} noWrap>
                          {name}
                         </Link>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="left">
                        <Tooltip title={createdBy}>
                            <Typography variant="subtitle2" sx={{ml:user_type === 3 ? -1 : user_type === 4 ? -1 : 0,maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                                {createdBy}
                            </Typography>
                        </Tooltip>
                    </TableCell>
                    {user_type !== 4 && (<TableCell align="left"><Button className='css-rl7xow-MuiButtonBase-root-MuiButton-root1' sx={{boxShadow:'none',ml:0.1}} onClick={(event)=>handleOpenSubMenu(event,teacherId,hodId)} size='small' variant="contained">Teachers /  Hod</Button></TableCell>)}
                    <TableCell align="left">
                        <Typography variant="subtitle2" sx={{ml:-0.2}}>
                            {createdOn}
                        </Typography></TableCell>
                    <TableCell align="left">
                    <Label
                    sx={{ml:-0.3}}
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={(status === 0 && 'error') || 'success'}
                    >
                      {status === 1 ? "Active" : "Inactive"}
                    </Label>
                    </TableCell>
                    {user_type !==3 && user_type !==4 &&(<TableCell align="left">
                      <GradeListingMenu onDelete={() => handleDeleteProduct(id)} productName={name} status={status} onActive={()=>handleActivate(id,status)} handleDelete={()=>handleDelete(id)} handleEditPageOpen={()=>handleEditPageOpen(id,status)}/>
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
            {isProductNotFound && (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={6}>
                    <Box sx={{ py: 3 }}>
                      Data not found.
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <Popover 
          open={!!subMenu}
          anchorEl={subMenu}
          onClose={ ()=>SetSubMenu(null) }
          anchorOrigin={{ vertical: 1270, horizontal: 40 }}
          transformOrigin={{ vertical: 1275, horizontal: 230 }}
          PaperProps={{
            sx: { width: 190 },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1, pt: 1,}}>
            <Typography variant='subtitle1' sx={{fontWeight:'bold',ml:2,}}>
               Teachers
            </Typography>
            <MIconButton size="small" onClick={handleCloseSubMenu}>
              <CloseRounded  sx={{color:'#0f171e'}} />
            </MIconButton>
          </Box>
          <Box sx={{mb:1,mt:0.5}}>
              {selectedTeacher?.map((names,index) => (<MenuItem key={index} sx={{mt:-0.5}}>
                <Person sx={{ mr: 1,mt:-0.3,fontSize:'1.3rem' }} />
                {names?.name}
              </MenuItem>))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 1, pt: 1,}}>
            <Typography variant='subtitle1' sx={{fontWeight:'bold',ml:2,}}>
               HOD
            </Typography>
          </Box>
          <Box sx={{mb:1,mt:0.5}}>
              {selectedHod?.map((names,index) => (<MenuItem key={index} sx={{mt:-0.5}}>
                <Person sx={{ mr: 1,mt:-0.3,fontSize:'1.3rem' }} />
                {names?.name}
              </MenuItem>))}
          </Box>
        </Popover>
        </Scrollbar>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>) : <Box sx={{mt:{xs:2,sm:0,md:-2}}}><ClassGrid staticProducts={filteredProducts} departmentId={departmentId} gradeId={gradeId} schoolId={schoolId} gradeName={gradeName} subjectName={subjectName} subjectId={subjectId} refresh={refresh} setRefresh={setRefresh} handleActivate={handleActivate} handleDelete={handleDelete} handleEditPageOpen={handleEditPageOpen} /></Box>}
      </> }
      
    </Container>
    </Page>
  );
}

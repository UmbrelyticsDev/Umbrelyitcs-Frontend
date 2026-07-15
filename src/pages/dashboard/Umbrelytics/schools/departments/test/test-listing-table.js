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
  ToggleButtonGroup,
  ToggleButton
} from '@material-ui/core';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import { fDate } from 'src/utils/formatTime';
import { fCurrency } from 'src/utils/formatNumber';
import { ProductListHead } from 'src/components/_dashboard/e-commerce/product-list';
import Excelicon from '../../../../../../../src/images/xlsx-png.png'
import Label from 'src/components/Label';
import { sentenceCase } from 'change-case';
import { useTheme } from '@emotion/react';
import Page from 'src/components/Page';
import { PATH_DASHBOARD } from 'src/routes/paths';
import Scrollbar from 'src/components/Scrollbar';
import TestListingToolbar from './test-listing-toolbar';
import TestListingMenu from './test-listing-menu';
import { MLinearProgress } from 'src/components/@material-extend';
import Modal from 'src/components/_dashboard/Model/ProjectModel';
import AddTestForm from './add-test/add-test-form';
import TestListingHead from './test-listing-head';
import { ViewList, ViewModule } from '@material-ui/icons';
import TestGrid from './test-grid/test-grid';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import { useSnackbar } from 'notistack';
import useAuth from 'src/hooks/useAuth';
import MUltiDeleteConfirmationPopUp from '../MultiDeleteConfirmationPopUp';

// ----------------------------------------------------------------------

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 10, sm: 27, md: 10, lg: 10 },
};

const TABLE_HEAD = [
  { id: 'name', label: 'Test Name', alignRight: false },
  { id: 'teacherName', label: 'Teacher Name', alignRight: false },
  { id: 'createdBy', label: 'Created By', alignRight: false },
  { id: 'typeoftest', label: 'Type Of Test', alignRight: false },
  // { id: 'assignedto', label: 'Subject Assigned To', alignRight: false },
  { id: 'marksheetStatus', label: 'Marksheet Status', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
];
const TABLE_HEAD1 = [
  { id: 'name', label: 'Test Name', alignRight: false },
  { id: 'createdBy', label: 'Created By', alignRight: false },
  { id: 'typeoftest', label: 'Type Of Test', alignRight: false },
  // { id: 'assignedto', label: 'Subject Assigned To', alignRight: false },
  { id: 'marksheetStatus', label: 'Marksheet Status', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  // { id: 'actions', label: 'Actions', alignRight: false },
];

const CustomToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
  color: 'text.disabled',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor:'#daedff'
  },
}));

const ThumbImgStyle = styled('img')(({ theme }) => ({
  width: 36,
  height: 36,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadiusSm
}));
// ----------------------------------------------------------------------

export default function TestListingTable({ departmentId, classId,className, gradeId, schoolId, gradeName, subjectName, subjectId }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth()
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('id');
  const [test, setTest] = useState(false);
  const viewType = localStorage.getItem('viewType');
  const location = useLocation()
  const [data,setData] = useState([])
  const { enqueueSnackbar } = useSnackbar();
  const [refresh,setRefresh] =useState(false)
  const [tempEditId,setTempEditId] = useState(null)
  const [editedData,setEditedData] = useState({})
  const stateData = {
    departmentId : departmentId,
    classId : classId,
    className : className,
    gradeId : gradeId,
    schoolId : schoolId,
    gradeName : gradeName,
    subjectName : subjectName,
    subjectId : subjectId
  }
  const [selectedIds, setSelectedIds] = useState([]); 
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  useEffect(()=>{
    fetchDataByClassId()
  },[classId,refresh])

const fetchDataByClassId =async()=>{
  await axios.get(`${REST_API_END_POINT}get-test-by-class/${classId}`)
  .then(res =>{
      if(res.data.status===1) {
        setData(res.data.result)
        console.log('data++++++++++++++++++++++',res.data.result)
      }else{
        console.log("not getting data")
        setData([])
      }
  }).catch(err =>console.log(err))
}

const handleDelete = async(id,multi)=>{
  await axios.delete(`${REST_API_END_POINT}delete-test/${id}`)
  .then(res => {
    if(res.data.status===1) {
      if(!multi){

        enqueueSnackbar('Test Deleted Successfully', { variant: 'success' });
      }
      setRefresh(!refresh)
      // window.location.reload()
    }else{
      enqueueSnackbar('Test Not Deleted', { variant: 'error' });
  
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

const handleActivate= async(id,status)=>{
  await axios.put(`${REST_API_END_POINT}update-test-status/${id}`,{status:status===1?0:1})
  .then(res =>{
    if(res.data.status===1) {
      enqueueSnackbar(`Test ${status===1? "Deactivated" :"Activated"} Successfully`, { variant: 'success' });
      setRefresh(!refresh)
      // window.location.reload()
    }else{
      enqueueSnackbar(`Test ${status===1? "Deactivation" :"Activation"} failed`, { variant: 'error' });
  
    }
  })
  }

  const handleEditPageOpen= (id,status)=>{
    if(status===0) return enqueueSnackbar('Test is Inactive', { variant: 'error' });
    if(user.user_type === 4){
      let filteredData = data.find((dat)=>dat.id === id)
      setEditedData(filteredData)
    }
    setTempEditId(id)
    setTest(true);
  }
  

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelectedIds = data.map((row) => row.id);
  //     setSelectedIds(newSelectedIds);
  //     setSelected(data.map((row) => row.subjectName));
  //   } else {
  //     setSelected([]);
  //     setSelectedIds([]);
  //   }
  // };
  
  // const handleClick = (event, name, id) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [...selected];
  //   let newSelectedIds = [...selectedIds];
  
  //   if (selectedIndex === -1) {
  //     newSelected.push(name);
  //     newSelectedIds.push(id);
  //   } else {
  //     newSelected.splice(selectedIndex, 1);
  //     newSelectedIds.splice(newSelectedIds.indexOf(id), 1);
  //   }
  
  //   setSelected(newSelected);
  //   setSelectedIds(newSelectedIds);
  // };
  
  
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allIds = data.map((row) => row.id);
      setSelectedIds(allIds);
      setSelected(data.map((row) => row.name));
    } else {
      setSelectedIds([]);
      setSelected([]);
    }
  };
  
  const handleClick = (event, name, id) => {
    let newSelected = [...selected];
    let newSelectedIds = [...selectedIds];
  
    if (selectedIds.includes(id)) {
      // If the ID is already selected, remove it
      newSelected = newSelected.filter((item) => item !== name);
      newSelectedIds = newSelectedIds.filter((itemId) => itemId !== id);
    } else {
      // If the ID is not selected, add it
      newSelected.push(name);
      newSelectedIds.push(id);
    }
  
    setSelected(newSelected);
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
    product.subjectName.toLowerCase().includes(filterName.toLowerCase())||
    product.typeOfTest.toLowerCase().includes(filterName.toLowerCase())
  );

  const isProductNotFound = filteredProducts?.length === 0;
  const [grade, setGrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const user_type = JSON.parse(localStorage.getItem('user_type'));


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
    <Page title="Test Listing | Umbrelytics ">
      <Container>
        {/* <Stack sx={{color:'#fff',mt:{xs:3.5,sm:3.5,md:3},display:'flex',justifyContent:'flex-end',mb: 3}} direction={{ xs: 'row', sm: 'row', md: 'row' }}>
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
        <Stack sx={{ display: 'flex', justifyContent: 'flex-end',mb:{xs:3,sm:3,md:2}, }} direction={{ xs: 'row', sm: 'row', md: 'row' }}  spacing={1}>
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
          {user_type !== 3  && <Button
            variant="contained"
            sx={{ color: '#fff', mb: 4 }} color='success'
            onClick={() => {
              setTempEditId(null)
              setTest(true)}}
            startIcon={<Icon icon={plusFill} />}
          >
            Add Test
          </Button>}
        </Stack>

        <Modal
          open={test}
          handleClose={() => {
            setTest(false);
            setEditedData({})
            setTempEditId(null)
          }}
          modalTitle={user_type !== 4 ? `${tempEditId? 'Update' :'Add'} Test` : 'Add Test'}>

          <AddTestForm editedData={editedData} test={test} setTest={setTest} classId={classId} departmentId={departmentId} tempEditId={tempEditId}/>

        </Modal>
        {loading ? (<Grid>
          <Paper sx={style}>
            <Box sx={{ width: '100%' }}>
              <MLinearProgress color='inherit' />
              <MLinearProgress color='warning' sx={{ mt: 2 }} />
              <MLinearProgress color='success' sx={{ mt: 2, }} />
              <MLinearProgress color='inherit' sx={{ mt: 2, }} />
            </Box>
          </Paper>
        </Grid>) : 
       view === 'list' ? ( <Card>
          <TestListingToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} handleClickOpen={handleClickOpen}/>
        <MUltiDeleteConfirmationPopUp  open={open} setOpen={setOpen} handleMultiDelete={handleMultiDelete}/>
          
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, whiteSpace: 'nowrap' }}>
              <Table size='small'>
                <TestListingHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={user_type?user_type===3?TABLE_HEAD1:TABLE_HEAD:TABLE_HEAD}
                  rowCount={data?.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredProducts?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, marksheetStatus, typeOfTest, assignedTo, status,subject,subjectName,createdBy,teacherName } = row;

                    const isItemSelected = selected.indexOf(subjectName) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        // selected={isItemSelected}
                        // aria-checked={isItemSelected}
                        selected={selectedIds.includes(id)}
                        aria-checked={selectedIds.includes(id)}
                        sx={{ borderBottom: '1.5px solid #e6e6e6' }}
                      >
                        {user_type !== 3  && <TableCell padding="checkbox">
                          <Checkbox 
                            // checked={isItemSelected} 
                            checked={selectedIds.includes(id)}
                            onChange={(event) => handleClick(event, subjectName,id)} />
                        </TableCell>}
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" sx={{ ml: -1 }}>
                            <ThumbImgStyle alt={subjectName} src={Excelicon} />
                            <Tooltip title={subjectName}>
                              {user_type !== 3?(<Link variant="subtitle2" onClick={() => {
                                if(status===0) return enqueueSnackbar('Test is Inactive', { variant: 'error' });
                                  marksheetStatus !== 1 ? 
                                    navigate(PATH_DASHBOARD.general.addMarksheet, { state: { testId :id, testName:subjectName, typeOfTest:typeOfTest, departmentId : departmentId, classId : classId, className : className, gradeId : gradeId, schoolId : schoolId, gradeName : gradeName, subjectName : subjectName, subjectId : subjectId } }) 
                                  : 
                                    navigate(PATH_DASHBOARD.general.schoolAdminMarksheetView, { state: { testId :id, testName:subjectName, typeOfTest:typeOfTest, departmentId : departmentId, classId : classId, className : className, gradeId : gradeId, schoolId : schoolId, gradeName : gradeName, subjectName : subjectName, subjectId : subjectId } })}} sx={{ mt: 0.3, ml: 1, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} noWrap>
                                {subjectName}
                              </Link>) : <Link variant="subtitle2" onClick={() => {
                                  if(status===0) return enqueueSnackbar('Test is Inactive', { variant: 'error' });
                                  marksheetStatus === 1 ? 
                                    navigate(PATH_DASHBOARD.general.schoolAdminMarksheetView, { state: { testId :id, testName:subjectName, typeOfTest:typeOfTest, departmentId : departmentId, classId : classId, className : className, gradeId : gradeId, schoolId : schoolId, gradeName : gradeName, subjectName : subjectName, subjectId : subjectId } })
                                  : enqueueSnackbar('Marksheet not yet uploaded', { variant: 'error' }) 
                                }} sx={{ mt: 0.3, ml: 1, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} noWrap>
                                {subjectName}
                              </Link>}
                            </Tooltip>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">
                        <Tooltip title={teacherName}>
                            <Typography variant="subtitle2" sx={{ml:user_type === 3 ? -1 : user_type === 4 ? -1 : 0,maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                                {teacherName}
                            </Typography>
                        </Tooltip>
                    </TableCell>

                        <TableCell align="left">
                        <Tooltip title={createdBy}>
                            <Typography variant="subtitle2" sx={{ml:user_type === 3 ? -1 : user_type === 4 ? -1 : 0,maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                                {createdBy}
                            </Typography>
                        </Tooltip>
                    </TableCell>
                    
                        <TableCell align="left">
                          <Tooltip title={typeOfTest}>
                            <Typography variant="subtitle2" sx={{ ml: 0, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }} noWrap>
                              {typeOfTest}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        {/* <TableCell align="left">
                          <Tooltip title={assignedTo}>
                            <Typography variant="subtitle2" sx={{ ml: 1, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }} noWrap>
                              {assignedTo}
                            </Typography>
                          </Tooltip>
                        </TableCell> */}
                        <TableCell align="left">
                          <Label
                            sx={{ ml: -0.3 }}
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={(marksheetStatus === 1 && 'success') || 'error'}
                          >
                            {marksheetStatus===1 ? 'Marksheet uploaded' : 'Not yet added'}
                          </Label>
                        </TableCell>
                        <TableCell align="left">
                          <Label
                            sx={{ ml: -0.3 }}
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={(status === 0 && 'error') || 'success'}
                          >
                            {status===1? "Active" : "Inactive"} 
                          </Label>
                        </TableCell>
                        {user_type !== 3  && <TableCell align="left">
                          <TestListingMenu 
                          onDelete={() => handleDeleteProduct(id)}
                           productName={name}
                            onActive={()=>handleActivate(id,status)}
                             status={status}
                              handleDelete={()=>handleDelete(id)}
                               handleEditPageOpen={()=>handleEditPageOpen(id,status)}/>
                        </TableCell>}
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
        </Card>) : <TestGrid staticProducts={filteredProducts} stateData={stateData} handleActivate={handleActivate} handleDelete={handleDelete} handleEditPageOpen={handleEditPageOpen} />
        }

      </Container>
    </Page>
  );
}

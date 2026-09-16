import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import plusFill from '@iconify/icons-eva/plus-fill'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { experimentalStyled as styled } from '@material-ui/core/styles'
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
  Tab,
  Tabs,
  ToggleButtonGroup,
  ToggleButton,
} from '@material-ui/core'
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs'
import { fDate } from 'src/utils/formatTime'
import { fCurrency } from 'src/utils/formatNumber'
import { ProductListHead } from 'src/components/_dashboard/e-commerce/product-list'
import ClassImg from '../../../../../../../src/images/class-icon.png'
import Label from 'src/components/Label'
import { sentenceCase } from 'change-case'
import { useTheme } from '@emotion/react'
import Page from 'src/components/Page'
import { PATH_DASHBOARD } from 'src/routes/paths'
import Logo from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Modal from 'src/components/_dashboard/Model/ProjectModel'
import Scrollbar from 'src/components/Scrollbar'
import { MLinearProgress } from 'src/components/@material-extend'
import ClassListingToolbar from './class-listing-toolbar'
import ClassListingMenu from './class-listing-menu'
import AddClassForm from './add-class/add-class-form'
import {
  Analytics,
  ArrowBack,
  Person,
  School,
  ViewList,
  ViewModule,
} from '@material-ui/icons'
import HODListing from '../hod/listing/hod-listing'
import GradeAnalyticsListing from '../grade-analytics.js/grade-analytics'
import GradeGrid from '../grade-grid/grade-grid'
import DepartmentAnalyticsListing from '../department-analytics/department-analytics'
import SubjectAnalytics from '../subject-analytics/subject-analytics'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import { useSnackbar } from 'notistack'
import { useQuery } from 'src/utils/queryParams'
import MUltiDeleteConfirmationPopUp from '../MultiDeleteConfirmationPopUp'

// ----------------------------------------------------------------------

const user_type = JSON.parse(localStorage.getItem('user_type'))

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 14, sm: 33, md: 13, lg: 13 },
}

const TABLE_HEAD = [
  { id: 'name', label: 'Grade Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'createdat', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: false },
]

const TABLE_HEAD1 = [
  { id: 'name', label: 'Grade Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'createdat', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
]

const ThumbImgStyle = styled('img')(({ theme }) => ({
  width: 36,
  height: 36,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadiusSm,
}))
// ----------------------------------------------------------------------

const CustomToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
  color: 'text.disabled',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: '#daedff',
  },
}))

const staticProducts = [
  {
    id: 1,
    name: '1st Grade',
    createdby: 'Super Admin',
    createdon: new Date(),
    inventoryType: 'inactive',
  },
  {
    id: 2,
    name: '2nd Grade',
    createdby: 'Super Admin',
    createdon: new Date(),
    inventoryType: 'active',
  },
  {
    id: 3,
    name: '3rd Grade',
    createdby: 'Jamaica High School',
    createdon: new Date(),
    inventoryType: 'inactive',
  },
]

const SCROLLABLE_TAB = [
  {
    value: '1',
    icon: (
      <Label
        variant="ghost"
        color="info"
        sx={{ padding: '16px', width: '45px', borderRadius: '6px' }}
      >
        <School />
      </Label>
    ),
    label: 'Grade Listing',
  },
  {
    value: '3',
    icon: (
      <Label
        variant="ghost"
        color="warning"
        sx={{ padding: '16px', width: '45px', borderRadius: '6px' }}
      >
        <Analytics />
      </Label>
    ),
    label: 'Subject Analytics',
  },
  // { value: '3', icon: <Label variant='ghost' color='warning' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Grade Analytics' },
  // { value: '2', icon: <Label variant='ghost' color='error' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Person /></Label>, label: 'View HODs' },
]

const SCROLLABLE_TAB1 = [
  {
    value: '1',
    icon: (
      <Label
        variant="ghost"
        color="info"
        sx={{ padding: '16px', width: '45px', borderRadius: '6px' }}
      >
        <School />
      </Label>
    ),
    label: 'Grade Listing',
  },
  // { value: '3', icon: <Label variant='ghost' color='warning' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Subject Analytics' },
]

export default function ClassListingTable() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [orderBy, setOrderBy] = useState('name')
  const valueTabScrollableGradeDetails = localStorage.getItem(
    'valueTabScrollableGradeDetails',
  )
  const [valueScrollable, setValueScrollable] = useState(
    valueTabScrollableGradeDetails || '1',
  )
  const location = useLocation()
  const query = useQuery()

  const departmentId =
    location?.state?.departmentId || query.get('departmentId')
  const schoolId =
    location?.state?.schoolId ||
    query.get('schoolId') ||
    JSON.parse(localStorage.getItem('schoolId'))
  const subjectId = location?.state?.subjectId || query.get('subjectId')
  const subjectName = location?.state?.subjectName || query.get('subjectName')

  const [data, setData] = useState([])
  const { enqueueSnackbar } = useSnackbar()
  const [refresh, setRefresh] = useState(false)
  const [tempEditId, setTempEditId] = useState(null)
  const user = JSON.parse(localStorage.getItem('user'))
  const [singleSchoolData, setSingleSchoolData] = useState({})
  const [departmentName, setDepartmentName] = useState('')
  const id = user?.schoolId || schoolId
  const [selectedIds, setSelectedIds] = useState([])
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const fetchSchoolById = async () => {
    await axios
      .get(`${REST_API_END_POINT}getSchool-details/${id}`)
      .then((res) => {
        if (res.data.status === 1) {
          setSingleSchoolData(res.data.result)
        } else {
          console.log('not getting data')
          setSingleSchoolData(null)
        }
      })
      .catch((err) => console.log(err))
  }

  const fetchDepartmentById = async () => {
    if (!departmentId) return
    await axios
      .get(`${REST_API_END_POINT}get-departments-data/${departmentId}`)
      .then((res) => {
        if (res.data.status === 1) {
          // adjust the field name to match your departments table column
          setDepartmentName(
            (res.data.result.departmentName || res.data.result.name || '') +
              ' Department',
          )
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    fetchSchoolById()
    fetchDepartmentById()
  }, [])

  useEffect(() => {
    fetchGradesBySubjectId()
  }, [subjectId, refresh])

  const fetchGradesBySubjectId = async () => {
    axios
      .get(`${REST_API_END_POINT}get-all-grade/${subjectId}`)
      .then((res) => {
        if (res.data.status === 1) {
          setData(res.data.result)
        } else {
          console.log('not getting data')
          setData([])
        }
      })
      .catch((err) => console.log(err))
  }

  const handleActivate = async (id, status) => {
    await axios
      .put(`${REST_API_END_POINT}update-grade-status/${id}`, {
        status: status === 1 ? 0 : 1,
      })
      .then((res) => {
        if (res.data.status === 1) {
          enqueueSnackbar(
            `Grade ${status === 1 ? 'Deactivated' : 'Activated'} Successfully`,
            { variant: 'success' },
          )
          setRefresh(!refresh)
          // window.location.reload()
        } else {
          enqueueSnackbar(
            `Grade ${status === 1 ? 'Deactivation' : 'Activation'} failed`,
            { variant: 'error' },
          )
        }
      })
  }

  const handleDelete = async (id, multi) => {
    await axios
      .delete(`${REST_API_END_POINT}delete-grade/${id}`)
      .then((res) => {
        if (res.data.status === 1) {
          if (!multi) {
            enqueueSnackbar('Grade Deleted Successfully', {
              variant: 'success',
            })
          }
          setRefresh(!refresh)
          // window.location.reload()
        } else {
          enqueueSnackbar('Grade Not Deleted', { variant: 'error' })
        }
      })
      .catch((err) => console.log(err))
  }

  const handleMultiDelete = async () => {
    try {
      // Use Promise.all to wait for all delete operations to complete
      const deletePromises = selectedIds.map((id) => handleDelete(id, 1))
      await Promise.all(deletePromises)

      enqueueSnackbar('All selected items are deleted successfully', {
        variant: 'success',
      })

      setRefresh(!refresh)
      setSelectedIds([])
      setOpen(false)
      setSelected([])
    } catch (err) {
      console.error('Error in multi-delete:', err)
      enqueueSnackbar('Failed to delete some or all selected departments.', {
        variant: 'error',
      })
    }
  }

  const handleOpenEdit = (id, status) => {
    if (status === 0)
      return enqueueSnackbar('Grade is Inactive', { variant: 'error' })
    setTempEditId(id)
    setGrade(true)
  }

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue)
    localStorage.setItem('valueTabScrollableGradeDetails', newValue)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((n) => n.name)
      const newSelectedIds = data.map((row) => row.id)

      setSelected(newSelecteds)
      setSelectedIds(newSelectedIds)

      return
    }
    setSelected([])
    setSelectedIds([])
  }

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

  const handleClick = (event, name, id) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected = []
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }
    setSelected(newSelected)

    // Handle ID selection
    const idIndex = selectedIds.indexOf(id)
    let newSelectedIds = []

    if (idIndex === -1) {
      newSelectedIds = [...selectedIds, id]
    } else {
      newSelectedIds = [
        ...selectedIds.slice(0, idIndex),
        ...selectedIds.slice(idIndex + 1),
      ]
    }
    setSelectedIds(newSelectedIds)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterByName = (event) => {
    setFilterName(event.target.value)
  }

  const handleDeleteProduct = (productId) => {
    // Handle delete action
  }

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - staticProducts.length) : 0

  const filteredProducts = data?.filter((product) =>
    product.name.toLowerCase().includes(filterName.toLowerCase()),
  )

  const isProductNotFound = filteredProducts.length === 0
  const [gradename, setGrade] = useState(false)
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const viewType = localStorage.getItem('viewType')

  const [view, setView] = useState(viewType || 'list')
  const handleChange = (event, nextView) => {
    if (nextView !== null) {
      setView(nextView)
      localStorage.setItem('viewType', nextView)
    }
  }

  const handleGoBack = () => {
    window.history.back()
  }
  return (
    <Page title="Grade Listing | Umbrelytics ">
      <Container>
        <Stack direction="row">
          <Avatar
            alt={singleSchoolData?.school_name}
            sx={{ mt: -0.2 }}
            src={Logo}
          />
          <Box>
            <Tooltip title={singleSchoolData?.school_name}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  mt: 1,
                  ml: 1,
                  cursor: 'pointer',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {singleSchoolData?.school_name}
              </Typography>
            </Tooltip>
          </Box>
        </Stack>
        {user_type !== 3 ? (
          <HeaderBreadcrumbs
            heading="Grade Details"
            links={[
              user_type === 1
                ? {
                    name: 'School Listing',
                    href: PATH_DASHBOARD.general.schools,
                  }
                : user_type === 2
                ? {
                    name: 'School Details',
                    href: PATH_DASHBOARD.general.schoolDetails,
                  }
                : user_type === 3
                ? {
                    name: 'HOD Details',
                    href: PATH_DASHBOARD.general.hodDetails,
                  }
                : {
                    name: 'Teacher Details',
                    href: PATH_DASHBOARD.general.teacherDetails,
                  },
              {
                name: departmentName || 'Department Listing',
                href: PATH_DASHBOARD.general.department,
                state: {
                  viewType: viewType,
                  departmentId: departmentId,
                  schoolId: schoolId,
                  departmentName: departmentName,
                },
              },
              {
                name: subjectName || 'Subject',
                href: PATH_DASHBOARD.general.Departmentsubjects,
                state: {
                  viewType: view,
                  departmentId: departmentId,
                  schoolId: schoolId,
                  departmentName: departmentName,
                },
              },
              { name: 'Grade Details' },
            ]}
            // action={
            //   <>
            //       <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
            //   </>
            // }
          />
        ) : (
          <HeaderBreadcrumbs
            heading="Grade Details"
            links={[
              user_type === 1
                ? {
                    name: 'School Listing',
                    href: PATH_DASHBOARD.general.schools,
                  }
                : user_type === 2
                ? {
                    name: 'School Details',
                    href: PATH_DASHBOARD.general.schoolDetails,
                  }
                : user_type === 3
                ? {
                    name: 'HOD Details',
                    href: PATH_DASHBOARD.general.hodDetails,
                  }
                : {
                    name: 'Teacher Details',
                    href: PATH_DASHBOARD.general.teacherDetails,
                  },
              {
                name: subjectName || 'Subject',
                href: PATH_DASHBOARD.general.Departmentsubjects,
                state: {
                  viewType: view,
                  departmentId: departmentId,
                  schoolId: schoolId,
                  departmentName: departmentName,
                },
              },
              { name: 'Grade Details' },
            ]}
            // action={
            //   <>
            //       <Button variant='outlined' color='inherit' onClick={handleGoBack} startIcon={<ArrowBack />}>Go Back</Button>
            //   </>
            // }
          />
        )}

        {user_type !== 3 ? (
          <Tabs
            sx={{ mt: -3 }}
            allowScrollButtonsMobile
            value={valueScrollable}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleChangeScrollable}
          >
            {SCROLLABLE_TAB.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>
        ) : (
          <Tabs
            sx={{ mt: -3 }}
            allowScrollButtonsMobile
            value={valueScrollable}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleChangeScrollable}
          >
            {SCROLLABLE_TAB1.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>
        )}
        <Stack
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: { xs: 3, sm: 3, md: 0 },
            mt: { xs: 3, sm: 3, md: 0 },
          }}
          direction={{ xs: 'row', sm: 'row', md: 'row' }}
          spacing={1}
        >
          {valueScrollable === '1' && (
            <ToggleButtonGroup
              size="small"
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
          )}
          {user_type !== 3 && user_type !== 4 && valueScrollable === '1' && (
            <Button
              variant="contained"
              sx={{ color: '#fff', mt: 3 }}
              color="success"
              onClick={() => {
                setTempEditId(null)
                setGrade(true)
              }}
              startIcon={<Icon icon={plusFill} />}
            >
              Add Grade
            </Button>
          )}
        </Stack>

        <Modal
          open={gradename}
          handleClose={() => {
            setGrade(false)
          }}
          modalTitle={`${tempEditId ? 'Edit' : 'Add'} Grade`}
        >
          <AddClassForm
            gradename={gradename}
            setGrade={setGrade}
            subjectId={subjectId}
            schoolId={schoolId}
            tempEditId={tempEditId}
          />
        </Modal>
        {loading ? (
          <Grid>
            <Paper sx={style}>
              <Box sx={{ width: '100%' }}>
                <MLinearProgress color="inherit" />
                <MLinearProgress color="warning" sx={{ mt: 2 }} />
                <MLinearProgress color="success" sx={{ mt: 2 }} />
                <MLinearProgress color="inherit" sx={{ mt: 2 }} />
              </Box>
            </Paper>
          </Grid>
        ) : (
          <>
            {valueScrollable === '1' ? (
              view === 'list' ? (
                <Card
                  sx={{ mt: user_type === 3 ? 5 : user_type === 4 ? 5 : 3 }}
                >
                  <ClassListingToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    handleClickOpen={handleClickOpen}
                  />
                  <MUltiDeleteConfirmationPopUp
                    open={open}
                    setOpen={setOpen}
                    handleMultiDelete={handleMultiDelete}
                  />

                  <Scrollbar>
                    <TableContainer
                      sx={{ minWidth: 800, whiteSpace: 'nowrap' }}
                    >
                      <Table
                        size={
                          user_type === 3
                            ? 'medium'
                            : user_type === 4
                            ? 'medium'
                            : 'small'
                        }
                      >
                        <ProductListHead
                          order={order}
                          orderBy={orderBy}
                          headLabel={
                            user_type === 3
                              ? TABLE_HEAD1
                              : user_type === 4
                              ? TABLE_HEAD1
                              : TABLE_HEAD
                          }
                          rowCount={data.length}
                          numSelected={selected.length}
                          onRequestSort={handleRequestSort}
                          onSelectAllClick={handleSelectAllClick}
                        />
                        <TableBody>
                          {filteredProducts
                            ?.slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage,
                            )
                            .map((row) => {
                              const {
                                id,
                                name,
                                cover,
                                createdBy,
                                createdOn,
                                inventoryType,
                                status,
                              } = row

                              const isItemSelected =
                                selected.indexOf(name) !== -1

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
                                  {user_type !== 3 && user_type !== 4 && (
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        checked={isItemSelected}
                                        onChange={(event) =>
                                          handleClick(event, name, id)
                                        }
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell
                                    component="th"
                                    scope="row"
                                    padding="none"
                                  >
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      sx={{
                                        ml:
                                          user_type !== 3 &&
                                          user_type !== 4 &&
                                          -1,
                                      }}
                                    >
                                      <ThumbImgStyle
                                        alt={name}
                                        src={ClassImg}
                                      />
                                      <Tooltip title={name}>
                                        <Link
                                          variant="subtitle2"
                                          onClick={() => {
                                            if (status === 0)
                                              return enqueueSnackbar(
                                                'Grade is Inactive',
                                                { variant: 'error' },
                                              )
                                            navigate(
                                              PATH_DASHBOARD.general
                                                .departmentdetails,
                                              {
                                                state: {
                                                  schoolId: schoolId,
                                                  gradeId: id,
                                                  subjectId: subjectId,
                                                  departmentId: departmentId,
                                                  subjectName: subjectName,
                                                  gradeName: name,
                                                  departmentName:
                                                    departmentName,
                                                },
                                              },
                                            )
                                          }}
                                          sx={{
                                            mt: 0.3,
                                            ml: 1,
                                            maxWidth: 150,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                          }}
                                          noWrap
                                        >
                                          {name}
                                        </Link>
                                      </Tooltip>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Tooltip title={createdBy}>
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          ml:
                                            user_type === 3
                                              ? -1
                                              : user_type === 4
                                              ? -1
                                              : 0,
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                        noWrap
                                      >
                                        {createdBy}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ ml: -0.2 }}
                                    >
                                      {createdOn}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Label
                                      sx={{ ml: -0.3 }}
                                      variant={
                                        theme.palette.mode === 'light'
                                          ? 'ghost'
                                          : 'filled'
                                      }
                                      color={
                                        (status === 0 && 'error') || 'success'
                                      }
                                    >
                                      {status === 1 ? 'Active' : 'Inactive'}
                                    </Label>
                                  </TableCell>
                                  {user_type !== 3 && user_type !== 4 && (
                                    <TableCell align="left">
                                      <ClassListingMenu
                                        onDelete={() => handleDeleteProduct(id)}
                                        productName={name}
                                        status={status}
                                        handleActivate={() =>
                                          handleActivate(id, status)
                                        }
                                        handleDelete={() => handleDelete(id)}
                                        handleOpenEdit={() =>
                                          handleOpenEdit(id, status)
                                        }
                                      />
                                    </TableCell>
                                  )}
                                </TableRow>
                              )
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
                                <Box sx={{ py: 3 }}>Data not found.</Box>
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
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Card>
              ) : (
                <GradeGrid
                  staticProducts={data}
                  handleOpenEdit={handleOpenEdit}
                  handleDelete={handleDelete}
                  handleActivate={handleActivate}
                  subjectId={subjectId}
                  schoolId={schoolId}
                  departmentId={departmentId}
                  subjectName={subjectName}
                  departmentName={departmentName}
                />
              )
            ) : valueScrollable === '2' ? (
              <Box sx={{ mt: 5, ml: { xs: -1, sm: -3, md: -3 } }}>
                <HODListing deptId={departmentId} />
              </Box>
            ) : (
              <Box sx={{ mt: 5, ml: { xs: -1, sm: -3, md: -3 } }}>
                <SubjectAnalytics subjectId={subjectId} />
                {/* <GradeAnalyticsListing/> */}
              </Box>
            )}
          </>
        )}
      </Container>
    </Page>
  )
}

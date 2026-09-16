import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  Link,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@material-ui/core'
import { PATH_DASHBOARD } from '../../../../../../routes/paths'
import HeaderBreadcrumbs from '../../../../../../components/HeaderBreadcrumbs'
import LogoSchool from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import {
  Add,
  Analytics,
  ArrowBack,
  Class,
  ImportContacts,
  Person,
  School,
} from '@material-ui/icons'
import Maintenance from 'src/pages/Maintenance'
import Page from 'src/components/Page'
import HODListing from '../hod/listing/hod-listing'
import GradeListingTable from '../grades-listing/grade-listing-table'
import Modal from 'src/components/_dashboard/Model/ProjectModel'
import AddGradeForm from '../grades-listing/add-grades/add-grade-form'
import Icon from '@iconify/react'
import plusFill from '@iconify/icons-eva/plus-fill'
import SubjectListingTable from '../subjects/subject-listing-table'
import SubjectAnalytics from '../subject-analytics/subject-analytics'
import Label from 'src/components/Label'
import ClassAnalyticsListing from '../grades-listing/class-analytics.js/class-analytics'
import GradeAnalyticsListing from '../grade-analytics.js/grade-analytics'
import { useLocation } from 'react-router'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import { useQuery } from 'src/utils/queryParams'
import TeacherSubjectListingToolbar from '../teachers/teacher-subject-view-table/teacher-subject'
import Scrollbar from 'src/components/Scrollbar'
import TeacherSubjectViewTableHead from '../teachers/teacher-subject-view-table/teacher-view-subject--table-head'
import { fDate } from 'src/utils/formatTime'
import { sentenceCase } from 'change-case'
import { styled } from '@material-ui/styles'
import PDFImg from '../../../../../../images/pdf-png.png'
import SubjectListingToolbar from '../subjects/subject-listing-toolbar'
import SubjectListingHead from '../subjects/subject-listing-head'
// import Excelicon from '../../../../../../../../src/images/xlsx-png.png'
const user_type = JSON.parse(localStorage.getItem('user_type'))

const SCROLLABLE_TAB = [
  {
    value: '1',
    icon: (
      <Label
        variant="ghost"
        color="error"
        sx={{ padding: '16px', width: '45px', borderRadius: '6px' }}
      >
        <School />
      </Label>
    ),
    label: 'Class Listing',
  },
  {
    value: '2',
    icon: (
      <Label
        variant="ghost"
        color="info"
        sx={{ padding: '16px', width: '45px', borderRadius: '6px' }}
      >
        <Analytics />
      </Label>
    ),
    label: 'All Classs Analytics',
  },
  // { value: '3', icon: <Label variant='ghost' color='success' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><ImportContacts /></Label>, label: 'Subject Listing' },
  // { value: '2', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Class Analytics' },
  // { value: '2', icon: <Label variant='ghost' color='success' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><ImportContacts /></Label>, label: 'View Subjects' },
]
const ThumbImgStyle = styled('img')(({ theme }) => ({
  width: 36,
  height: 36,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadiusSm,
}))

const TABLE_HEAD = [
  { id: 'name', label: 'Subject Name', alignRight: false },
  { id: 'createdby', label: 'Created By', alignRight: false },
  { id: 'createdat', label: 'Created On', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  // { id: 'actions', label: 'Actions', alignRight: false },
]
const staticProducts = [
  {
    id: 1,
    name: 'Mathematics',
    assignedby: 'Super Admin',
    typeoftest: 'Mid Term Examination',
    assignedon: new Date(),
    marksheet: 'marksheet uploaded',
    status: 'inactive',
  },
  {
    id: 2,
    name: 'English',
    assignedby: 'Super Admin',
    typeoftest: 'Annual Examination',
    assignedon: new Date(),
    marksheet: 'not yet added',
    status: 'inactive',
  },
  {
    id: 3,
    name: 'Computer',
    assignedby: 'Jamaica High School',
    typeoftest: 'Mid Term Examination',
    assignedon: new Date(),
    marksheet: 'not yet added',
    status: 'inactive',
  },
]

export default function TabViewClassHOD() {
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [subjectDatas, setSubjectDatas] = useState([])
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [orderBy, setOrderBy] = useState('subjectName')
  const [langId, setlangId] = useState('')
  const valueTabScrollableClass = localStorage.getItem(
    'valueTabScrollableClass',
  )
  const [valueScrollable, setValueScrollable] = useState(
    valueTabScrollableClass || '1',
  )
  const viewType = localStorage.getItem('viewType')
  const userData = JSON.parse(localStorage.getItem('user'))
  const subjectIds = localStorage.getItem('subjectId')
  // const departmentId = userData.departmentId;
  const location = useLocation()
  const query = useQuery()
  const teacherId = location?.state?.teacherId || query?.get('teacherId')
  const subjectId = location?.state?.subjectId || query?.get('subjectId')
  const schoolId = location?.state?.schoolId || query?.get('schoolId')
  const departmentId =
    userData.departmentId ||
    location?.state?.departmentId ||
    query?.get('departmentId')
  const subjectName = location?.state?.subjectName || query?.get('subjectName')
  const gradeName = location?.state?.gradeName || query?.get('gradeName')
  const gradeId = location?.state?.gradeId || query?.get('gradeId')
  const [isLoading, setIsLoading] = useState(false)
  console.log('subjectNamesubjectName', subjectIds, departmentId)

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - subjectDatas.length) : 0

  let filteredProducts = subjectDatas.filter((product) =>
    product?.subjectName?.toLowerCase().includes(filterName?.toLowerCase()),
  )
  subjectIds

  const isProductNotFound = filteredProducts.length === 0
  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue)
    localStorage.setItem('valueTabScrollableClass', newValue)
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const handleFilterByName = (event) => {
    setFilterName(event.target.value)
  }

  useEffect(() => {
    setIsLoading(true)
    axios
      .get(`${REST_API_END_POINT}get-subject/${departmentId}`)
      .then((res) => {
        if (res.data.status === 1) {
          console.log('subjectData', res.data.result)
          setSubjectDatas(res.data.result)
          setTimeout(() => {
            setIsLoading(false)
          }, 2000)
        } else {
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }, [valueScrollable === '3'])
  const handleGoBack = () => {
    window.history.back()
  }
  const [classname, setClass] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'))
  const [singleSchoolData, setSingleSchoolData] = useState(false)
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'))
  const id = user?.schoolId || newSchoolId || schoolId

  const fetchSchoolById = async () => {
    await axios
      .get(`${REST_API_END_POINT}getSchool-details/${id}`)
      .then((res) => {
        if (res.data.status === 1) {
          setSingleSchoolData(res.data.result)
        } else {
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    fetchSchoolById()
  }, [])

  return (
    <Page title="Class Details | Umbrelytics ">
      <Container>
        <Stack direction="row">
          <Avatar
            sx={{ mt: -0.2 }}
            alt={singleSchoolData?.school_name}
            src={LogoSchool}
          />
          <Box>
            <Tooltip title={singleSchoolData?.school_name}>
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  ml: 1,
                  mb: 1,
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
        {user_type === 1 ? (
          <HeaderBreadcrumbs
            heading={'Class Details'}
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
                name: 'Department Listing',
                href: PATH_DASHBOARD.general.department,
                state: {
                  viewType: viewType,
                  departmentId: departmentId,
                  schoolId: schoolId,
                },
              },
              {
                name: subjectName || 'Subject',
                href: PATH_DASHBOARD.general.Departmentsubjects,
                state: {
                  viewType: viewType,
                  departmentId: departmentId,
                  schoolId: schoolId,
                },
              },
              {
                name: gradeName || 'Grade Details',
                href: PATH_DASHBOARD.general.gradeListing,
                state: {
                  subjectName: subjectName,
                  subjectId: subjectId,
                  schoolId: schoolId,
                  departmentId: departmentId,
                },
              },
              { name: 'Class Details' },
            ]}
          />
        ) : user_type === 2 ? (
          <HeaderBreadcrumbs
            heading={'Class Details'}
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
                name: 'Department Listing',
                href: PATH_DASHBOARD.general.department,
                state: {
                  viewType: viewType,
                  departmentId: departmentId,
                  schoolId: schoolId,
                },
              },
              {
                name: subjectName || 'Subject',
                href: PATH_DASHBOARD.general.Departmentsubjects,
                state: {
                  viewType: viewType,
                  departmentId: departmentId,
                  schoolId: schoolId,
                },
              },
              {
                name: gradeName || 'Grade Details',
                href: PATH_DASHBOARD.general.gradeListing,
                state: {
                  subjectName: subjectName,
                  subjectId: subjectId,
                  schoolId: schoolId,
                  departmentId: departmentId,
                },
              },
              { name: 'Class Details' },
            ]}
          />
        ) : user_type === 3 ? (
          <HeaderBreadcrumbs
            heading={'Class Details'}
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
                  viewType: viewType,
                  departmentId: departmentId,
                  schoolId: schoolId,
                },
              },
              {
                name: gradeName || 'Grade Details',
                href: PATH_DASHBOARD.general.gradeListing,
                state: {
                  subjectName: subjectName,
                  subjectId: subjectId,
                  schoolId: schoolId,
                  departmentId: departmentId,
                },
              },
              { name: 'Class Details' },
            ]}
          />
        ) : (
          <HeaderBreadcrumbs
            heading={'Class Details'}
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
              { name: 'Class Details' },
            ]}
          />
        )}

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
          sx={{ mt: -3 }}
          value={valueScrollable}
          allowScrollButtonsMobile
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
        {valueScrollable === '1' ? (
          <Box
            sx={{ mt: { xs: 4, sm: 0, md: 0 }, ml: { xs: -1, sm: -3, md: -3 } }}
          >
            <GradeListingTable
              teacherId={teacherId}
              subject_Name={subjectName}
              subject_Id={subjectId}
              grade_Id={gradeId}
              grade_Name={gradeName}
              school_Id={schoolId}
              department_Id={departmentId}
            />
          </Box>
        ) : valueScrollable === '2' ? (
          <Box
            sx={{ mt: { xs: 4, sm: 4, md: 0 }, ml: { xs: -1, sm: -3, md: -3 } }}
          >
            <GradeAnalyticsListing gradeId={gradeId} />
            {/* <ClassAnalyticsListing /> */}
          </Box>
        ) : (
          <Box
            sx={{ mt: { xs: 4, sm: 4, md: 0 }, ml: { xs: -1, sm: -3, md: -3 } }}
          >
            {/* <GradeAnalyticsListing  gradeId={gradeId}/> */}
            <Card sx={{ mt: 4 }}>
              <SubjectListingToolbar
                numSelected={selected.length}
                filterName={filterName}
                onFilterName={handleFilterByName}
              />
              <Scrollbar>
                <TableContainer sx={{ minWidth: 800, whiteSpace: 'nowrap' }}>
                  <Table size="small">
                    <SubjectListingHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={subjectDatas.length}
                      numSelected={selected.length}
                      onRequestSort={handleRequestSort}
                      // onSelectAllClick={handleSelectAllClick}
                    />
                    <TableBody>
                      {filteredProducts
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        )
                        .map((row) => {
                          // const { id, name, assignedTo, createdby, createdon, inventoryType } = row;
                          const {
                            id,
                            subjectName,
                            assigned,
                            createdBy,
                            createdOn,
                            status,
                          } = row

                          const isItemSelected =
                            selected.indexOf(subjectName) !== -1

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
                              {/* {!isDepartmentDetailsPage && (<TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, subjectName)} />
                    </TableCell>)} */}

                              {(user_type === 1 || user_type === 2) && (
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={isItemSelected}
                                    onChange={(event) =>
                                      handleClick(event, subjectName)
                                    }
                                  />
                                </TableCell>
                              )}
                              <TableCell
                                component="th"
                                scope="row"
                                padding="none"
                              >
                                <Stack direction="row" alignItems="center">
                                  <ThumbImgStyle
                                    alt={subjectName}
                                    src={PDFImg}
                                  />
                                  <Tooltip title={subjectName}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        mt: 0.3,
                                        ml: 1,
                                        maxWidth: 150,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                      noWrap
                                    >
                                      {subjectName}
                                    </Typography>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                              <TableCell align="left">
                                <Tooltip title={createdBy}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      ml: 0,
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
                              {/* {isDepartmentDetailsPage && (<TableCell align="left">
                        <Tooltip title={assignedTo}>
                            <Typography variant="subtitle2" sx={{ml:0,maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',}} noWrap>
                                {assignedTo}
                            </Typography>
                        </Tooltip>
                    </TableCell>)} */}
                              {/* {user_type !== 3 && user_type !== 4 && isDepartmentDetailsPage && (<TableCell align="left"><Button className='css-rl7xow-MuiButtonBase-root-MuiButton-root1' sx={{boxShadow:'none',ml:0.1}} onClick={handleOpenSubMenu} size='small' variant="contained">Sub Menu</Button></TableCell>)} */}
                              <TableCell align="left">
                                <Label
                                  sx={{ ml: -0.3 }}
                                  variant={
                                    theme.palette.mode === 'light'
                                      ? 'ghost'
                                      : 'filled'
                                  }
                                  color={(status === 0 && 'error') || 'success'}
                                >
                                  {status === 1 ? 'Active' : 'Inactive'}
                                </Label>
                              </TableCell>
                              {/* {!isDepartmentDetailsPage &&(<TableCell align="left">
                      <SubjectListingMenu onDelete={() => handleDeleteProduct(id)} productName={subjectName} handleActivateSubject={()=>handleActivateSubject(id,status)} handleEditSubject={()=>handleEditSubject(id,status)} status={status}/>
                    </TableCell>)} */}

                              {(user_type === 1 || user_type === 2) && (
                                <TableCell align="left">
                                  <SubjectListingMenu
                                    onDelete={() => handleDeleteProduct(id)}
                                    productName={subjectName}
                                    handleActivateSubject={() =>
                                      handleActivateSubject(id, status)
                                    }
                                    handleEditSubject={() =>
                                      handleEditSubject(id, status)
                                    }
                                    status={status}
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
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
            {/* <ClassAnalyticsListing /> */}
          </Box>
        )}
      </Container>
    </Page>
  )
}

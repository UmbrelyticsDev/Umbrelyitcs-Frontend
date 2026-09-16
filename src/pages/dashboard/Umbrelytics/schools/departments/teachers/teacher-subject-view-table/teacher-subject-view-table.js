import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import plusFill from '@iconify/icons-eva/plus-fill'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
  TableHead,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
} from '@material-ui/core'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs'
import { fDate } from 'src/utils/formatTime'
import { fCurrency } from 'src/utils/formatNumber'
import { ProductListHead } from 'src/components/_dashboard/e-commerce/product-list'
import Excelicon from '../../../../../../../../src/images/xlsx-png.png'
import Label from 'src/components/Label'
import { sentenceCase } from 'change-case'
import { useTheme } from '@emotion/react'
import Page from 'src/components/Page'
import { PATH_DASHBOARD } from 'src/routes/paths'
import Scrollbar from 'src/components/Scrollbar'
import { MLinearProgress } from 'src/components/@material-extend'
import Logo from '../../../../../../../../src/images/jamaica-high-school-logo.jpg'
import TeacherSubjectListingToolbar from './teacher-subject'
import TeacherSubjectViewTableHead from './teacher-view-subject--table-head'
import {
  Analytics,
  ArrowBack,
  School,
  ViewList,
  ViewModule,
} from '@material-ui/icons'
import SubjectAnalytics from '../../subject-analytics/subject-analytics'
import TeacherAnalytics from '../../teacher-analytics/teacher-analytics'
import TeacherSubjectGrid from './teacher-subject-grid/teacher-subject-grid'

// ----------------------------------------------------------------------

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 10, sm: 27, md: 10, lg: 10 },
}

const TABLE_HEAD = [
  { id: 'name', label: 'Subject Name', alignRight: false },
  { id: 'typeoftest', label: 'Type Of Test', alignRight: false },
  { id: 'assignedby', label: 'Assigned By', alignRight: false },
  { id: 'assignedon', label: 'Assigned On', alignRight: false },
  { id: 'marksheetstatus', label: 'Marksheet Status', alignRight: false },
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
    label: 'Subject Listing',
  },
  // { value: '2', icon: <Label variant='ghost' color='info' sx={{padding:'16px',width:'45px',borderRadius:'6px'}}><Analytics /></Label>, label: 'Subject Analytics' },
]

export default function TeacherSubjectListing() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [orderBy, setOrderBy] = useState('name')
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const valueTabScrollableTeacher = localStorage.getItem(
    'valueTabScrollableTeacher',
  )
  const [valueScrollable, setValueScrollable] = useState(
    valueTabScrollableTeacher || '1',
  )
  const user = JSON.parse(localStorage.getItem('user'))
  const [singleSchoolData, setSingleSchoolData] = useState({})
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'))
  const id = user?.schoolId || newSchoolId

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

  useEffect(() => {
    fetchSchoolById()
  }, [])

  const handleChangeScrollable = (event, newValue) => {
    setValueScrollable(newValue)
    localStorage.setItem('valueTabScrollableTeacher', newValue)
  }
  const viewType = localStorage.getItem('viewType')

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = staticProducts.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event, name) => {
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

  const filteredProducts = staticProducts.filter((product) =>
    product.name.toLowerCase().includes(filterName.toLowerCase()),
  )

  const isProductNotFound = filteredProducts.length === 0
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);

  const handleGoBack = () => {
    window.history.back()
  }

  const [view, setView] = useState(viewType || 'list')
  const handleChange = (event, nextView) => {
    if (nextView !== null) {
      setView(nextView)
      localStorage.setItem('viewType', nextView)
    }
  }

  return (
    <Page title="Grade Listing | Umbrelytics ">
      <Container>
        {user_type !== 4 && (
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
        )}
        {user_type !== 4 && (
          <HeaderBreadcrumbs
            heading="Michel Cambell’s Details"
            links={[
              {
                name: 'Class Details',
                href: PATH_DASHBOARD.general.gradedetails,
              },
              { name: 'Subject Listing' },
            ]}
            action={
              <Button
                sx={{ whiteSpace: 'nowrap' }}
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                type="button"
                variant="outlined"
                color="inherit"
              >
                Go Back
              </Button>
            }
          />
        )}
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
            {user_type !== 4 && (
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
            )}

            {valueScrollable === '1' && (
              <Stack
                sx={{
                  color: '#fff',
                  mt: { xs: 3.5, sm: 3.5, md: 3 },
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: user_type !== 3 && user_type !== 4 && 3,
                }}
                direction={{ xs: 'row', sm: 'row', md: 'row' }}
              >
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
                  <CustomToggleButton
                    value="module"
                    selected={view === 'module'}
                  >
                    <ViewModule />
                  </CustomToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}

            {valueScrollable === '1' ? (
              view === 'list' ? (
                <Card sx={{ mt: 4 }}>
                  <TeacherSubjectListingToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                  />
                  <Scrollbar>
                    <TableContainer
                      sx={{ minWidth: 800, whiteSpace: 'nowrap' }}
                    >
                      <Table>
                        <TeacherSubjectViewTableHead
                          order={order}
                          orderBy={orderBy}
                          headLabel={TABLE_HEAD}
                          rowCount={staticProducts.length}
                          numSelected={selected.length}
                          onRequestSort={handleRequestSort}
                          onSelectAllClick={handleSelectAllClick}
                        />
                        <TableBody>
                          {filteredProducts
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage,
                            )
                            .map((row) => {
                              const {
                                id,
                                name,
                                marksheet,
                                assignedby,
                                assignedon,
                                typeoftest,
                              } = row

                              const isItemSelected =
                                selected.indexOf(name) !== -1

                              return (
                                <TableRow
                                  hover
                                  key={id}
                                  sx={{ borderBottom: '1.5px solid #e6e6e6' }}
                                >
                                  <TableCell
                                    component="th"
                                    scope="row"
                                    padding="none"
                                  >
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      sx={{ ml: -0.5 }}
                                    >
                                      <ThumbImgStyle
                                        alt={name}
                                        src={Excelicon}
                                      />
                                      <Tooltip title={name}>
                                        <Link
                                          variant="subtitle2"
                                          onClick={() =>
                                            navigate(
                                              PATH_DASHBOARD.general
                                                .teacherSubjectMarksheetView,
                                            )
                                          }
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
                                    <Tooltip title={typeoftest}>
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          ml: -1,
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                        noWrap
                                      >
                                        {typeoftest}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Tooltip title={assignedby}>
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          ml: -0.7,
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                        noWrap
                                      >
                                        {assignedby}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell align="left">
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        ml: 0.2,
                                        maxWidth: 110,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                      noWrap
                                    >
                                      {fDate(assignedon)}
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
                                        (marksheet === 'not yet added' &&
                                          'error') ||
                                        'success'
                                      }
                                    >
                                      {sentenceCase(marksheet)}
                                    </Label>
                                  </TableCell>
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
                    count={staticProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Card>
              ) : (
                <TeacherSubjectGrid staticProducts={staticProducts} />
              )
            ) : (
              <Box sx={{ mt: 3, ml: { xs: -1, sm: -3, md: -3 } }}>
                <TeacherAnalytics />
              </Box>
            )}
          </>
        )}
      </Container>
    </Page>
  )
}

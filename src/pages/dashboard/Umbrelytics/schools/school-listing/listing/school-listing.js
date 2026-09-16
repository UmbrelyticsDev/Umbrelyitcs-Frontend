import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { useDispatch, useSelector } from '../../../../../../redux/store'
import { getUsers } from '../../../../../../redux/slices/user'
import { PATH_DASHBOARD } from '../../../../../../routes/paths'
import Page from '../../../../../../components/Page'
import { UserCard } from '../../../../../../components/_dashboard/user/cards'
import HeaderBreadcrumbs from '../../../../../../components/HeaderBreadcrumbs'
import SchoolCard from './school-card'
import Image from '../../../../../../../src/images/jamaica-high-school-cover.jpg'
import Image1 from '../../../../../../../src/images/york-castle.jpg'
import Image2 from '../../../../../../../src/images/rusea-high-school.jpg'
import Logo from '../../../../../../../src/images/jamaica-high-school-logo.jpg'
import Logo1 from '../../../../../../../src/images/york-castle-logo.png'
import Logo2 from "../../../../../../../src/images/Rusea's_High_School_Logo.png"
import { Add } from '@material-ui/icons'
import { BlogPostsSearch } from 'src/components/_dashboard/blog'
import SchoolSearch from './school-search'
import Page500 from 'src/pages/Page500'
import { useNavigate } from 'react-router'
import { MLinearProgress } from 'src/components/@material-extend'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 23, sm: 40, md: 18, lg: 18 },
}

const staticUsers = [
  {
    id: 1,
    name: 'Jamaica High School',
    email: 'Montego Bay, Jamaica',
    avatarUrl: Logo,
    cover: Image,
    status: 1,
    verified: 2,
  },
  {
    id: 2,
    name: 'York Castle High School',
    email: 'Kingston, Jamaica',
    avatarUrl: Logo1,
    cover: Image1,
    status: 2,
    verified: 1,
  },
  {
    id: 3,
    name: "Rusea's High School",
    email: 'Negril, Jamaica',
    avatarUrl: Logo2,
    cover: Image2,
    status: 1,
    verified: 2,
  },
]
const staticUsersSingle = [
  {
    id: 1,
    name: 'Jamaica High School',
    email: 'Montego Bay, Jamaica',
    avatarUrl: Logo,
    cover: Image,
    status: 1,
    verified: 1,
  },
]

export default function SchoolListing() {
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [searchNotFound, setSearchNotFound] = useState(false)
  const [singleSchoolData, setSingleSchoolData] = useState({})

  const navigate = useNavigate()
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const user = JSON.parse(localStorage.getItem('user'))
  const newSchoolId = JSON.parse(localStorage.getItem('schoolId'))
  const id = user?.schoolId || newSchoolId

  useEffect(() => {
    fetchAllSchool()
    if (id) {
      fetchSchoolById()
    }
  }, [refresh])

  const fetchAllSchool = async () => {
    await axios
      .get(`${REST_API_END_POINT}getSchool`)
      .then((res) => {
        if (res.data.status === 1) {
          console.log('dataaaaaaaaaa', res.data.result)
          setFilteredUsers(res.data.result)
        } else {
          setFilteredUsers([])
        }
      })
      .catch((err) => console.log(err))
  }
  const fetchSchoolById = async () => {
    await axios
      .get(`${REST_API_END_POINT}getSchool-details/${id}`)
      .then((res) => {
        if (res.data.status === 1) {
          console.log(res.data.result, 'reeeee')
          setSingleSchoolData(res.data.result)
        } else {
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setRefresh(!refresh)
      setSearchNotFound(false)
    } else {
      const filtered = filteredUsers?.filter((user) =>
        user?.school_name?.toLowerCase().includes(searchQuery?.toLowerCase()),
      )
      if (filtered.length === 0) {
        setSearchNotFound(true)
      } else {
        setSearchNotFound(false)
      }
      setFilteredUsers(filtered)
    }
  }

  if (loading) {
    return (
      <>
        <Grid sx={{ pl: 7, pr: 7 }}>
          <Box sx={{ alignItems: 'center' }}>
            <MLinearProgress
              sx={{ mt: { xs: 26, sm: 45, md: 27, lg: 27 }, mb: 2 }}
              color="inherit"
            />
          </Box>
          <Box>
            <MLinearProgress sx={{ mt: 2, mb: 2 }} color="warning" />
          </Box>
          <Box>
            <MLinearProgress sx={{ mt: 2, mb: 2 }} color="success" />
          </Box>
          <Box>
            <MLinearProgress sx={{ mt: 2, mb: 2 }} color="inherit" />
          </Box>
        </Grid>
      </>
    )
  }

  return (
    <>
      {user_type === 1 ? (
        <Page title="School Listing | Umbrelytics">
          <Container>
            <HeaderBreadcrumbs
              heading="School Listing"
              links={[
                { name: 'Dashboard', href: PATH_DASHBOARD.root },
                { name: 'School Listing' },
              ]}
              action={
                <Button
                  variant="contained"
                  color="success"
                  sx={{ color: '#fff' }}
                  onClick={() => navigate(PATH_DASHBOARD.general.addSchool)}
                  startIcon={<Add />}
                >
                  Add School
                </Button>
              }
            />
            <SchoolSearch
              sx={{ mb: 4, mt: -2 }}
              staticData={filteredUsers}
              onSearch={handleSearch}
            />

            {searchNotFound ? (
              <Grid sx={{ mt: { xs: 0, sm: -4, md: -15 } }}>
                <Page500 />
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {filteredUsers?.map((user) => (
                  <Grid key={user.id} item xs={12} sm={6} md={4}>
                    <SchoolCard user={user} email={user.email} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Page>
      ) : (
        <Page title="School Details | Umbrelytics">
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
                    variant="h4"
                    sx={{
                      mb: 1,
                      mt: 0.5,
                      ml: 1,
                      cursor: 'pointer',
                      maxWidth: 250,
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
            <HeaderBreadcrumbs
              links={[
                { name: 'School Details' },
                {
                  name: 'Department Listing ',
                  href: PATH_DASHBOARD.general.department,
                },
              ]}
            />
            {/* {staticUsersSingle.map((user) => (
          <SchoolCard user={user} email={user.contact_email} />
        ))} */}

            {singleSchoolData && (
              <SchoolCard
                user={singleSchoolData}
                email={singleSchoolData.contact_email}
              />
            )}
          </Container>
        </Page>
      )}
    </>
  )
}

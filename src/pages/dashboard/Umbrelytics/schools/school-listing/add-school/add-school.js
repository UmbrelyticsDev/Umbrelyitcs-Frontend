import { useEffect, useState } from 'react'
import { paramCase } from 'change-case'
import { useParams, useLocation } from 'react-router-dom'
// material
import { Box, Container, Grid, Paper } from '@material-ui/core'
// redux
import { useDispatch, useSelector } from '../../../../../../redux/store'
import { getUserList } from '../../../../../../redux/slices/user'
// routes
import { PATH_DASHBOARD } from '../../../../../../routes/paths'
// components
import Page from '../../../../../../components/Page'
import HeaderBreadcrumbs from '../../../../../../components/HeaderBreadcrumbs'
import AddSchoolForm from './add-school-form'
import { MLinearProgress } from 'src/components/@material-extend'
import AddHODForm from '../../departments/hod/add-hod/add-hod-form'
import AddTeacherForm from '../../departments/teachers/add-teachers/add-teachers-form'

// ----------------------------------------------------------------------

const style = {
  p: 4,
  minHeight: 160,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  mt: { xs: 19, sm: 35, md: 18, lg: 18 },
}

export default function AddSchool() {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const { name } = useParams()
  const { userList } = useSelector((state) => state.user)
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const isEdit = pathname.includes('edit') || (user_type !== 1 ? true : false)
  // const currentUser = userList.find((user) => paramCase(user.name) === name);
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);
  useEffect(() => {
    dispatch(getUserList())
  }, [dispatch])

  return (
    <Page title="Add School | Umbrelytics ">
      <Container>
        {user_type === 1 ? (
          <HeaderBreadcrumbs
            heading={!isEdit ? 'Add School' : 'Edit School'}
            links={[
              { name: 'School Listing', href: PATH_DASHBOARD.general.schools },
              { name: !isEdit ? 'Add School' : name },
            ]}
          />
        ) : user_type === 2 ? (
          <HeaderBreadcrumbs
            heading={'Update Profile'}
            links={[
              {
                name: 'School Details',
                href: PATH_DASHBOARD.general.schoolDetails,
              },
              { name: 'Update Profile' },
            ]}
          />
        ) : user_type === 3 ? (
          <HeaderBreadcrumbs
            heading={'Update Profile'}
            links={[
              {
                name: 'HOD Details',
                href: PATH_DASHBOARD.general.schoolDetails,
              },
              { name: 'Update Profile' },
            ]}
          />
        ) : user_type === 4 || user_type === 5 ? (
          <HeaderBreadcrumbs
            heading={'Update Profile'}
            links={[
              {
                name: 'Teacher Details',
                href: PATH_DASHBOARD.general.teacherDetails,
              },
              { name: 'Update Profile' },
            ]}
          />
        ) : (
          ''
        )}

        {loading ? (
          <Grid>
            <Paper sx={style}>
              <Box sx={{ width: '100%' }}>
                <MLinearProgress color="inherit" sx={{ mb: 2 }} />
                <MLinearProgress color="warning" sx={{ mt: 2, mb: 2 }} />
                <MLinearProgress color="success" sx={{ mt: 2, mb: 2 }} />
                <MLinearProgress color="inherit" sx={{ mt: 2, mb: 2 }} />
              </Box>
            </Paper>
          </Grid>
        ) : user_type === 1 ? (
          <AddSchoolForm isEdit={isEdit} currentUser={currentUser} />
        ) : user_type === 2 ? (
          <AddSchoolForm isEdit={isEdit} currentUser={currentUser} />
        ) : user_type === 3 ? (
          <AddHODForm />
        ) : user_type === 4 || user_type === 5 ? (
          <AddTeacherForm />
        ) : (
          ''
        )}
      </Container>
    </Page>
  )
}

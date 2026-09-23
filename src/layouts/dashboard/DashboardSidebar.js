import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles'
import {
  Box,
  Link,
  Button,
  Drawer,
  Typography,
  Tooltip,
} from '@material-ui/core'
import { ListItemStyle, ListItemIconStyle } from '../../components/NavSection'
import { ListItemText } from '@material-ui/core'
import logOutFill from '@iconify/icons-eva/log-out-fill'
import { Icon } from '@iconify/react'
// hooks
import useAuth from '../../hooks/useAuth'
// routes
import { PATH_DASHBOARD, PATH_DOCS } from '../../routes/paths'
// components
import MyAvatar from '../../components/MyAvatar'
import Scrollbar from '../../components/Scrollbar'
import NavSection from '../../components/NavSection'
import { MHidden } from '../../components/@material-extend'
import TeachingPhilosophyModal from '../../components/TeachingPhilosophyModal'
import SvgIconStyle from '../../components/SvgIconStyle'
//
import sidebarConfig from './SidebarConfig'
import { DocIcon } from '../../assets'
import Image from '../../../src/images/Teacher1.png'
import Logo from 'src/components/Logo'
import Logo1 from 'src/components/Logo/apple-touch-icon.png'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280

const getIcon = (name) => (
  <SvgIconStyle
    src={`/static/icons/navbar/${name}.svg`}
    sx={{ width: '100%', height: '100%' }}
  />
)

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}))

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: theme.shape.borderRadiusSm,
  backgroundColor: theme.palette.grey[500_12],
}))

const DocStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadiusMd,
  backgroundColor:
    theme.palette.mode === 'light'
      ? alpha(theme.palette.primary.main, 0.08)
      : theme.palette.primary.lighter,
}))

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
}

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const user_type = JSON.parse(localStorage.getItem('user_type'))
  const [singleSchoolData, setSingleSchoolData] = useState(false)
  const schoolId = JSON.parse(localStorage.getItem('schoolId'))
  const id = user?.schoolId || schoolId
  const [image, setImage] = useState('')
  const [teacherData, setTeacherData] = useState([])
  const [hodData, setHodData] = useState([])
  const [philosophyModalOpen, setPhilosophyModalOpen] = useState(false)
  const navigate = useNavigate()

  const fetchSchoolById = async () => {
    await axios
      .get(`${REST_API_END_POINT}getSchool-details/${id}`)
      .then((res) => {
        if (res.data.status === 1) {
          setSingleSchoolData(res.data.result)
          setImage(res.data.result.school_logo)
        } else {
          console.log('not getting data')
        }
      })
      .catch((err) => console.log(err))
  }
  const fetchTeacherDataById = async () => {
    const response = await axios.get(
      `${REST_API_END_POINT}get-teacher-details-for-editing/${user.teacherId}`,
    )
    if (response.data.status === 1) {
      console.log('dataaaaaaaa', response.data.result)
      setImage(response.data.result.image)
      setTeacherData(response.data.result)
    } else {
      console.log('not getting data')
    }
  }
  const fetchHodDataById = async () => {
    const response = await axios.get(
      `${REST_API_END_POINT}get-hod-for-updating/${user.hodId}`,
    )
    if (response.data.status === 1) {
      console.log('dataaaaaaaa', response.data.result)
      setImage(response.data.result.image)
      setHodData(response.data.result)
    } else {
      console.log('not getting data')
    }
  }

  useEffect(() => {
    fetchSchoolById()
    fetchTeacherDataById()
    fetchHodDataById()
  }, [])

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  const renderContent = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Link underline="none">
          <AccountStyle>
            <MyAvatar image={image} />
            <Box sx={{ ml: 2 }}>
              <Tooltip
                title={
                  user_type === 1
                    ? 'Umbrelytics'
                    : user_type === 2
                    ? singleSchoolData?.school_name
                    : user_type === 3
                    ? hodData
                      ? hodData.name
                      : ''
                    : user_type === 4
                    ? teacherData
                      ? teacherData.name
                      : ''
                    : 'Loading....'
                }
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.primary',
                    maxWidth: 130,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {user_type === 1
                    ? 'Umbrelytics'
                    : user_type === 2
                    ? singleSchoolData?.school_name
                    : user_type === 3
                    ? hodData
                      ? hodData.name
                      : ''
                    : user_type === 4
                    ? teacherData
                      ? teacherData.name
                      : ''
                    : 'Loading....'}
                </Typography>
              </Tooltip>
              <Tooltip
                title={
                  user_type === 1
                    ? 'Super Admin'
                    : user_type === 2
                    ? singleSchoolData?.school_email
                    : user_type === 3
                    ? 'HOD'
                    : user_type === 4
                    ? 'Teacher '
                    : 'Loading....'
                }
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    maxWidth: 130,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {user_type === 1
                    ? 'Super Admin'
                    : user_type === 2
                    ? singleSchoolData?.school_email
                    : user_type === 3
                    ? 'HOD '
                    : user_type === 4
                    ? 'Teacher '
                    : 'Loading....'}
                </Typography>
              </Tooltip>
            </Box>
          </AccountStyle>
        </Link>
      </Box>

      <NavSection navConfig={sidebarConfig} />

      {/* Teaching Philosophy - styled as a nav item */}
      {user_type === 4 && (
        <ListItemStyle
          onClick={() => setPhilosophyModalOpen(true)}
          sx={{ cursor: 'pointer' }}
        >
          <ListItemIconStyle>{getIcon('ic_blog')}</ListItemIconStyle>
          <ListItemText disableTypography primary="Philosophy" />
        </ListItemStyle>
      )}

      {/* Lesson Planning - styled as a nav item */}
      {user_type === 4 && (
        <ListItemStyle
          onClick={() =>
            window.open(
              process.env.REACT_APP_TOOL_URL || 'http://localhost:3001',
              '_blank',
            )
          }
          sx={{ cursor: 'pointer' }}
        >
          <ListItemIconStyle>{getIcon('ic_kanban')}</ListItemIconStyle>
          <ListItemText disableTypography primary="Lesson Planner Tool" />
        </ListItemStyle>
      )}

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2.5, pb: 3 }}>
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<Icon icon={logOutFill} />}
          sx={{
            justifyContent: 'flex-start',
            color: 'error.main',
            fontWeight: 500,
            px: 1.5,
            py: 1.25,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'error.lighter',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Scrollbar>
  )

  return (
    <RootStyle>
      <MHidden width="lgUp">
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>

      <MHidden width="lgDown">
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: { width: DRAWER_WIDTH, bgcolor: 'background.default' },
          }}
        >
          {renderContent}
        </Drawer>
      </MHidden>

      {/* Teaching Philosophy Modal */}
      <TeachingPhilosophyModal
        open={philosophyModalOpen}
        onClose={() => setPhilosophyModalOpen(false)}
        teacherId={user?.teacherId}
        currentPhilosophy={teacherData?.teaching_philosophy}
      />
    </RootStyle>
  )
}

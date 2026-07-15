import { Icon } from '@iconify/react'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import homeFill from '@iconify/icons-eva/home-fill'
import personFill from '@iconify/icons-eva/person-fill'
import settings2Fill from '@iconify/icons-eva/settings-2-fill'
import imageFill from '@iconify/icons-eva/image-2-fill'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
// material
import { alpha } from '@material-ui/core/styles'
import {
  Button,
  Box,
  Divider,
  MenuItem,
  Typography,
  Tooltip,
} from '@material-ui/core'
// routes
import { PATH_DASHBOARD } from '../../routes/paths'
// hooks
import useAuth from '../../hooks/useAuth'
import useIsMountedRef from '../../hooks/useIsMountedRef'
// components
import { MIconButton } from '../../components/@material-extend'
import MyAvatar from '../../components/MyAvatar'
import MenuPopover from '../../components/MenuPopover'
import ProfilePictureModal from '../../components/ProfilePictureModal'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// ----------------------------------------------------------------------

const user_type = JSON.parse(localStorage.getItem('user_type'))

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo:
      user_type === 2
        ? '/dashboard/school-details'
        : user_type === 3
        ? '/dashboard/hod-details'
        : user_type === 4
        ? '/dashboard/teacher-details'
        : '',
  },
  {
    label: 'Profile',
    icon: personFill,
    linkTo:
      user_type === 2
        ? PATH_DASHBOARD.general.schoolsProfile
        : user_type === 3
        ? PATH_DASHBOARD.general.hodProfile
        : user_type === 4
        ? PATH_DASHBOARD.general.teacherProfile
        : '',
  },
]

// NEW: Edit picture option - ONLY for teachers
const MENU_OPTIONS_WITH_PICTURE = [
  ...MENU_OPTIONS,
  {
    label: 'Edit Profile Picture',
    icon: imageFill,
    action: 'edit-picture', // Special action instead of linkTo
  },
]

const MENU_OPTIONS1 = [
  {
    label: 'Home',
    icon: homeFill,
    linkTo: '/dashboard/umbrelytics',
  },
]

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null)
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const isMountedRef = useIsMountedRef()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [pictureModalOpen, setPictureModalOpen] = useState(false)
  const [singleSchoolData, setSingleSchoolData] = useState(false)
  const schoolId = JSON.parse(localStorage.getItem('schoolId'))
  const id = user?.schoolId || schoolId
  const [image, setImage] = useState('')
  const [teacherData, setTeacherData] = useState([])
  const [hodData, setHodData] = useState([])

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
      localStorage.setItem('subjectId', response.data.result?.subjects)
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

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleMenuItemClick = (option) => {
    if (option.action === 'edit-picture') {
      setPictureModalOpen(true)
      handleClose()
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      if (isMountedRef.current) {
        handleClose()
      }
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Unable to logout', { variant: 'error' })
    }
  }

  // Choose which menu options to show
  const menuOptions = user_type === 4 ? MENU_OPTIONS_WITH_PICTURE : MENU_OPTIONS

  return (
    <>
      <MIconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.06),
            },
          }),
        }}
      >
        <MyAvatar image={image} />
      </MIconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Tooltip
            title={
              user_type === 1
                ? 'Umbrelytics'
                : user_type === 2
                ? singleSchoolData?.school_name
                : user_type === 3
                ? hodData?.name
                : user_type === 4
                ? teacherData?.name
                : 'Loading....'
            }
          >
            <Typography variant="subtitle1" noWrap>
              {user_type === 1
                ? 'Umbrelytics'
                : user_type === 2
                ? singleSchoolData?.school_name
                : user_type === 3
                ? hodData?.name
                : user_type === 4
                ? teacherData?.name
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
                ? hodData?.email
                : user_type === 4
                ? teacherData?.email
                : 'Loading....'
            }
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {user_type === 1
                ? 'Super Admin'
                : user_type === 2
                ? singleSchoolData?.school_email
                : user_type === 3
                ? hodData?.email
                : user_type === 4
                ? teacherData?.email
                : 'Loading....'}
            </Typography>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 1 }} />

        {user_type !== 1 ? (
          <Box>
            {menuOptions.map((option) => (
              <MenuItem
                key={option.label}
                to={option.linkTo}
                component={option.linkTo ? RouterLink : 'div'}
                onClick={() => {
                  if (option.action === 'edit-picture') {
                    handleMenuItemClick(option)
                  } else {
                    handleClose()
                  }
                }}
                sx={{ typography: 'body2', py: 1, px: 2.5 }}
              >
                <Box
                  component={Icon}
                  icon={option.icon}
                  sx={{
                    mr: 2,
                    width: 24,
                    height: 24,
                  }}
                />

                {option.label}
              </MenuItem>
            ))}
          </Box>
        ) : (
          <Box>
            {MENU_OPTIONS1.map((option) => (
              <MenuItem
                key={option.label}
                to={option.linkTo}
                component={RouterLink}
                onClick={handleClose}
                sx={{ typography: 'body2', py: 1, px: 2.5 }}
              >
                <Box
                  component={Icon}
                  icon={option.icon}
                  sx={{
                    mr: 2,
                    width: 24,
                    height: 24,
                  }}
                />

                {option.label}
              </MenuItem>
            ))}
          </Box>
        )}

        <Box sx={{ p: 2, pt: 1.5 }}>
          <Button
            fullWidth
            color="inherit"
            variant="outlined"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </MenuPopover>

      {/* NEW: Profile Picture Modal */}
      <ProfilePictureModal
        open={pictureModalOpen}
        onClose={() => setPictureModalOpen(false)}
        teacherId={user?.teacherId}
        currentImage={image}
        onImageUpdate={() => fetchTeacherDataById()}
      />
    </>
  )
}

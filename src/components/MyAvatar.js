// hooks
import useAuth from '../hooks/useAuth'
//
import { Person } from '@material-ui/icons'
import { MAvatar } from './@material-extend'
import createAvatar from '../utils/createAvatar'
import Avatar from '../../src/images/avatar_default.jpg'
import Logo from '../../src/images/jamaica-high-school-logo.jpg'
import Image from '../../src/images/HOD1.png'
import Image1 from '../../src/images/Teacher1.png'

// ----------------------------------------------------------------------

export default function MyAvatar({ image, ...other }) {
  const { user } = useAuth()
  const user_type = JSON.parse(localStorage.getItem('user_type'))

  // user_type 1 (super admin) keeps the brand default image; everyone else
  // shows their uploaded photo, or — when none is set — a generic person
  // silhouette on a neutral grey circle (instead of their initials).
  const src = user_type === 1 ? Avatar : image || null
  const hasPhoto = Boolean(src)

  return (
    <MAvatar
      src={src}
      alt="Umbrelytics"
      sx={{ border: '2px solid #e6e6e6' }}
      color="default"
      {...other}
    >
      {!hasPhoto && <Person style={{ width: '65%', height: '65%' }} />}
    </MAvatar>
  )
}

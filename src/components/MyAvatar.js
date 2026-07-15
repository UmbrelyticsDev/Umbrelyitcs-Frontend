// hooks
import useAuth from '../hooks/useAuth';
//
import { MAvatar } from './@material-extend';
import createAvatar from '../utils/createAvatar';
import Avatar from '../../src/images/avatar_default.jpg'
import Logo from '../../src/images/jamaica-high-school-logo.jpg'
import Image from '../../src/images/HOD1.png'
import Image1 from '../../src/images/Teacher1.png'

// ----------------------------------------------------------------------

export default function MyAvatar({image, ...other }) {
  const { user } = useAuth();
  const user_type = JSON.parse(localStorage.getItem('user_type'));

  return (
    <MAvatar
      src={user_type === 1 ? Avatar : user_type === 2 ? image?image:null : user_type === 3 ? image?image :null : user_type === 4 ?image? image : null : Avatar}
      alt='Umbrelytics'
      sx={{border:'2px solid #e6e6e6'}}
      color={user.photoURL ? 'default' : createAvatar(user.displayName).color}
      {...other}
    >
      {createAvatar(user.displayName).name}
    </MAvatar>
  );
}

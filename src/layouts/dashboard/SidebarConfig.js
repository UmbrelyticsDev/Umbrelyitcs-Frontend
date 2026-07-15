// routes
import { PATH_DASHBOARD } from '../../routes/paths'
// components
import SvgIconStyle from '../../components/SvgIconStyle'
import { Home, Person, School } from '@material-ui/icons'
import { Stack } from '@material-ui/core'
import { useEffect } from 'react'

// ----------------------------------------------------------------------

const getIcon = (name) => (
  <SvgIconStyle
    src={`/static/icons/navbar/${name}.svg`}
    sx={{ width: '100%', height: '100%' }}
  />
)

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  user: getIcon('ic_user'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  kanban: getIcon('ic_kanban'),
}
// let [user,setUser]
const user = JSON.parse(localStorage.getItem('user_type'))
console.log('user_type', user)

// useEffect(()=>{

// },[user])

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      ...(user === 1
        ? [
            {
              title: 'Dashboard',
              path: PATH_DASHBOARD.general.app,
              icon: ICONS.dashboard,
            },
            {
              title: 'Schools',
              path: PATH_DASHBOARD.general.schools,
              icon: <Home />,
            },
          ]
        : []),

      ...(user === 2
        ? [
            {
              title: 'Dashboard',
              path: PATH_DASHBOARD.general.dashboardSchool,
              icon: ICONS.dashboard,
            },
            {
              title: 'School Details',
              path: PATH_DASHBOARD.general.schoolDetails,
              icon: <Home />,
            },
            {
              title: 'Departments',
              path: PATH_DASHBOARD.general.department,
              icon: <School />,
            },
          ]
        : []),

      ...(user === 3
        ? [
            {
              title: 'Dashboard',
              path: PATH_DASHBOARD.general.dashboardHOD,
              icon: ICONS.dashboard,
            },
            {
              title: 'HOD Details',
              path: PATH_DASHBOARD.general.hodDetails,
              icon: <Person />,
            },
            {
              title: 'Subject Listing',
              path: PATH_DASHBOARD.general.Departmentsubjects,
              icon: <School />,
            },
          ]
        : []),

      ...(user === 4
        ? [
            {
              title: 'Dashboard',
              path: PATH_DASHBOARD.general.dashboardTeacher,
              icon: ICONS.dashboard,
            },
            {
              title: 'Teacher Details',
              path: PATH_DASHBOARD.general.teacherDetails,
              icon: <Person />,
            },
            {
              title: 'Class Listing',
              path: PATH_DASHBOARD.general.departmentdetails,
              icon: <School />,
            },
            {
              title: 'Timetable',
              path: PATH_DASHBOARD.general.teacherTimetable,
              icon: ICONS.calendar,
            },
          ]
        : []),
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  // {
  //   subheader: 'management',
  //   items: [
  //     // MANAGEMENT : USER
  //     {
  //       title: 'user',
  //       path: PATH_DASHBOARD.user.root,
  //       icon: ICONS.user,
  //       children: [
  //         { title: 'profile', path: PATH_DASHBOARD.user.profile },
  //         { title: 'cards', path: PATH_DASHBOARD.user.cards },
  //         { title: 'list', path: PATH_DASHBOARD.user.list },
  //         { title: 'create', path: PATH_DASHBOARD.user.newUser },
  //         { title: 'edit', path: PATH_DASHBOARD.user.editById },
  //         { title: 'account', path: PATH_DASHBOARD.user.account }
  //       ]
  //     },

  //     // MANAGEMENT : E-COMMERCE
  //     {
  //       title: 'e-commerce',
  //       path: PATH_DASHBOARD.eCommerce.root,
  //       icon: ICONS.cart,
  //       children: [
  //         { title: 'shop', path: PATH_DASHBOARD.eCommerce.shop },
  //         { title: 'product', path: PATH_DASHBOARD.eCommerce.productById },
  //         { title: 'list', path: PATH_DASHBOARD.eCommerce.list },
  //         { title: 'create', path: PATH_DASHBOARD.eCommerce.newProduct },
  //         { title: 'edit', path: PATH_DASHBOARD.eCommerce.editById },
  //         { title: 'checkout', path: PATH_DASHBOARD.eCommerce.checkout },
  //         { title: 'invoice', path: PATH_DASHBOARD.eCommerce.invoice }
  //       ]
  //     },

  //     // MANAGEMENT : BLOG
  //     {
  //       title: 'blog',
  //       path: PATH_DASHBOARD.blog.root,
  //       icon: ICONS.blog,
  //       children: [
  //         { title: 'posts', path: PATH_DASHBOARD.blog.posts },
  //         { title: 'post', path: PATH_DASHBOARD.blog.postById },
  //         { title: 'new post', path: PATH_DASHBOARD.blog.newPost }
  //       ]
  //     }
  //   ]
  // },

  // APP
  // ----------------------------------------------------------------------
  // {
  //   subheader: 'app',
  //   items: [
  //     { title: 'mail', path: PATH_DASHBOARD.mail.root, icon: ICONS.mail },
  //     { title: 'chat', path: PATH_DASHBOARD.chat.root, icon: ICONS.chat },
  //     { title: 'calendar', path: PATH_DASHBOARD.calendar, icon: ICONS.calendar },
  //     { title: 'kanban', path: PATH_DASHBOARD.kanban, icon: ICONS.kanban }
  //   ]
  // }
]

export default sidebarConfig

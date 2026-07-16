import { Suspense, lazy } from 'react'
import { Navigate, useRoutes, useLocation } from 'react-router-dom'
// layouts
import DocsLayout from '../layouts/docs'
import MainLayout from '../layouts/main'
import DashboardLayout from '../layouts/dashboard'
import LogoOnlyLayout from '../layouts/LogoOnlyLayout'
// guards
import GuestGuard from '../guards/GuestGuard'
import AuthGuard from '../guards/AuthGuard'
// import RoleBasedGuard from '../guards/RoleBasedGuard';
// components
import LoadingScreen from '../components/LoadingScreen'

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation()
  const isDashboard = pathname.includes('/dashboard')
  const user = JSON.parse(localStorage.getItem('user_type'))
  console.log('user_type', user)

  return (
    <Suspense
      fallback={
        <LoadingScreen
          sx={{
            ...(!isDashboard && {
              top: 0,
              left: 0,
              width: 1,
              zIndex: 9999,
              position: 'fixed',
            }),
          }}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  )
}

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <Login /> },
        { path: 'register-unprotected', element: <Register /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'change-password', element: <ChangePassword /> },
        { path: 'verify', element: <VerifyCode /> },
      ],
    },

    // Dashboard Routes
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: '/',
          element: <Navigate to="/dashboard/umbrelytics" replace />,
        },
        { path: 'umbrelytics', element: <DashboardUmbrelytics /> },
        { path: 'school-dashboard', element: <DashboardSchool /> },
        { path: 'hod-dashboard', element: <DashboardHOD /> },
        { path: 'teacher-dashboard', element: <DashboardTeacher /> },
        { path: 'teacher-dashboard', element: <DashboardTeacher /> },
        { path: 'teacher-timetable', element: <TeacherTimetable /> },
        // { path: '/', element: <Navigate to="/dashboard/app" replace /> },
        // { path: 'app', element: <GeneralApp /> },
        { path: 'ecommerce', element: <GeneralEcommerce /> },
        { path: 'schools', element: <SchoolListing /> }, //Listing of super admin login
        { path: 'school-details', element: <SchoolListing /> }, //Listing page of school admin login
        { path: 'school-details/profile', element: <AddSchool /> }, // this is the school update profile in school admin login
        { path: 'hod-details/profile', element: <AddSchool /> }, // this is the hod update profile in school hod login
        { path: 'teacher-details/profile', element: <AddSchool /> }, // this is the teacher update profile in teacher login
        {
          path: 'schools/department',
          element: <TabDepartmentAnalyticsListing />,
        },
        {
          path: 'schools/department/grade-listing',
          element: <ClassListingTable />,
        },
        {
          path: 'schools/department/subject-listing',
          element: <SubjectListingTable />,
        },
        {
          path: 'schools/department/department-subject-listing',
          element: <SubjectInsideDepartments />,
        },
        { path: 'schools/department/hod-listing', element: <HODListing /> }, //hod listing school and super admin login
        { path: 'hod-details', element: <HODListing /> }, // hod listing hod login
        {
          path: 'schools/department/teacher-listing',
          element: <TeacherListing />,
        },
        { path: 'teacher-details', element: <AddSchool /> },
        {
          path: 'schools/department/grade-details/teacher-subject-listing',
          element: <TeacherSubjectListing />,
        },
        {
          path: 'schools/department/grade-details/teacher-subject-listing/subject-marksheet-view',
          element: <TeacherSubjectMarksheetView />,
        },
        {
          path: 'schools/department/grade-details/marksheet-view',
          element: <TeacherSubjectMarksheetView />,
        },
        {
          path: 'schools/department/grade-details',
          element: <TabViewClassHOD />,
        },
        {
          path: 'schools/department/grade-details/class-details',
          element: <TabViewTeacherTest />,
        },
        {
          path: 'schools/department/grade-details/class-details/marksheet',
          element: <AddMarksheet />,
        },
        { path: 'schools/add-school', element: <AddSchool /> }, // this is add school form in super admin
        { path: 'schools/edit-school/:id', element: <AddSchool /> }, // this is add school form in super admin
        {
          path: 'analytics',
          element: <GeneralAnalytics />,
        },
        {
          path: 'e-commerce',
          children: [
            {
              path: '/',
              element: <Navigate to="/dashboard/e-commerce/shop" replace />,
            },
            { path: 'shop', element: <EcommerceShop /> },
            { path: 'product/:name', element: <EcommerceProductDetails /> },
            { path: 'list', element: <EcommerceProductList /> },
            { path: 'product/new', element: <EcommerceProductCreate /> },
            { path: 'product/:name/edit', element: <EcommerceProductCreate /> },
            { path: 'checkout', element: <EcommerceCheckout /> },
            { path: 'invoice', element: <EcommerceInvoice /> },
          ],
        },
        {
          path: 'user',
          children: [
            {
              path: '/',
              element: <Navigate to="/dashboard/user/profile" replace />,
            },
            { path: 'profile', element: <UserProfile /> },
            { path: 'cards', element: <UserCards /> },
            { path: 'list', element: <UserList /> },
            { path: 'new', element: <UserCreate /> },
            { path: '/:name/edit', element: <UserCreate /> },
            { path: 'account', element: <UserAccount /> },
          ],
        },
        {
          path: 'blog',
          children: [
            {
              path: '/',
              element: <Navigate to="/dashboard/blog/posts" replace />,
            },
            { path: 'posts', element: <BlogPosts /> },
            { path: 'post/:title', element: <BlogPost /> },
            { path: 'new-post', element: <BlogNewPost /> },
          ],
        },
        {
          path: 'mail',
          children: [
            {
              path: '/',
              element: <Navigate to="/dashboard/mail/all" replace />,
            },
            { path: 'label/:customLabel', element: <Mail /> },
            { path: 'label/:customLabel/:mailId', element: <Mail /> },
            { path: ':systemLabel', element: <Mail /> },
            { path: ':systemLabel/:mailId', element: <Mail /> },
          ],
        },
        {
          path: 'chat',
          children: [
            { path: '/', element: <Chat /> },
            { path: 'new', element: <Chat /> },
            { path: ':conversationKey', element: <Chat /> },
          ],
        },
        { path: 'calendar', element: <Calendar /> },
        // { path: 'kanban', element: <Kanban /> }
      ],
    },

    // Docs Routes
    {
      path: 'docs',
      element: <DocsLayout />,
      children: [
        { path: '/', element: <Navigate to="/docs/introduction" replace /> },
        { path: '*', element: <Docs /> },
      ],
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoon /> },
        { path: 'maintenance', element: <Maintenance /> },
        { path: 'pricing', element: <Pricing /> },
        { path: 'payment', element: <Payment /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    {
      path: '/',
      // element: <Login />,
      element: <MainLayout />,
      children: [
        { path: '/', element: <Login /> },
        // { path: '/', element: <LandingPage /> },
        { path: 'about-us', element: <About /> },
        { path: 'contact-us', element: <Contact /> },
        { path: 'faqs', element: <Faqs /> },
        {
          path: 'components',
          children: [
            { path: '/', element: <ComponentsOverview /> },
            // FOUNDATIONS
            { path: 'color', element: <Color /> },
            { path: 'typography', element: <Typography /> },
            { path: 'shadows', element: <Shadows /> },
            { path: 'grid', element: <Grid /> },
            { path: 'icons', element: <Icons /> },
            // MATERIAL UI
            { path: 'accordion', element: <Accordion /> },
            { path: 'alert', element: <Alert /> },
            { path: 'autocomplete', element: <Autocomplete /> },
            { path: 'avatar', element: <Avatar /> },
            { path: 'badge', element: <Badge /> },
            { path: 'breadcrumbs', element: <Breadcrumb /> },
            { path: 'buttons', element: <Buttons /> },
            { path: 'checkbox', element: <Checkbox /> },
            { path: 'chip', element: <Chip /> },
            { path: 'dialog', element: <Dialog /> },
            { path: 'label', element: <Label /> },
            { path: 'list', element: <List /> },
            { path: 'menu', element: <Menu /> },
            { path: 'pagination', element: <Pagination /> },
            { path: 'pickers', element: <Pickers /> },
            { path: 'popover', element: <Popover /> },
            { path: 'progress', element: <Progress /> },
            { path: 'radio-button', element: <RadioButtons /> },
            { path: 'rating', element: <Rating /> },
            { path: 'slider', element: <Slider /> },
            { path: 'snackbar', element: <Snackbar /> },
            { path: 'stepper', element: <Stepper /> },
            { path: 'switch', element: <Switches /> },
            { path: 'table', element: <Table /> },
            { path: 'tabs', element: <Tabs /> },
            { path: 'textfield', element: <Textfield /> },
            { path: 'timeline', element: <Timeline /> },
            { path: 'tooltip', element: <Tooltip /> },
            { path: 'transfer-list', element: <TransferList /> },
            { path: 'tree-view', element: <TreeView /> },
            // EXTRA COMPONENTS
            { path: 'chart', element: <Charts /> },
            { path: 'map', element: <Map /> },
            { path: 'editor', element: <Editor /> },
            { path: 'copy-to-clipboard', element: <CopyToClipboard /> },
            { path: 'upload', element: <Upload /> },
            { path: 'carousel', element: <Carousel /> },
            { path: 'multi-language', element: <MultiLanguage /> },
            { path: 'animate', element: <Animate /> },
            { path: 'mega-menu', element: <MegaMenu /> },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ])
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/authentication/Login')))
const Register = Loadable(
  lazy(() => import('../pages/authentication/Register')),
)
const ResetPassword = Loadable(
  lazy(() => import('../pages/authentication/ResetPassword')),
)
const ChangePassword = Loadable(
  lazy(() => import('../pages/authentication/changePassword')),
)
const VerifyCode = Loadable(
  lazy(() => import('../pages/authentication/VerifyCode')),
)
// Dashboard
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')))
const DashboardUmbrelytics = Loadable(
  lazy(() => import('../pages/dashboard/Umbrelytics/dashboard/dashboard')),
)
const DashboardSchool = Loadable(
  lazy(() =>
    import('../pages/dashboard/Umbrelytics/dashboard-school/dashboard-school'),
  ),
)
const DashboardHOD = Loadable(
  lazy(() =>
    import('../pages/dashboard/Umbrelytics/dashboard-hod/dashboard-hod'),
  ),
)
const DashboardTeacher = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/dashboard-teacher/dashboard-teacher'
    ),
  ),
)
const TeacherTimetable = Loadable(
  lazy(() =>
    import('../pages/dashboard/Umbrelytics/dashboard-teacher/TeacherTimetable'),
  ),
)
const SchoolListing = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/school-listing/listing/school-listing'
    ),
  ),
)
const DepartmentListingTable = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/departments-table'
    ),
  ),
)
const SubjectInsideDepartments = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/subject-inside-departments/subjects-inside-department'
    ),
  ),
)
const TabDepartmentAnalyticsListing = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/tab-department-listing.js/tab-department-listing'
    ),
  ),
)
const SubjectListingTable = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/subjects/subject-listing-table'
    ),
  ),
)
const ClassListingTable = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/class-listing/class-listing-table'
    ),
  ),
)
const HODListing = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/hod/listing/hod-listing'
    ),
  ),
)
const TeacherListing = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/teachers/listing/teacher-listing'
    ),
  ),
)
const TeacherSubjectListing = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/teachers/teacher-subject-view-table/teacher-subject-view-table'
    ),
  ),
)
const TeacherSubjectMarksheetView = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/teachers/teacher-subject-view-table/teacher-subject-marksheet-view'
    ),
  ),
)
const TabViewClassHOD = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/tab-view-class-hod-department.js/tab-view-class-hod-department'
    ),
  ),
)
const TabViewTeacherTest = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/tab-view-teacher-test/tab-view-teacher-test'
    ),
  ),
)
const AddMarksheet = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/departments/test/marksheet/marksheet-form'
    ),
  ),
)
const AddSchool = Loadable(
  lazy(() =>
    import(
      '../pages/dashboard/Umbrelytics/schools/school-listing/add-school/add-school'
    ),
  ),
)
const GeneralEcommerce = Loadable(
  lazy(() => import('../pages/dashboard/GeneralEcommerce')),
)
const GeneralAnalytics = Loadable(
  lazy(() => import('../pages/dashboard/GeneralAnalytics')),
)
const EcommerceShop = Loadable(
  lazy(() => import('../pages/dashboard/EcommerceShop')),
)
const EcommerceProductDetails = Loadable(
  lazy(() => import('../pages/dashboard/EcommerceProductDetails')),
)
const EcommerceProductList = Loadable(
  lazy(() => import('../pages/dashboard/EcommerceProductList')),
)
const EcommerceProductCreate = Loadable(
  lazy(() => import('../pages/dashboard/EcommerceProductCreate')),
)
const EcommerceCheckout = Loadable(
  lazy(() => import('../pages/dashboard/EcommerceCheckout')),
)
const EcommerceInvoice = Loadable(
  lazy(() => import('../pages/dashboard/EcommerceInvoice')),
)
const BlogPosts = Loadable(lazy(() => import('../pages/dashboard/BlogPosts')))
const BlogPost = Loadable(lazy(() => import('../pages/dashboard/BlogPost')))
const BlogNewPost = Loadable(
  lazy(() => import('../pages/dashboard/BlogNewPost')),
)
const UserProfile = Loadable(
  lazy(() => import('../pages/dashboard/UserProfile')),
)
const UserCards = Loadable(lazy(() => import('../pages/dashboard/UserCards')))
const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')))
const UserAccount = Loadable(
  lazy(() => import('../pages/dashboard/UserAccount')),
)
const UserCreate = Loadable(lazy(() => import('../pages/dashboard/UserCreate')))
const Chat = Loadable(lazy(() => import('../pages/dashboard/Chat')))
const Mail = Loadable(lazy(() => import('../pages/dashboard/Mail')))
const Calendar = Loadable(lazy(() => import('../pages/dashboard/Calendar')))
// const Kanban = Loadable(lazy(() => import('../pages/dashboard/Kanban')));
// Docs
const Docs = Loadable(lazy(() => import('../pages/Docs')))
// Main
const LandingPage = Loadable(lazy(() => import('../pages/LandingPage')))
const About = Loadable(lazy(() => import('../pages/About')))
const Contact = Loadable(lazy(() => import('../pages/Contact')))
const Faqs = Loadable(lazy(() => import('../pages/Faqs')))
const ComingSoon = Loadable(lazy(() => import('../pages/ComingSoon')))
const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')))
const Pricing = Loadable(lazy(() => import('../pages/Pricing')))
const Payment = Loadable(lazy(() => import('../pages/Payment')))
const Page500 = Loadable(lazy(() => import('../pages/Page500')))
const NotFound = Loadable(lazy(() => import('../pages/Page404')))
// Components
const ComponentsOverview = Loadable(
  lazy(() => import('../pages/ComponentsOverview')),
)
const Color = Loadable(
  lazy(() =>
    import('../pages/components-overview/foundations/FoundationColor'),
  ),
)
const Typography = Loadable(
  lazy(() =>
    import('../pages/components-overview/foundations/FoundationTypography'),
  ),
)
const Shadows = Loadable(
  lazy(() =>
    import('../pages/components-overview/foundations/FoundationShadows'),
  ),
)
const Grid = Loadable(
  lazy(() => import('../pages/components-overview/foundations/FoundationGrid')),
)
const Icons = Loadable(
  lazy(() =>
    import('../pages/components-overview/foundations/FoundationIcons'),
  ),
)
const Accordion = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Accordion')),
)
const Alert = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Alert')),
)
const Autocomplete = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Autocomplete')),
)
const Avatar = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Avatar')),
)
const Badge = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Badge')),
)
const Breadcrumb = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Breadcrumb')),
)
const Buttons = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/buttons')),
)
const Checkbox = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Checkboxes')),
)
const Chip = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/chips')),
)
const Dialog = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/dialog')),
)
const Label = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Label')),
)
const List = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Lists')),
)
const Menu = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Menus')),
)
const Pagination = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Pagination')),
)
const Pickers = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/pickers')),
)
const Popover = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Popover')),
)
const Progress = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/progress')),
)
const RadioButtons = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/RadioButtons')),
)
const Rating = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Rating')),
)
const Slider = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Slider')),
)
const Snackbar = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Snackbar')),
)
const Stepper = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/stepper')),
)
const Switches = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Switches')),
)
const Table = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/table')),
)
const Tabs = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Tabs')),
)
const Textfield = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/textfield')),
)
const Timeline = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Timeline')),
)
const Tooltip = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/Tooltip')),
)
const TransferList = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/transfer-list')),
)
const TreeView = Loadable(
  lazy(() => import('../pages/components-overview/material-ui/TreeView')),
)
const Charts = Loadable(
  lazy(() => import('../pages/components-overview/extra/Charts')),
)
const Map = Loadable(
  lazy(() => import('../pages/components-overview/extra/Map')),
)
const Editor = Loadable(
  lazy(() => import('../pages/components-overview/extra/Editor')),
)
const CopyToClipboard = Loadable(
  lazy(() => import('../pages/components-overview/extra/CopyToClipboard')),
)
const Upload = Loadable(
  lazy(() => import('../pages/components-overview/extra/Upload')),
)
const Carousel = Loadable(
  lazy(() => import('../pages/components-overview/extra/Carousel')),
)
const MultiLanguage = Loadable(
  lazy(() => import('../pages/components-overview/extra/MultiLanguage')),
)
const Animate = Loadable(
  lazy(() => import('../pages/components-overview/extra/animate')),
)
const MegaMenu = Loadable(
  lazy(() => import('../pages/components-overview/extra/MegaMenu')),
)

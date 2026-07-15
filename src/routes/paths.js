// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`
}

const ROOTS_AUTH = '/auth'
const ROOTS_DOCS = '/docs'
const ROOTS_DASHBOARD = '/dashboard'

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  register: path(ROOTS_AUTH, '/register'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  ChangePassword: path(ROOTS_AUTH, '/change-password'),
  verify: path(ROOTS_AUTH, '/verify'),
}

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components',
}

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    app: path(ROOTS_DASHBOARD, '/umbrelytics'),
    dashboardSchool: path(ROOTS_DASHBOARD, '/school-dashboard'),
    dashboardHOD: path(ROOTS_DASHBOARD, '/hod-dashboard'),
    dashboardTeacher: path(ROOTS_DASHBOARD, '/teacher-dashboard'),
    schools: path(ROOTS_DASHBOARD, '/schools'),
    schoolDetails: path(ROOTS_DASHBOARD, '/school-details'),
    schoolsProfile: path(ROOTS_DASHBOARD, '/school-details/profile'), //school admin profile
    hodProfile: path(ROOTS_DASHBOARD, '/hod-details/profile'), //hod profile
    teacherProfile: path(ROOTS_DASHBOARD, '/teacher-details/profile'), //teacher profile
    teacherTimetable: path(ROOTS_DASHBOARD, '/teacher-timetable'),
    addSchool: path(ROOTS_DASHBOARD, '/schools/add-school'),
    editSchool: path(ROOTS_DASHBOARD, '/schools/edit-school/:id'),
    department: path(ROOTS_DASHBOARD, '/schools/department'),
    gradeListing: path(ROOTS_DASHBOARD, '/schools/department/grade-listing'),
    subjects: path(ROOTS_DASHBOARD, '/schools/department/subject-listing'),
    Departmentsubjects: path(
      ROOTS_DASHBOARD,
      '/schools/department/department-subject-listing',
    ),
    hodListingSubmenu: path(ROOTS_DASHBOARD, '/schools/department/hod-listing'), //hod listing school and super admin login
    hodDetails: path(ROOTS_DASHBOARD, '/hod-details'), //hod listing hod login
    teacherDetails: path(ROOTS_DASHBOARD, '/teacher-details'), //teacher listing teacher login
    teacherListingSubmenu: path(
      ROOTS_DASHBOARD,
      '/schools/department/teacher-listing',
    ),
    departmentdetails: path(
      ROOTS_DASHBOARD,
      '/schools/department/grade-details',
    ),
    gradedetails: path(
      ROOTS_DASHBOARD,
      '/schools/department/grade-details/class-details',
    ),
    teacherSubjectLisiting: path(
      ROOTS_DASHBOARD,
      '/schools/department/grade-details/teacher-subject-listing',
    ),
    teacherSubjectMarksheetView: path(
      ROOTS_DASHBOARD,
      '/schools/department/grade-details/teacher-subject-listing/subject-marksheet-view',
    ),
    schoolAdminMarksheetView: path(
      ROOTS_DASHBOARD,
      '/schools/department/grade-details/marksheet-view',
    ), //marksheet view page of school admin
    addMarksheet: path(
      ROOTS_DASHBOARD,
      '/schools/department/grade-details/class-details/marksheet',
    ),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    conversation: path(ROOTS_DASHBOARD, '/chat/:conversationKey'),
  },
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    newUser: path(ROOTS_DASHBOARD, '/user/new'),
    editById: path(ROOTS_DASHBOARD, '/user/ada-lindgren/edit'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    product: path(ROOTS_DASHBOARD, '/e-commerce/product/:name'),
    productById: path(
      ROOTS_DASHBOARD,
      '/e-commerce/product/nike-air-force-1-ndestrukt',
    ),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    newProduct: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    editById: path(
      ROOTS_DASHBOARD,
      '/e-commerce/product/nike-blazer-low-77-vintage/edit',
    ),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    invoice: path(ROOTS_DASHBOARD, '/e-commerce/invoice'),
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    post: path(ROOTS_DASHBOARD, '/blog/post/:title'),
    postById: path(
      ROOTS_DASHBOARD,
      '/blog/post/portfolio-review-is-this-portfolio-too-creative',
    ),
    newPost: path(ROOTS_DASHBOARD, '/blog/new-post'),
  },
}

export const PATH_DOCS = {
  root: ROOTS_DOCS,
  introduction: path(ROOTS_DOCS, '/introduction'),
  quickstart: path(ROOTS_DOCS, '/quick-start'),
  package: path(ROOTS_DOCS, '/package'),

  // Theme UI
  color: path(ROOTS_DOCS, '/color'),
  typography: path(ROOTS_DOCS, '/typography'),
  icon: path(ROOTS_DOCS, '/icon'),
  shadows: path(ROOTS_DOCS, '/shadows'),
  components: path(ROOTS_DOCS, '/components'),
  settings: path(ROOTS_DOCS, '/settings'),
  tips: path(ROOTS_DOCS, '/tips'),

  // Development
  routing: path(ROOTS_DOCS, '/routing'),
  environmentVariables: path(ROOTS_DOCS, '/environment-variables'),
  stateManagement: path(ROOTS_DOCS, '/state-management'),
  apiCalls: path(ROOTS_DOCS, '/api-calls'),
  analytics: path(ROOTS_DOCS, '/analytics'),
  authentication: path(ROOTS_DOCS, '/authentication'),
  multiLanguage: path(ROOTS_DOCS, '/multi-language'),
  lazyload: path(ROOTS_DOCS, '/lazyload-image'),
  formHelper: path(ROOTS_DOCS, '/form-helper'),

  // Changelog
  support: path(ROOTS_DOCS, '/support'),
  changelog: path(ROOTS_DOCS, '/changelog'),
}

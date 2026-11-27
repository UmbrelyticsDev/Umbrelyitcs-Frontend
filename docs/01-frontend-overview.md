# 1. Frontend Overview

## 1.1 Stack & the template caveat
- **React 17** on Create React App (`react-scripts` 4; dev needs
  `--openssl-legacy-provider`).
- **MUI v5-alpha** under the `@material-ui/core` namespace (so `sx` works),
  theme via `SettingsContext`.
- **React Router 6** (beta), **axios**, **notistack**, Formik, a (largely unused)
  redux install.
- ⚠️ **Minimal UI admin template.** ~773 JS/JSX files, most of them demo modules
  (ecommerce, chat, kanban, mail, blog, calendar, user demos). **The real app is
  `pages/dashboard/Umbrelytics/*`, `pages/authentication/*`, `guards/`,
  `routes/`, `JWTContext`, and the components those import.** Ignore the rest.

## 1.2 Entry, providers, routing
`index.js → App.js`:
```
App
 └─ SettingsProvider (theme)
      └─ (auth) JWTProvider
           └─ Router → routes/index.js (useRoutes), routes/paths.js (URL constants)
```

## 1.3 Auth (`contexts/JWTContext.js`)
The live auth provider (the Auth0 / Cognito / Firebase contexts are template
leftovers — unused). It holds `{ user, isAuthenticated, isInitialized }` and
`login / register / logout`, stores the JWT in `localStorage` (`accessToken`),
and sets the axios auth header. The shared `JWT_SECRET` means this token is also
accepted by the **tool** backend.

## 1.4 Guards (`guards/`)
Route-level gates, wrapped around elements in `routes/index.js`:
| Guard | Rule |
|---|---|
| `AuthGuard` | Require a logged-in user; else redirect to login. |
| `GuestGuard` | Keep logged-in users out of login/register. |
| `RoleBasedGuard` | Allow only certain `user_type`s. |
| `OnboardingGuard` | Force a teacher to set up at least one class before the app unlocks. |

## 1.5 Layout
`layouts/dashboard/` = `DashboardSidebar` + `DashboardNavbar` + `<Outlet/>`.
`DashboardSidebar` renders `SidebarConfig` (role-filtered nav), plus the
"Teaching Approach" and **Help** items (both open modals), and mounts
`TeachingPhilosophyModal` + `HelpWidget`.

## 1.6 API layer
- **`axios` + `REST_API_END_POINT`** (`constants/Defaultvalues`,
  `…:4000/webservice/`) → the **website** backend; auth via the `accessToken`
  bearer (and the SSO cookie).
- **`_apis_/toolAxios.js`** → the **tool** backend (`:3000`) with the shared
  bearer — used for the teacher's class/timetable data that the tool owns.
- **`_apis_/timetableApi.js`** → the website backend's `/webservice/timetable`
  (the *school* timetable).

## 1.7 User roles
Same `user_type` as the backend (1 Super Admin, 2 School, 3 HOD, 4 Teacher,
5 Independent). The sidebar, guards, and dashboards all branch on it.

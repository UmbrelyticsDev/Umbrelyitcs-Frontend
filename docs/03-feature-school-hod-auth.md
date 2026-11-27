# 3. School / HOD Admin & Auth Pages

## 3.1 School admin — `pages/dashboard/Umbrelytics/dashboard-school/`
For `user_type 2`. Manages the organisation below the school and views analytics.
| File | Role |
|---|---|
| `dashboard-school.js` | School landing — overview + entry to management. |
| `school-details.js` | School profile/details. |
| `department-analytics-carousal.js`, `grade-analytics-carousal.js`, `subject-analytics-carousal.js`, `teacher-subject-analytics-carousal.js` | Analytics carousels over the `*analytics` tables (the add/get/edit-analytics endpoints). |

Creating/editing departments, HODs, teachers, subjects, grades and classes is
done through dialogs that hit the matching `/webservice/add-*`, `edit-*`,
`delete-*`, `update-*-status` endpoints (see backend [04 §4.3]).

## 3.2 HOD — `pages/dashboard/Umbrelytics/dashboard-hod/`
For `user_type 3`. `dashboard-hod.js` + `school-details-hod.js` — a department
head's narrower view (their department's subjects/teachers), backed by the HOD
endpoints (`get-subject-by-hod-id`, HOD-login details).

## 3.3 Authentication — `pages/authentication/`
The auth home for the whole product (the tool redirects here).
| Page | Purpose |
|---|---|
| `Login.js` | Email/password → `POST /webservice/login`; sets the shared JWT. |
| `Register.js` | School/standard registration. |
| `RegisterIndependent.js` | Independent-teacher self-signup → `POST /webservice/register` (verification + admin approval flow). |
| `VerifyCode.js` | Email verification step. |
| `ResetPassword.js` | Forgot-password. |
| `changePassword.js` | Change password (authed). |

`GuestGuard` keeps already-authenticated users out of these pages; on success the
`JWTContext` stores the token and routing sends them to their role's dashboard.

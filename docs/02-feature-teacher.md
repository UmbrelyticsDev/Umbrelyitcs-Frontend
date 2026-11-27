# 2. Teacher Dashboard

The main user-facing app, under
`pages/dashboard/Umbrelytics/dashboard-teacher/`. For `user_type` 4 (school
teacher) and 5 (independent). This is where a teacher manages classes, profile,
salary and account, and jumps into the lesson planner.

## 2.1 Pages
| File | Role |
|---|---|
| `dashboard-teacher.js` | The teacher **home**. Setup CTAs (add classes, teaching approach, teaching environment, action research) driven by what's missing; mounts `TeachingEnvironmentModal` and the `AddClassesDialog`. Widgets: `TodaysClasses`, `RecentLessons`, `RecentNotes`, `NewsUpdates`. |
| `TeacherTimetable.jsx` | The weekly **timetable** — classes + sessions. Calls the **tool** backend (`toolAxios` → `/api/timetables/*`). Click a block → read-only session modal; unified add/edit class modal; Teaching-Environment button; blocks scale text to size. Parallel to the tool's `TimetableManager`. |
| `Onboarding.jsx` | First-run **class setup** (gated by `OnboardingGuard`): add the first class before the app unlocks. |
| `TeacherDetailsView.jsx` | **Read-only** profile — details, subjects/grades, and the salary summary (on demand). |
| `TeacherProfileForm.jsx` | **Edit** profile (Update Profile) — including salary inputs and qualifications (`QualificationsHoverSelect`). |
| `AccountPage.jsx` | **Account / billing** — `GET /account/summary/:teacherId`; independent-full vs school-inherited variants; Upgrade is "coming soon". |
| `salary-tool/` | The **salary calculator** UI (`/salary/*` endpoints via `SalaryCalcService`). |
| `Syllabuses.jsx` | Browse syllabi/curriculum. |
| `TeacherActionResearch.jsx` | Action-research entries (uploads via R2). |
| `TimetableImportModal.jsx` | Excel timetable import. |
| `school-details-teacher.js` | The teacher's school info. |

## 2.2 Key components (real app, in `components/`)
| Component | Role |
|---|---|
| `AddClassesDialog.jsx` | Multi-add + unified edit of classes (talks to the tool backend). Brought to parity with the tool's dialog. |
| `TeachingEnvironmentModal.jsx` | "School settings & surroundings" — reads/writes `teachers.teaching_location_context` via the **tool** API (same field the tool's Teaching-Location modal uses). |
| `TeachingPhilosophyModal.jsx` | Set/edit teaching philosophy → core values. |
| `QualificationsHoverSelect.jsx` | Multi-select qualifications dropdown (portal-rendered so it isn't clipped by the card). |
| `ProfilePictureModal.jsx` | Avatar upload → `POST /upload/avatar/:teacherId` → R2. |
| `ChangePasswordModal.jsx` | Change password. |
| `HelpWidget.jsx` | Support modal (opened from the sidebar Help item) → `POST /webservice/support`. |
| `FloatingNotebook.jsx`, `RecentNotes.jsx`, `RecentLessons.jsx`, `TodaysClasses.jsx`, `NewsUpdates.jsx` | Dashboard widgets. |

## 2.3 Where each talks
- Class & timetable data → **tool** backend (`toolAxios`, `:3000`) — the tool owns
  `teacher_classes` / `teacher_timetable`.
- Profile, salary, account, uploads, support → **website** backend
  (`REST_API_END_POINT`, `:4000`).
- The teacher reaches the **lesson planner** by navigating to the tool frontend
  (shared SSO, so no re-login).

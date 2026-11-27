# 4. End-to-End Flows (Website)

`WEB-FE` = `Umbrelyitcs-Frontend`, `WEB-BE` = `Umbrelytics-Backend`,
`TOOL` = the lesson tool. Companion: the tool-side flows in
[`UMBLPTOOL-1/docs/09-end-to-end-flows.md`](../../UMBLPTOOL-1/docs/09-end-to-end-flows.md).

## 4.1 Login & SSO
```
WEB-FE Login → POST /webservice/login
WEB-BE verify bcrypt password, issue JWT (shared secret), set auth_token cookie
WEB-FE JWTContext stores accessToken; routing → role dashboard
→ the same token is accepted by TOOL backend, so opening the planner needs no re-login
```

## 4.2 Independent teacher registration
```
WEB-FE RegisterIndependent → POST /webservice/register (rate-limited)
WEB-BE create account under the "Independent Educators" sentinel school,
       mailer.sendVerificationEmail (Resend)
Teacher clicks the email link → GET /webservice/verify-email
WEB-BE mark pending-approval, email the admin (sendAdminApprovalEmail) + the teacher (pending notice)
Admin → GET /webservice/approve → POST /approve/confirm
WEB-BE activate, sendApprovedEmail ; (also TeacherSyncService provisions the tool user)
Teacher logs in → onboarding (add first class) → full access
```

## 4.3 School timetable → every teacher's planner
```
WEB-FE (school admin) builds the school timetable (periods + entries)
   → /webservice/timetable/* (school_periods, school_timetable)
WEB-FE Publish → POST /webservice/timetable/publish
WEB-BE TimetablePublishService → TOOL /api/internal/publish-timetable
TOOL writes teacher_timetable rows (source='school')
→ each teacher sees the schedule in their tool timetable and plans from it
```

## 4.4 Salary
```
WEB-FE salary-tool / TeacherProfileForm
   GET /salary/classifications → options
   POST /salary/calculate (+ /revised) → SalaryCalcService (bands/points/tax, salaryConfig)
   POST /salary/profile/:teacherId → save (teacher_salary)
   GET /salary/summary/:teacherId → read-only summary in Teacher Details
```

## 4.5 Account / billing
```
WEB-FE AccountPage → GET /webservice/account/summary/:teacherId
WEB-BE lazy-provision an account_subscription (independent-own vs school-inherited),
       return plan + credit state (credit_ledger). Upgrade is "coming soon".
```

## 4.6 Help / Support (shared)
```
WEB-FE (or TOOL-FE) Help modal → POST /webservice/support
WEB-BE authenticate (shared JWT) → mailer.sendSupportEmail (Resend) → admin inbox, reply_to = sender
```

## 4.7 Uploads
```
WEB-FE ProfilePictureModal / action research → POST /webservice/upload/* 
WEB-BE r2Storage → Cloudflare R2 (keys under avatars/ or action-research/) → public URL
```

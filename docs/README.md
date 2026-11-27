# Umbrelytics Frontend — Manual

> 🗺️ **New here? Start with the [system map](../../UMBLPTOOL-1/docs/00-SYSTEM.md)** — how the two apps and four repos fit together.

The web UI for the Umbrelytics website. **React 17** (CRA), **MUI v5-alpha**
(imported as `@material-ui`, so the `sx` prop works), **React Router 6**, JWT
auth. Built on the **Minimal UI** admin template — so most of the file tree is
demo boilerplate; the real app is a subset (see [01](01-frontend-overview.md)).

> Backend + system overview: **`Umbrelytics-Backend/docs/`**
> ([README](../../Umbrelytics-Backend/docs/README.md)). The companion tool is in
> `UMBLPTOOL-1/docs/` / `lesson-planner-frontend/docs/`.

## Contents
1. [Frontend overview](01-frontend-overview.md) — stack, routing, guards, auth, API layer, the template caveat.
2. [Teacher dashboard](02-feature-teacher.md) — the main user app: timetable, profile, salary, account, onboarding, action research.
3. [School / HOD admin & auth](03-feature-school-hod-auth.md) — management dashboards and the auth pages.
4. [End-to-end flows](04-end-to-end-flows.md) — login/SSO, independent registration, timetable publish, salary, support.

> Depth: **architecture + module guide**. Code wins when they disagree.

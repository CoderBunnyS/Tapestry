# Daily Record

The Daily Record is Tapestry's first complete vertical slice. It should be useful on its own before the rest of the life modules are built.

## Product contract

A day preserves both intent and reality. Editing what happened must not erase what was originally planned.

### Day navigation

- Open today or any past/future date.
- Move one day backward or forward.
- Jump back to today.
- A new date starts as a clean Daily Record.

### Agenda

- Add, edit, and delete plans.
- Mark a plan planned, completed, changed, or skipped.
- Store an exact planned start time when known.
- Store an estimated duration.
- Show calculable open gaps between timed plans.
- Store actual duration.
- Preserve the original title/time/estimate after a plan is changed.
- Log an actual timeline entry directly from a plan and link the two records.

### What happened

- Capture task, meal, health, expense, person/interaction, and note entries.
- Store actual time, duration, details, and optional related plan.
- Edit and delete entries.
- Keep the LifeLink foundation for future People, Places, Projects, Food, Accounts, and custom Life Areas.

### Daily context

- Daily notes.
- Reflection.
- Optional mood 1-10.
- Optional energy 1-10.
- At-a-glance counts and planned-vs-tracked time.

### Persistence

- `GET /api/daily-records/:date` returns the record for a date or a clean record if none exists.
- `PUT /api/daily-records/:date` upserts the complete record.
- MongoDB is the durable source of truth when configured.
- The browser keeps a per-date cache so local development remains usable if MongoDB is unavailable. The UI clearly labels this state as `Local only`.

### Appearance

- Tapestry owns its own theme preference: Dark, Light, or System.
- The preference is available from inside the app rather than requiring a phone setting change.
- Theme preference remains local UI state until user accounts/preferences are introduced.

## Launch gate

Before real personal data is put on a public internet deployment, add access control. The Daily Record contains private life data and should not be deployed as an unauthenticated public app.

After access control is chosen, deployment should use one origin for the built React client and Express API, with `MONGODB_URI` supplied by the hosting environment.

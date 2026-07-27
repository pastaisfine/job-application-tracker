# Job Application Tracker Architecture

## Product shape

The application is a single-user job-search kanban board. Each authenticated
user owns one `Job Hunt` board, the board owns ordered columns, and each column
contains ordered job applications. New accounts receive five default columns.

## Technology stack

- **Next.js 16 App Router** and **React 19** provide server rendering, routing,
  Server Actions, streaming, and client components.
- **TypeScript 5** runs in strict mode.
- **MongoDB** is the data store. **Mongoose 9** models product data, while the
  native MongoDB driver supports the Better Auth adapter.
- **Better Auth** provides email/password authentication and React session
  helpers.
- **Tailwind CSS 4**, **shadcn/Base UI**, and **Lucide** provide styling,
  accessible primitives, and icons.
- **dnd-kit** implements drag-and-drop and sortable job cards.

## Runtime boundaries

`app/dashboard/page.tsx` is the server-side composition root for the board. It
reads the session, loads and populates the user's Mongoose board, serializes the
documents, and passes plain data into the client-side `KanbanBoard`.

`components/kanban-board.tsx`, dialog components, job cards, and `useBoard`
are client-side because they own interactive state, drag sensors, menus, and
optimistic UI.

Files under `lib/actions/` are Next.js Server Actions. They are callable from
the client but execute only on the server. Every action must authenticate the
request, derive ownership from the session, validate database relationships,
mutate MongoDB, and revalidate `/dashboard`.

## Data model

```text
Better Auth user
    |
    | userId
    v
Board
    | columns: ObjectId[]
    v
Column
    | boardId
    | jobApplications: ObjectId[]
    v
JobApplication
      boardId + columnId + userId
```

Both parent arrays and child foreign keys are stored. This makes population and
ordered rendering straightforward, but mutations must keep both sides in sync.
The server remains the authority for ownership and relationship checks.

## Main flows

### Account creation

Better Auth creates the user, then its database hook calls
`initializeUserBoard`. That function creates a `Job Hunt` board and its
default columns.

### Dashboard read

The proxy rejects unauthenticated dashboard requests. The dashboard checks the
session again, queries the user's board, populates columns and applications,
and streams the interactive board through a Suspense boundary.

### Job mutation

Create, update, move, and delete operations call Server Actions in
`lib/actions/job-application.ts`. Moving a job updates both column reference
arrays and the job's `columnId`, while numeric `order` values determine
display position. `useBoard` immediately mirrors moves locally; revalidation
reconciles the client with MongoDB.

### Column deletion

The column menu opens a controlled confirmation dialog. The server action:

1. authenticates the user;
2. resolves the column and verifies ownership through its board;
3. atomically refuses to remove the board's final column;
4. removes the column reference from the board;
5. deletes every owned job in that column;
6. deletes the column and revalidates the dashboard.

The client removes the column only after the action reports success. Failure
leaves the UI intact and displays an actionable error in the dialog.

## Styling and interaction

Global design tokens live in `app/globals.css`. Reusable controls are in
`components/ui/`; feature components compose those primitives. The dashboard
uses a warm neutral canvas, strong stage colors, stable column widths, job
counts, empty drop targets, and horizontal snap scrolling on narrow screens.

## Current architectural risks

- Parent reference arrays and child foreign keys can drift if a multi-step
  mutation fails midway. MongoDB transactions would strengthen atomicity when
  the deployment uses a replica set.
- The dashboard cache is personalized by `userId`; mutations rely on
  `revalidatePath("/dashboard")` for immediate reconciliation.
- Job ordering performs multiple writes and should eventually be consolidated
  into a bulk write for larger boards.
- UI types duplicate parts of the Mongoose model shape. A validated
  serialization boundary would reduce drift.
- There is no automated test suite yet, so linting and production builds are
  the current regression gates.

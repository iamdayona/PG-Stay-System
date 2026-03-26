# Copilot Instructions for PG Stay System

## Project Overview
A full-stack web application (Express + React) for managing and discovering paying guest accommodations. Users have three distinct roles: **tenant** (search for PGs), **owner** (manage listings), and **admin** (platform oversight). Role determines UI dashboards, API access, and feature availability.

## Architecture & Key Components

### Backend (Express.js + MongoDB)
- **server.js**: Configures Express app, middleware (CORS, rate limiting), and route mounting. Auth endpoints (`/api/auth`) have rate limiting (10 attempts per 15 min).
- **middleware/auth.js**: Two functions—`protect` (JWT verification) and `authorize` (role-based access). Tokens validated from `Authorization: Bearer <token>` header. Suspended users (isActive=false) blocked.
- **Models**: Role-specific schemas. User has `preferences` (tenant), `trustScore`, `verificationStatus`. PGStay, Room, Application, Feedback tied together via foreign keys.
- **Controllers**: One per domain (auth, pg, room, application, feedback, notification, complaint, admin). Follow pattern: accept `req.body/query`, query MongoDB, send JSON response.
- **Routes**: Mounted under `/api/*`. Protected routes use `protect` middleware; role-gated routes chain` authorize("role")`. Example: `router.get("/:id", protect, authorize("tenant"), getApplicationDetails)`.
- **Utils**: 
  - `trustScore.js`: `recalcPGTrustScore(pgId)` updates a PG's trust score from avg feedback rating (1-5 stars → 20-100 scale, fallback 50).
  - `createNotification.js`: Fire-and-forget utility. Non-critical; silently logs errors rather than crashing.

### Frontend (React + Vite)
- **App.jsx**: Centralized routing. Three page layers: public (Home, About), auth-gated (role-specific dashboards), role-guarded (ProtectedRoute component).
- **context/RoleProvider.jsx & RoleContext**: Stores user role in React state + localStorage. Restored on page refresh via `getUser()`.
- **ProtectedRoute & PublicRoute**: Guard components. ProtectedRoute redirects unauthenticated users to `/login`; PublicRoute redirects already-logged-in users to dashboard.
- **utils/api.js**: Centralized fetch wrapper. Manages token in Authorization header, auto-logout on 401 responses, wraps all backend calls. Export functions by domain: `apiLogin()`, `apiGetPGs()`, `apiCreateApplication()`, etc.

## Critical Data Flows

### Authentication
1. User submits email + password + role (tenant/owner) to `/api/auth/register` or `/api/auth/login`.
2. Backend validates, hashes password (bcryptjs), creates User doc, returns JWT (7-day expiry) + user object.
3. Frontend stores token + user in localStorage, sets RoleContext role.
4. Subsequent requests send token as Bearer header; backend `protect` middleware validates and attaches user to `req.user`.

### Role-Based Access
- Model: `user.role` (enum: "tenant", "owner", "admin") determines controller access + UI dashboards.
- Backend: `authorize("tenant")` middleware checks `req.user.role`.
- Frontend: `ProtectedRoute` redirects based on stored role; role-specific pages only imported under role-specific routes.

### Trust Score System
- PG owners + tenants have `trustScore` (0–100, default 50).
- PG score recalculated after each feedback: `avg(all_feedback_ratings) * 20`.
- Recommendation engine (`pgController.getRecommendations`) sorts by matchScore = trustScore + amenity bonuses.
- User feedback (5-star) → Feedback doc created → Trust score updated via `recalcPGTrustScore()`.

### Notification Pattern
- Any controller action creating an event (application received, booking approved, etc.) calls `createNotification(userId, message, type)`.
- Notification model: `{ user, message, type, createdAt }`.
- Type enum: "application", "success", "alert", "info".
- **Critical**: Non-blocking; errors silently logged. Never throw from createNotification—allows primary action to succeed even if notification fails.

## Project-Specific Patterns & Conventions

### Controller Pattern
```javascript
exports.actionName = async (req, res) => {
  try {
    // Extract/validate input
    const { field } = req.body;
    if (!field) return res.status(400).json({ message: "Field required" });
    
    // Query/mutate
    const doc = await Model.findByIdAndUpdate(id, { field }, { new: true });
    
    // Respond
    res.json({ data: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```
- Always wrap in try-catch.
- Return early on validation failure with status 400.
- Catch errors default to 500 + err.message.
- Return `{ data: ... }` or `{ message: "..." }`.

### MongoDB Connection
- Defined in `backend/config/db.js`; called once in `server.js`.
- Connection string: `process.env.MONGO_URI`.
- Models use Mongoose validation + schema-level enums.

### Environment Variables (Backend)
- `.env` file at backend root. Required keys:
  - `MONGO_URI`: MongoDB connection string.
  - `JWT_SECRET`: Secret for signing JWTs (7-day expiry).
  - `PORT`: Server port (default 5000).
  - Optional: `TWILIO_*`, `SENDGRID_*` (notifications/email).

### Frontend API Calls
- Use `utils/api.js` exports, never raw fetch.
- Example: `const result = await apiGetAllPGs("?location=NYC")` wraps token injection + error handling.
- 401 responses auto-redirect to `/login`.

### Frontend Build & Dev
- Vite dev server: `npm run dev` (default port 5173).
- Build: `vite build` → `dist/` folder.
- Backend CORS configured for `localhost:5173` + `localhost:5174`.

## Developer Workflows

### Setup & Run
**Backend:**
```bash
cd backend
npm install
npm run dev  # Runs on port 5000 with nodemon auto-reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

### Testing & Debugging
- Backend: Check `server.js` PORT env var; MongoDB connection logged to console.
- Frontend: `npm run lint` (ESLint); check browser console + network tab for API errors.
- Auth errors: Check JWT_SECRET matches between token generation and verification.
- Trust score: Verify Feedback docs exist; manually call `recalcPGTrustScore(pgId)` if needed.

## Common Extension Points

- **New Role?**: Add to User schema enum, create role-specific dashboard page, guard routes with `authorize("newRole")`.
- **New Notification Type?**: Add to Notification schema type enum; call `createNotification(userId, msg, "newType")` from relevant controller.
- **New Filter/Search?**: Extend query params in getAllPGs; add filters to frontend TenantFindPGs page.
- **New Third-Party Integration** (SMS, Email): Use Twilio/Nodemailer patterns in controllers; env vars in .env.

## Edge Cases & Gotchas
- **Suspended Users**: `protect` middleware checks `req.user.isActive`; suspended users get 403.
- **Token Expiry**: 7 days; frontend auto-redirects on 401 (expired/invalid token).
- **Notification Failures**: Non-critical; primary action succeeds even if notification fails—check logs if notifications missing.
- **Rate Limiting**: Auth endpoints only (`/api/auth`) have 10-request limit per 15 min.
- **CORS**: Frontend must run on `localhost:5173` or `localhost:5174` or be added to backend CORS origin list.

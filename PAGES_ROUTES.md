# Alumni Directory - All Pages & Routes

## 🏠 Public Pages

### 1. Landing Page
- **Route:** `/`
- **File:** `web/src/app/page.tsx`
- **Description:** Home page with hero section, features, and CTA
- **Access:** Public (redirects if logged in)

### 2. Login Page
- **Route:** `/login`
- **File:** `web/src/app/(auth)/login/page.tsx`
- **Description:** Login with Password, Magic Link, or Admin Invite
- **Access:** Public

### 3. Register Page
- **Route:** `/register`
- **File:** `web/src/app/(auth)/register/page.tsx`
- **Description:** Self-registration for new alumni
- **Access:** Public

## 👤 User Pages (Requires Login)

### 4. Profile Setup Page
- **Route:** `/profile/setup`
- **File:** `web/src/app/(app)/profile/setup/page.tsx`
- **Description:** New users fill their alumni profile details (saved to staging)
- **Access:** Authenticated users (new/unapproved)

### 5. Profile Pending Page
- **Route:** `/profile/pending`
- **File:** `web/src/app/(app)/profile/pending/page.tsx`
- **Description:** Shows approval pending/rejected status
- **Access:** Authenticated users (pending/rejected status)

### 6. Profile Page (Edit Own Profile)
- **Route:** `/profile`
- **File:** `web/src/app/(app)/profile/page.tsx`
- **Description:** View and edit your own profile
- **Access:** Authenticated users (approved)

### 7. Alumni List Page
- **Route:** `/alumni`
- **File:** `web/src/app/(app)/alumni/page.tsx`
- **Description:** Browse and search all approved alumni
- **Access:** Authenticated users (approved)

### 8. Alumni Detail Page
- **Route:** `/alumni/[id]`
- **File:** `web/src/app/(app)/alumni/[id]/page.tsx`
- **Description:** View detailed profile of a specific alumni
- **Access:** Authenticated users (approved)

## 🔐 Admin Pages (Requires Admin Role)

### 9. Admin Panel - Pending Approvals
- **Route:** `/admin/alumni`
- **File:** `web/src/app/(admin)/admin/alumni/page.tsx`
- **Description:** Review and approve/reject pending alumni submissions
- **Access:** Admin only

### 10. Admin Panel - Import Alumni
- **Route:** `/admin/import`
- **File:** `web/src/app/(admin)/admin/import/page.tsx`
- **Description:** Upload CSV/Excel to import alumni data
- **Access:** Admin only

### 11. Admin Panel - Send Invites
- **Route:** `/admin/invites`
- **File:** `web/src/app/(admin)/admin/invites/page.tsx`
- **Description:** Generate and send invite codes to imported alumni
- **Access:** Admin only

## 🔗 Invite & Auth Pages

### 12. Invite Claim Page
- **Route:** `/invite/claim?code=...`
- **File:** `web/src/app/invite/claim/page.tsx`
- **Description:** Users claim their invite code and get redirected to login
- **Access:** Public (with invite code)

### 13. Auth Confirm Page
- **Route:** `/auth/confirm?token_hash=...&type=...`
- **File:** `web/src/app/auth/confirm/route.ts`
- **Description:** Handles email confirmation and magic link authentication
- **Access:** Public (via email links)

## 📋 API Routes

### 14. Approval Promote API
- **Route:** `/api/approval/promote`
- **File:** `web/src/app/api/approval/promote/route.ts`
- **Description:** Promote staged data to main tables (admin action)

### 15. Approval Reject API
- **Route:** `/api/approval/reject`
- **File:** `web/src/app/api/approval/reject/route.ts`
- **Description:** Reject and delete staged data (admin action)

### 16. Import Commit API
- **Route:** `/api/import/commit`
- **File:** `web/src/app/api/import/commit/route.ts`
- **Description:** Commit parsed CSV data to database (admin action)

## 🎨 Components

### Shared Components:
- `Navbar.tsx` - Navigation bar for landing page
- `AlumniCard.tsx` - Card component for alumni list
- `SearchBar.tsx` - Search functionality
- `AvatarUploader.tsx` - Avatar upload component
- `AdminNav.tsx` - Admin sidebar navigation

### Form Components:
- `profile-setup-form.tsx` - Profile setup form (staging)
- `profile-edit-form.tsx` - Profile edit form (approved users)
- `upload-client.tsx` - CSV upload and preview

---

## 🔄 User Flow

### New User Registration:
1. `/register` → Register with email/password
2. Email confirmation → `/auth/confirm`
3. Login → `/login`
4. Profile setup → `/profile/setup` (saves to staging)
5. Approval pending → `/profile/pending`
6. Admin approves → `/admin/alumni` (admin action)
7. Profile approved → `/alumni` (can browse)

### Admin Invited User:
1. Admin imports CSV → `/admin/import`
2. Admin generates invite → `/admin/invites`
3. User clicks invite link → `/invite/claim?code=...`
4. Login with invite → `/login` (Admin Invite tab)
5. Magic link sent → Email confirmation
6. Profile setup → `/profile/setup`
7. Admin approves → `/admin/alumni`
8. Profile approved → `/alumni`

### Admin Flow:
1. Login → `/login` (password)
2. Admin check → Redirects to `/admin/alumni`
3. Manage approvals → `/admin/alumni`
4. Import data → `/admin/import`
5. Send invites → `/admin/invites`

---

## 📝 Notes

- All routes are protected by authentication middleware
- Admin routes require `is_admin = true` in profiles table
- Staging tables are used for pending approvals
- RLS policies enforce data access rules
- Server actions handle form submissions
- Client components handle animations and interactions


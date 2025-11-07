# Image Upload Implementation for Create Alumni

## Overview
Image upload functionality has been added to the `/admin/create-alumni` page with proper Supabase storage handling.

## Features Implemented

### 1. AdminImageUploader Component (`src/components/AdminImageUploader.tsx`)
- **File Size Limit**: Maximum 1MB
- **Allowed Formats**: JPG, JPEG, PNG, WebP
- **Validation**: Client-side validation before upload
- **Preview**: Real-time image preview before saving
- **Error Handling**: Clear error messages for validation failures

### 2. Create Alumni Page Updates
- Added image upload field in the "Basic Information" section
- Image is uploaded to Supabase storage before form submission
- Image path is stored in form state and sent to API

### 3. API Route Updates (`src/app/api/admin/create-alumni/route.ts`)
- Accepts `avatarUrl` in request body
- Stores `avatar_url` in `imported_alumni` table
- All other profile fields are also properly stored

### 4. Database Migration
- Created `migrations_add_avatar_url.sql` to add `avatar_url` column to `imported_alumni` table
- Run this migration in your Supabase database

### 5. Profile Setup Integration
- Updated `profile-setup-form.tsx` to load `avatar_url` from `imported_alumni` when user accepts invite
- Automatically sets the avatar in user's profile when they complete setup

## Image Storage Details

### Storage Location
- **Bucket**: `avatars` (public bucket)
- **Path Format**: `{userId}/avatar.{ext}` or `temp_{timestamp}_{random}/avatar.{ext}` for temporary uploads
- **Public Access**: Images are publicly accessible via Supabase storage URLs

### Image Usage
The uploaded image works everywhere in the application:
- ✅ Alumni Directory (`/alumni`)
- ✅ Individual Alumni Profiles (`/alumni/[id]`)
- ✅ User Profile Page (`/profile`)
- ✅ Profile Edit Form
- ✅ All components using `Avatar` component

## How It Works

1. **Admin Uploads Image**:
   - Admin selects image (max 1MB, JPG/PNG/WebP)
   - Image is validated client-side
   - Preview is shown
   - On "Save Image" click, image is uploaded to Supabase storage
   - Storage path is stored in form state

2. **Form Submission**:
   - Image path is sent to API along with other alumni data
   - API stores `avatar_url` in `imported_alumni` table

3. **User Accepts Invite**:
   - When user accepts invite and completes profile setup
   - `avatar_url` from `imported_alumni` is loaded
   - Avatar is automatically set in user's profile
   - Image path is copied from temporary location to user's folder (if needed)

4. **Image Display**:
   - All pages use `getAvatarPublicUrl` utility function
   - Converts storage paths to public URLs
   - Handles both full URLs and storage paths

## Database Setup

Run the migration to add the `avatar_url` column:

```sql
-- Run migrations_add_avatar_url.sql in Supabase SQL Editor
```

Or manually add the column:

```sql
ALTER TABLE public.imported_alumni 
ADD COLUMN IF NOT EXISTS avatar_url text;
```

## Storage Policies

Ensure these storage policies exist in Supabase:

1. **Public Read**: Anyone can read from `avatars` bucket
2. **Authenticated Upload**: Authenticated users can upload to `avatars` bucket
3. **User Update/Delete**: Users can update/delete their own avatars

These policies should already exist from the initial setup.

## Testing Checklist

- [ ] Upload image < 1MB (should work)
- [ ] Upload image > 1MB (should show error)
- [ ] Upload invalid file type (should show error)
- [ ] Preview shows correctly
- [ ] Image saves to Supabase storage
- [ ] Image path stored in `imported_alumni` table
- [ ] Image appears when user accepts invite
- [ ] Image displays in alumni directory
- [ ] Image displays in profile pages

## Notes

- Only **1 image** can be uploaded per alumni
- Image is **automatically replaced** if a new one is uploaded
- Old images are **automatically deleted** from storage when replaced
- Image works **everywhere** in the application once uploaded


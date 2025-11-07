# Supabase Storage Bucket Setup Instructions

## Problem

"Bucket not found" error when trying to upload images.

## Solution

Create the `avatars` storage bucket in Supabase.

## Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**

   - Open your Supabase project
   - Navigate to **Storage** in the left sidebar

2. **Create New Bucket**

   - Click **"New bucket"** button
   - **Bucket name**: `avatars`
   - **Public bucket**: ✅ Check this (important!)
   - Click **"Create bucket"**

3. **Set Storage Policies** (Important!)

   - Click on the `avatars` bucket
   - Go to **"Policies"** tab
   - Click **"New Policy"**

   **Policy 1: Public Read**

   - Policy name: `Public read avatars`
   - Allowed operation: `SELECT`
   - Policy definition:
     ```sql
     bucket_id = 'avatars'
     ```

   **Policy 2: Authenticated Upload**

   - Policy name: `Users upload avatars`
   - Allowed operation: `INSERT`
   - Policy definition:
     ```sql
     bucket_id = 'avatars'
     ```

   **Policy 3: Update**

   - Policy name: `Users update avatars`
   - Allowed operation: `UPDATE`
   - Policy definition:
     ```sql
     bucket_id = 'avatars'
     ```

   **Policy 4: Delete**

   - Policy name: `Users delete avatars`
   - Allowed operation: `DELETE`
   - Policy definition:
     ```sql
     bucket_id = 'avatars'
     ```

### Option 2: Using SQL Editor (Faster)

1. **Go to Supabase SQL Editor**

   - Open your Supabase project
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the SQL Script**

   - Open the file `setup_avatars_bucket.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter`

3. **Verify**
   - Go to **Storage** → You should see `avatars` bucket
   - Check that it's marked as **Public**

## Verification

After setup, test the image upload:

1. Go to `/admin/create-alumni`
2. Try uploading an image
3. The "Bucket not found" error should be gone

## Troubleshooting

### Still getting "Bucket not found"?

- Make sure bucket name is exactly `avatars` (lowercase)
- Check that bucket is marked as **Public**
- Verify policies are created correctly
- Refresh the page and try again

### "Permission denied" error?

- Check that storage policies are set up correctly
- Make sure you're logged in as an authenticated user
- Verify the policies allow INSERT operation

### Images not displaying?

- Check that bucket is **Public**
- Verify the "Public read avatars" policy exists
- Check browser console for errors

## Notes

- The bucket must be **Public** for images to display without authentication
- All authenticated users can upload (this is needed for admin to create alumni)
- Images are stored in format: `{userId}/avatar.{ext}` or `temp_{timestamp}_{random}/avatar.{ext}`

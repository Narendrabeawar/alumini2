-- ============================================
-- FINAL COMPLETE SETUP SQL
-- Alumni Directory Database Schema
-- 
-- IMPORTANT: This is the ONLY setup file you need.
-- Run this once to set up the entire database.
-- 
-- For future changes:
-- - DO NOT create new SQL files
-- - UPDATE this file (final_setup.sql) instead
-- - This file contains everything: tables, RLS policies, functions, triggers, storage
-- ============================================

-- ========== EVENTS SYSTEM ==========

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  event_end_date timestamptz,
  location text,
  venue text,
  image_url text,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  registration_required boolean NOT NULL DEFAULT false,
  max_attendees int,
  current_attendees int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published) WHERE is_published = true;

-- Event attendees (for registration tracking)
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('event_created', 'event_updated', 'event_reminder', 'profile_approved', 'profile_rejected', 'invite_received')),
  title text NOT NULL,
  message text NOT NULL,
  related_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  related_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notifications for all users when event is created
CREATE OR REPLACE FUNCTION public.notify_all_users_on_event(event_id uuid, event_title text, event_message text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_event_id)
  SELECT 
    id,
    'event_created',
    event_title,
    event_message,
    event_id
  FROM public.profiles
  WHERE id != (SELECT created_by FROM public.events WHERE id = event_id);
END;
$$;

-- Trigger to automatically create notifications when event is published
CREATE OR REPLACE FUNCTION public.handle_new_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify if event is being published (either new insert or update from false to true)
  IF NEW.is_published = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.is_published IS NULL OR OLD.is_published = false))) THEN
    -- Check if notifications already exist for this event (to avoid duplicates)
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications 
      WHERE related_event_id = NEW.id 
      AND type = 'event_created' 
      LIMIT 1
    ) THEN
      PERFORM public.notify_all_users_on_event(
        NEW.id,
        'New Event: ' || NEW.title,
        'A new event "' || NEW.title || '" has been created. Check it out!'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_event_create ON public.events;
CREATE TRIGGER trigger_notify_on_event_create
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW
  WHEN (NEW.is_published = true)
  EXECUTE FUNCTION public.handle_new_event();

-- RLS Policies for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (is_published = true);

-- Only admins can create events
DROP POLICY IF EXISTS "Admins can create events" ON public.events;
CREATE POLICY "Admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update events
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin());

-- RLS Policies for Event Attendees
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Users can view attendees of events they can see
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;
CREATE POLICY "Users can view event attendees"
  ON public.event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_attendees.event_id
      AND events.is_published = true
    )
  );

-- Users can register for events
DROP POLICY IF EXISTS "Users can register for events" ON public.event_attendees;
CREATE POLICY "Users can register for events"
  ON public.event_attendees FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_attendees.event_id
      AND events.is_published = true
      AND events.registration_required = true
      AND (events.max_attendees IS NULL OR events.current_attendees < events.max_attendees)
    )
  );

-- Users can cancel their own registration
DROP POLICY IF EXISTS "Users can cancel their registration" ON public.event_attendees;
CREATE POLICY "Users can cancel their registration"
  ON public.event_attendees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own registration
DROP POLICY IF EXISTS "Users can delete their registration" ON public.event_attendees;
CREATE POLICY "Users can delete their registration"
  ON public.event_attendees FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can create notifications (via SECURITY DEFINER function)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET current_attendees = GREATEST(0, current_attendees - 1)
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_attendee_count ON public.event_attendees;
CREATE TRIGGER trigger_update_attendee_count
  AFTER INSERT OR DELETE ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_attendee_count();

-- ========== EXTENSIONS ==========
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========== MAIN ENTITIES ==========

-- Profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helper: admin check function
-- Use SECURITY DEFINER to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()), false);
$$;

-- Helper: check if user is approved (bypasses RLS for the check)
CREATE OR REPLACE FUNCTION public.is_user_approved(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_flags 
    WHERE admin_flags.user_id = user_id_param 
    AND admin_flags.status = 'approved'
  );
END;
$$;

-- Admin flags per profile
CREATE TABLE IF NOT EXISTS public.admin_flags (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_verified boolean NOT NULL DEFAULT false
);

-- Alumni details (public profile data)
CREATE TABLE IF NOT EXISTS public.alumni_details (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline text,
  bio text,
  grad_year int,
  department text,
  current_company text,
  current_title text,
  location text,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','alumni','private')),
  -- Additional fields
  father_name text,
  enrollment_number text,
  roll_number text,
  registration_number text,
  certificate_number text,
  -- Contact details
  primary_mobile text,
  whatsapp_number text,
  linkedin_url text,
  twitter_url text,
  facebook_url text,
  instagram_url text,
  github_url text,
  website_url text
);

-- Education
CREATE TABLE IF NOT EXISTS public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  degree text,
  major text,
  start_year int,
  end_year int
);

-- Work history
CREATE TABLE IF NOT EXISTS public.work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company text,
  role text,
  start_date date,
  end_date date,
  description text
);

-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- ========== IMPORT & INVITE ==========

-- Import batches
CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','validated','committed')),
  row_count int NOT NULL DEFAULT 0,
  error_count int NOT NULL DEFAULT 0
);

-- Imported alumni rows
CREATE TABLE IF NOT EXISTS public.imported_alumni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  external_id text,
  full_name text NOT NULL,
  email text NOT NULL,
  -- Profile details
  headline text,
  bio text,
  grad_year int,
  department text,
  company text,
  role text,
  location text,
  father_name text,
  -- Contact details
  primary_mobile text,
  whatsapp_number text,
  linkedin_url text,
  twitter_url text,
  facebook_url text,
  instagram_url text,
  github_url text,
  website_url text,
  -- Metadata
  matched_profile uuid REFERENCES public.profiles(id),
  invite_status text NOT NULL DEFAULT 'none' CHECK (invite_status IN ('none','sent','accepted','bounced','expired'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_imported_alumni_email_per_batch ON public.imported_alumni(email, batch_id);

-- ========== MIGRATION: ADD PROFILE FIELDS TO IMPORTED_ALUMNI ==========
-- Add additional profile fields to imported_alumni table if they don't exist

DO $$ 
BEGIN
  -- Add profile detail fields if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imported_alumni' AND column_name = 'headline') THEN
    ALTER TABLE public.imported_alumni ADD COLUMN headline text;
    ALTER TABLE public.imported_alumni ADD COLUMN bio text;
    ALTER TABLE public.imported_alumni ADD COLUMN location text;
    ALTER TABLE public.imported_alumni ADD COLUMN father_name text;
  END IF;

  -- Add contact detail fields if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imported_alumni' AND column_name = 'primary_mobile') THEN
    ALTER TABLE public.imported_alumni ADD COLUMN primary_mobile text;
    ALTER TABLE public.imported_alumni ADD COLUMN whatsapp_number text;
    ALTER TABLE public.imported_alumni ADD COLUMN linkedin_url text;
    ALTER TABLE public.imported_alumni ADD COLUMN twitter_url text;
    ALTER TABLE public.imported_alumni ADD COLUMN facebook_url text;
    ALTER TABLE public.imported_alumni ADD COLUMN instagram_url text;
    ALTER TABLE public.imported_alumni ADD COLUMN github_url text;
    ALTER TABLE public.imported_alumni ADD COLUMN website_url text;
  END IF;
END $$;

-- Invites
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_alumni_id uuid NOT NULL REFERENCES public.imported_alumni(id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL UNIQUE,
  sent_at timestamptz,
  expires_at timestamptz,
  redeemed_by uuid REFERENCES public.profiles(id),
  redeemed_at timestamptz,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created','sent','redeemed','expired','revoked'))
);

-- ========== STAGING (SELF-REGISTRATION) ==========

CREATE TABLE IF NOT EXISTS public.staged_alumni_details (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline text,
  bio text,
  grad_year int,
  department text,
  current_company text,
  current_title text,
  location text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Additional fields
  father_name text,
  enrollment_number text,
  roll_number text,
  registration_number text,
  certificate_number text,
  -- Contact details
  primary_mobile text,
  whatsapp_number text,
  linkedin_url text,
  twitter_url text,
  facebook_url text,
  instagram_url text,
  github_url text,
  website_url text
);

CREATE TABLE IF NOT EXISTS public.staged_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  degree text,
  major text,
  start_year int,
  end_year int
);

CREATE TABLE IF NOT EXISTS public.staged_work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company text,
  role text,
  start_date date,
  end_date date,
  description text
);

CREATE TABLE IF NOT EXISTS public.staged_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- ========== INDEXES ==========

-- Full-text search on alumni_details
ALTER TABLE public.alumni_details
  ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', COALESCE(current_company,'')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(current_title,'')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(department,'')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_alumni_details_search_vector ON public.alumni_details USING gin (search_vector);
CREATE INDEX IF NOT EXISTS idx_alumni_details_grad_year ON public.alumni_details(grad_year);
CREATE INDEX IF NOT EXISTS idx_alumni_details_department ON public.alumni_details(department);
CREATE INDEX IF NOT EXISTS idx_alumni_details_company ON public.alumni_details(current_company);
CREATE INDEX IF NOT EXISTS idx_alumni_enrollment ON public.alumni_details(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_alumni_roll ON public.alumni_details(roll_number);

CREATE INDEX IF NOT EXISTS idx_skills_user ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user ON public.education(user_id);
CREATE INDEX IF NOT EXISTS idx_work_history_user ON public.work_history(user_id);

CREATE INDEX IF NOT EXISTS idx_import_batches_uploaded_at ON public.import_batches(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_imported_alumni_email ON public.imported_alumni USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);
CREATE INDEX IF NOT EXISTS idx_staged_enrollment ON public.staged_alumni_details(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_staged_roll ON public.staged_alumni_details(roll_number);

-- ========== RLS ENABLE ==========

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_alumni_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staged_skills ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES ==========

-- Profiles: Owner can read/write, approved profiles visible to all, admins can read all
DROP POLICY IF EXISTS "profiles_owner_rw" ON public.profiles;
CREATE POLICY "profiles_owner_rw" ON public.profiles
  FOR ALL USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_read_if_approved" ON public.profiles;
CREATE POLICY "profiles_read_if_approved" ON public.profiles
  FOR SELECT USING (
    public.is_user_approved(profiles.id) OR (SELECT auth.uid()) = id
  );

DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Admin flags
DROP POLICY IF EXISTS "admin_flags_admin_all" ON public.admin_flags;
CREATE POLICY "admin_flags_admin_all" ON public.admin_flags
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_flags_owner_read" ON public.admin_flags;
CREATE POLICY "admin_flags_owner_read" ON public.admin_flags
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Alumni details: Owner CRUD, approved visible to all
DROP POLICY IF EXISTS "alumni_details_owner_crud" ON public.alumni_details;
CREATE POLICY "alumni_details_owner_crud" ON public.alumni_details
  FOR ALL USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "alumni_details_read_if_approved" ON public.alumni_details;
CREATE POLICY "alumni_details_read_if_approved" ON public.alumni_details
  FOR SELECT USING (
    (SELECT auth.uid()) = id OR public.is_user_approved(id)
  );

-- Education: Owner CRUD, approved visible to all
DROP POLICY IF EXISTS "education_owner_crud" ON public.education;
CREATE POLICY "education_owner_crud" ON public.education
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "education_read_if_approved" ON public.education;
CREATE POLICY "education_read_if_approved" ON public.education
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_flags f WHERE f.user_id = education.user_id AND f.status = 'approved')
    OR (SELECT auth.uid()) = user_id
  );

-- Work history: Owner CRUD, approved visible to all
DROP POLICY IF EXISTS "work_owner_crud" ON public.work_history;
CREATE POLICY "work_owner_crud" ON public.work_history
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "work_read_if_approved" ON public.work_history;
CREATE POLICY "work_read_if_approved" ON public.work_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_flags f WHERE f.user_id = work_history.user_id AND f.status = 'approved')
    OR (SELECT auth.uid()) = user_id
  );

-- Skills: Owner CRUD, approved visible to all
DROP POLICY IF EXISTS "skills_owner_crud" ON public.skills;
CREATE POLICY "skills_owner_crud" ON public.skills
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "skills_read_if_approved" ON public.skills;
CREATE POLICY "skills_read_if_approved" ON public.skills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_flags f WHERE f.user_id = skills.user_id AND f.status = 'approved')
    OR (SELECT auth.uid()) = user_id
  );

-- Import & Invites: Admin only
DROP POLICY IF EXISTS "import_batches_admin_all" ON public.import_batches;
CREATE POLICY "import_batches_admin_all" ON public.import_batches
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "imported_alumni_admin_all" ON public.imported_alumni;
CREATE POLICY "imported_alumni_admin_all" ON public.imported_alumni
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "invites_admin_all" ON public.invites;
CREATE POLICY "invites_admin_all" ON public.invites
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "invites_redeemed_by_owner_read" ON public.invites;
CREATE POLICY "invites_redeemed_by_owner_read" ON public.invites
  FOR SELECT USING ((SELECT auth.uid()) = redeemed_by);

-- Staging: Owner CRUD, admins read all
DROP POLICY IF EXISTS "staged_details_owner_crud" ON public.staged_alumni_details;
CREATE POLICY "staged_details_owner_crud" ON public.staged_alumni_details
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "staged_edu_owner_crud" ON public.staged_education;
CREATE POLICY "staged_edu_owner_crud" ON public.staged_education
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "staged_work_owner_crud" ON public.staged_work_history;
CREATE POLICY "staged_work_owner_crud" ON public.staged_work_history
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "staged_skills_owner_crud" ON public.staged_skills;
CREATE POLICY "staged_skills_owner_crud" ON public.staged_skills
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "staged_admin_read" ON public.staged_alumni_details;
CREATE POLICY "staged_admin_read" ON public.staged_alumni_details
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "staged_edu_admin_read" ON public.staged_education;
CREATE POLICY "staged_edu_admin_read" ON public.staged_education
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "staged_work_admin_read" ON public.staged_work_history;
CREATE POLICY "staged_work_admin_read" ON public.staged_work_history
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "staged_skills_admin_read" ON public.staged_skills;
CREATE POLICY "staged_skills_admin_read" ON public.staged_skills
  FOR SELECT USING (public.is_admin());

-- ========== TRIGGERS & FUNCTIONS ==========

-- Handle new user creation (auto-create profile and admin_flags)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.admin_flags(user_id, status, is_verified)
  VALUES (NEW.id, 'pending', false)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Promote staged to main (admin only)
CREATE OR REPLACE FUNCTION public.promote_staged_to_main(target_user uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Upsert core details including all fields
  INSERT INTO public.alumni_details(
    id, headline, bio, grad_year, department, current_company, current_title, 
    location, enrollment_number, roll_number, registration_number, certificate_number, father_name,
    primary_mobile, whatsapp_number, linkedin_url, twitter_url, facebook_url, instagram_url, github_url, website_url
  )
  SELECT 
    s.user_id, s.headline, s.bio, s.grad_year, s.department, s.current_company, 
    s.current_title, s.location, s.enrollment_number, s.roll_number, 
    s.registration_number, s.certificate_number, s.father_name,
    s.primary_mobile, s.whatsapp_number, s.linkedin_url, s.twitter_url, s.facebook_url, s.instagram_url, s.github_url, s.website_url
  FROM public.staged_alumni_details s
  WHERE s.user_id = target_user
  ON CONFLICT (id) DO UPDATE
    SET headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        grad_year = EXCLUDED.grad_year,
        department = EXCLUDED.department,
        current_company = EXCLUDED.current_company,
        current_title = EXCLUDED.current_title,
        location = EXCLUDED.location,
        enrollment_number = EXCLUDED.enrollment_number,
        roll_number = EXCLUDED.roll_number,
        registration_number = EXCLUDED.registration_number,
        certificate_number = EXCLUDED.certificate_number,
        father_name = EXCLUDED.father_name,
        primary_mobile = EXCLUDED.primary_mobile,
        whatsapp_number = EXCLUDED.whatsapp_number,
        linkedin_url = EXCLUDED.linkedin_url,
        twitter_url = EXCLUDED.twitter_url,
        facebook_url = EXCLUDED.facebook_url,
        instagram_url = EXCLUDED.instagram_url,
        github_url = EXCLUDED.github_url,
        website_url = EXCLUDED.website_url;

  -- Replace child tables
  DELETE FROM public.education WHERE user_id = target_user;
  INSERT INTO public.education(id, user_id, degree, major, start_year, end_year)
  SELECT gen_random_uuid(), user_id, degree, major, start_year, end_year
  FROM public.staged_education WHERE user_id = target_user;

  DELETE FROM public.work_history WHERE user_id = target_user;
  INSERT INTO public.work_history(id, user_id, company, role, start_date, end_date, description)
  SELECT gen_random_uuid(), user_id, company, role, start_date, end_date, description
  FROM public.staged_work_history WHERE user_id = target_user;

  DELETE FROM public.skills WHERE user_id = target_user;
  INSERT INTO public.skills(id, user_id, name)
  SELECT gen_random_uuid(), user_id, name
  FROM public.staged_skills WHERE user_id = target_user;

  -- Mark approved
  UPDATE public.admin_flags SET status = 'approved', is_verified = true
  WHERE user_id = target_user;

  -- Clear staged
  DELETE FROM public.staged_skills WHERE user_id = target_user;
  DELETE FROM public.staged_work_history WHERE user_id = target_user;
  DELETE FROM public.staged_education WHERE user_id = target_user;
  DELETE FROM public.staged_alumni_details WHERE user_id = target_user;
END;
$$;

-- Reject staged (admin only)
CREATE OR REPLACE FUNCTION public.reject_staged(target_user uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.staged_skills WHERE user_id = target_user;
  DELETE FROM public.staged_work_history WHERE user_id = target_user;
  DELETE FROM public.staged_education WHERE user_id = target_user;
  DELETE FROM public.staged_alumni_details WHERE user_id = target_user;

  UPDATE public.admin_flags SET status = 'rejected', is_verified = false
  WHERE user_id = target_user;
END;
$$;

-- Resubmit profile (user can set status to pending)
CREATE OR REPLACE FUNCTION public.resubmit_profile()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status text;
BEGIN
  -- Get current status
  SELECT status INTO current_status
  FROM public.admin_flags
  WHERE user_id = auth.uid();

  -- If no entry exists, create one with pending status
  IF current_status IS NULL THEN
    INSERT INTO public.admin_flags(user_id, status, is_verified)
    VALUES (auth.uid(), 'pending', false)
    ON CONFLICT (user_id) DO UPDATE
      SET status = 'pending', is_verified = false;
  ELSE
    -- Update status to pending (allows resubmission from rejected)
    UPDATE public.admin_flags
    SET status = 'pending', is_verified = false
    WHERE user_id = auth.uid();
  END IF;
END;
$$;

-- ========== STORAGE: AVATARS BUCKET AND POLICIES ==========

-- Create the avatars bucket with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
  SET public = true, name = 'avatars';

-- Public read for avatars
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload to avatars
DROP POLICY IF EXISTS "Users upload avatars" ON storage.objects;
CREATE POLICY "Users upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Users can update their own avatar objects
DROP POLICY IF EXISTS "Users update own avatars" ON storage.objects;
CREATE POLICY "Users update own avatars" ON storage.objects
  FOR UPDATE USING (owner = auth.uid() AND bucket_id = 'avatars')
  WITH CHECK (owner = auth.uid() AND bucket_id = 'avatars');

-- Users can delete their own avatar objects
DROP POLICY IF EXISTS "Users delete own avatars" ON storage.objects;
CREATE POLICY "Users delete own avatars" ON storage.objects
  FOR DELETE USING (owner = auth.uid() AND bucket_id = 'avatars');

-- ========== MIGRATION: ADD CONTACT FIELDS ==========
-- Add contact fields to existing tables if they don't exist

DO $$ 
BEGIN
  -- Add to alumni_details if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alumni_details' AND column_name = 'primary_mobile') THEN
    ALTER TABLE public.alumni_details ADD COLUMN primary_mobile text;
    ALTER TABLE public.alumni_details ADD COLUMN whatsapp_number text;
    ALTER TABLE public.alumni_details ADD COLUMN linkedin_url text;
    ALTER TABLE public.alumni_details ADD COLUMN twitter_url text;
    ALTER TABLE public.alumni_details ADD COLUMN facebook_url text;
    ALTER TABLE public.alumni_details ADD COLUMN instagram_url text;
    ALTER TABLE public.alumni_details ADD COLUMN github_url text;
    ALTER TABLE public.alumni_details ADD COLUMN website_url text;
  END IF;

  -- Add to staged_alumni_details if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staged_alumni_details' AND column_name = 'primary_mobile') THEN
    ALTER TABLE public.staged_alumni_details ADD COLUMN primary_mobile text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN whatsapp_number text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN linkedin_url text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN twitter_url text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN facebook_url text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN instagram_url text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN github_url text;
    ALTER TABLE public.staged_alumni_details ADD COLUMN website_url text;
  END IF;
END $$;

-- ============================================
-- SETUP COMPLETE
-- ============================================


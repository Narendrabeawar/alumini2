    -- setup2.sql: Recreate schema (extensions, tables, constraints, indexes, functions, triggers, RLS)
    -- Generated from connected Supabase project (public schema)

    BEGIN;

    -- Ensure required extensions
    CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
    CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
    CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA graphql;
    CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA vault;

    -- Tables
    CREATE TABLE IF NOT EXISTS public.profiles (
        id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
        full_name text NOT NULL DEFAULT ''::text,
        avatar_url text,
        is_admin boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.admin_flags (
        user_id uuid PRIMARY KEY,
        status text NOT NULL DEFAULT 'pending'::text,
        is_verified boolean NOT NULL DEFAULT false,
        CONSTRAINT admin_flags_status_chk CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.alumni_details (
        id uuid PRIMARY KEY,
        headline text,
        bio text,
        grad_year integer,
        department text,
        current_company text,
        current_title text,
        location text,
        visibility text NOT NULL DEFAULT 'public'::text,
        search_vector tsvector,
        enrollment_number text,
        roll_number text,
        registration_number text,
        certificate_number text,
        father_name text,
        primary_mobile text,
        whatsapp_number text,
        linkedin_url text,
        twitter_url text,
        facebook_url text,
        instagram_url text,
        github_url text,
        website_url text,
        CONSTRAINT alumni_details_visibility_chk CHECK (visibility = ANY (ARRAY['public'::text, 'alumni'::text, 'private'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.education (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        degree text,
        major text,
        start_year integer,
        end_year integer
    );

    CREATE TABLE IF NOT EXISTS public.work_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        company text,
        role text,
        start_date date,
        end_date date,
        description text
    );

    CREATE TABLE IF NOT EXISTS public.skills (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        name text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.import_batches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        filename text NOT NULL,
        uploaded_by uuid,
        uploaded_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'draft'::text,
        row_count integer NOT NULL DEFAULT 0,
        error_count integer NOT NULL DEFAULT 0,
        CONSTRAINT import_batches_status_chk CHECK (status = ANY (ARRAY['draft'::text, 'validated'::text, 'committed'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.imported_alumni (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id uuid NOT NULL,
        external_id text,
        full_name text NOT NULL,
        email text NOT NULL,
        grad_year integer,
        department text,
        company text,
        role text,
        matched_profile uuid,
        invite_status text NOT NULL DEFAULT 'none'::text,
        headline text,
        bio text,
        location text,
        father_name text,
        primary_mobile text,
        whatsapp_number text,
        linkedin_url text,
        twitter_url text,
        facebook_url text,
        instagram_url text,
        github_url text,
        website_url text,
        CONSTRAINT imported_alumni_invite_status_chk CHECK (invite_status = ANY (ARRAY['none'::text, 'sent'::text, 'accepted'::text, 'bounced'::text, 'expired'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.invites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        imported_alumni_id uuid NOT NULL,
        email text NOT NULL,
        code text NOT NULL,
        sent_at timestamptz,
        expires_at timestamptz,
        redeemed_by uuid,
        redeemed_at timestamptz,
        status text NOT NULL DEFAULT 'created'::text,
        CONSTRAINT invites_status_chk CHECK (status = ANY (ARRAY['created'::text, 'sent'::text, 'redeemed'::text, 'expired'::text, 'revoked'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text,
        event_date timestamptz NOT NULL,
        event_end_date timestamptz,
        location text,
        venue text,
        image_url text,
        created_by uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        is_published boolean NOT NULL DEFAULT true,
        registration_required boolean NOT NULL DEFAULT false,
        max_attendees integer,
        current_attendees integer NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS public.event_attendees (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL,
        user_id uuid NOT NULL,
        registered_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'registered'::text,
        CONSTRAINT event_attendees_status_chk CHECK (status = ANY (ARRAY['registered'::text, 'cancelled'::text, 'attended'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        type text NOT NULL,
        title text NOT NULL,
        message text NOT NULL,
        related_event_id uuid,
        related_user_id uuid,
        is_read boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT notifications_type_chk CHECK (type = ANY (ARRAY['event_created'::text, 'event_updated'::text, 'event_reminder'::text, 'profile_approved'::text, 'profile_rejected'::text, 'invite_received'::text]))
    );

    CREATE TABLE IF NOT EXISTS public.staged_alumni_details (
        user_id uuid PRIMARY KEY,
        headline text,
        bio text,
        grad_year integer,
        department text,
        current_company text,
        current_title text,
        location text,
        updated_at timestamptz NOT NULL DEFAULT now(),
        enrollment_number text,
        roll_number text,
        registration_number text,
        certificate_number text,
        father_name text,
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
        user_id uuid NOT NULL,
        degree text,
        major text,
        start_year integer,
        end_year integer
    );

    CREATE TABLE IF NOT EXISTS public.staged_work_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        company text,
        role text,
        start_date date,
        end_date date,
        description text
    );

    CREATE TABLE IF NOT EXISTS public.staged_skills (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        name text NOT NULL
    );

    -- Foreign keys
    ALTER TABLE public.admin_flags
        ADD CONSTRAINT admin_flags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.alumni_details
        ADD CONSTRAINT alumni_details_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.education
        ADD CONSTRAINT education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.work_history
        ADD CONSTRAINT work_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.skills
        ADD CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.import_batches
        ADD CONSTRAINT import_batches_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

    ALTER TABLE public.imported_alumni
        ADD CONSTRAINT imported_alumni_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.import_batches(id) ON DELETE CASCADE,
        ADD CONSTRAINT imported_alumni_matched_profile_fkey FOREIGN KEY (matched_profile) REFERENCES public.profiles(id) ON DELETE SET NULL;

    ALTER TABLE public.invites
        ADD CONSTRAINT invites_imported_alumni_id_fkey FOREIGN KEY (imported_alumni_id) REFERENCES public.imported_alumni(id) ON DELETE CASCADE,
        ADD CONSTRAINT invites_redeemed_by_fkey FOREIGN KEY (redeemed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

    ALTER TABLE public.events
        ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.event_attendees
        ADD CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
        ADD CONSTRAINT event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
        ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
        ADD CONSTRAINT notifications_related_event_id_fkey FOREIGN KEY (related_event_id) REFERENCES public.events(id) ON DELETE SET NULL;

    ALTER TABLE public.staged_alumni_details
        ADD CONSTRAINT staged_alumni_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.staged_education
        ADD CONSTRAINT staged_education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.staged_work_history
        ADD CONSTRAINT staged_work_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.staged_skills
        ADD CONSTRAINT staged_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- Indexes
    CREATE UNIQUE INDEX IF NOT EXISTS admin_flags_pkey ON public.admin_flags USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS alumni_details_pkey ON public.alumni_details USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_alumni_details_company ON public.alumni_details USING btree (current_company);
    CREATE INDEX IF NOT EXISTS idx_alumni_details_department ON public.alumni_details USING btree (department);
    CREATE INDEX IF NOT EXISTS idx_alumni_details_grad_year ON public.alumni_details USING btree (grad_year);
    CREATE INDEX IF NOT EXISTS idx_alumni_details_search_vector ON public.alumni_details USING gin (search_vector);
    CREATE INDEX IF NOT EXISTS idx_alumni_enrollment ON public.alumni_details USING btree (enrollment_number);
    CREATE INDEX IF NOT EXISTS idx_alumni_roll ON public.alumni_details USING btree (roll_number);
    CREATE UNIQUE INDEX IF NOT EXISTS education_pkey ON public.education USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_education_user ON public.education USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS event_attendees_event_id_user_id_key ON public.event_attendees USING btree (event_id, user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS event_attendees_pkey ON public.event_attendees USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees USING btree (event_id);
    CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS events_pkey ON public.events USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events USING btree (created_by);
    CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events USING btree (event_date DESC);
    CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events USING btree (is_published) WHERE (is_published = true);
    CREATE INDEX IF NOT EXISTS idx_import_batches_uploaded_at ON public.import_batches USING btree (uploaded_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS import_batches_pkey ON public.import_batches USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_imported_alumni_email ON public.imported_alumni USING gin (email gin_trgm_ops);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_imported_alumni_email_per_batch ON public.imported_alumni USING btree (email, batch_id);
    CREATE UNIQUE INDEX IF NOT EXISTS imported_alumni_pkey ON public.imported_alumni USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites USING btree (code);
    CREATE UNIQUE INDEX IF NOT EXISTS invites_code_key ON public.invites USING btree (code);
    CREATE UNIQUE INDEX IF NOT EXISTS invites_pkey ON public.invites USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications USING btree (user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS notifications_pkey ON public.notifications USING btree (id);
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_pkey ON public.profiles USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_skills_user ON public.skills USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS skills_pkey ON public.skills USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_staged_enrollment ON public.staged_alumni_details USING btree (enrollment_number);
    CREATE INDEX IF NOT EXISTS idx_staged_roll ON public.staged_alumni_details USING btree (roll_number);
    CREATE UNIQUE INDEX IF NOT EXISTS staged_alumni_details_pkey ON public.staged_alumni_details USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS staged_education_pkey ON public.staged_education USING btree (id);
    CREATE UNIQUE INDEX IF NOT EXISTS staged_skills_pkey ON public.staged_skills USING btree (id);
    CREATE UNIQUE INDEX IF NOT EXISTS staged_work_history_pkey ON public.staged_work_history USING btree (id);
    CREATE INDEX IF NOT EXISTS idx_work_history_user ON public.work_history USING btree (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS work_history_pkey ON public.work_history USING btree (id);

    -- Functions
    -- Note: relies on extensions and auth schema available in Supabase
    CREATE OR REPLACE FUNCTION public.handle_new_event()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    BEGIN
    IF NEW.is_published = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.is_published IS NULL OR OLD.is_published = false))) THEN
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
    $function$;

    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    BEGIN
    INSERT INTO public.profiles(id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.admin_flags(user_id, status, is_verified)
    VALUES (NEW.id, 'pending', false)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
    END;
    $function$;

    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean
    LANGUAGE sql
    STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    SELECT COALESCE((SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()), false);
    $function$;

    CREATE OR REPLACE FUNCTION public.is_user_approved(user_id_param uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    STABLE SECURITY DEFINER
    AS $function$
    BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.admin_flags 
        WHERE admin_flags.user_id = user_id_param 
        AND admin_flags.status = 'approved'
    );
    END;
    $function$;

    CREATE OR REPLACE FUNCTION public.notify_all_users_on_event(event_id uuid, event_title text, event_message text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
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
    $function$;

    CREATE OR REPLACE FUNCTION public.promote_staged_to_main(target_user uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    INSERT INTO public.alumni_details(
        id, headline, bio, grad_year, department, current_company, 
        current_title, location, enrollment_number, roll_number, 
        registration_number, certificate_number, father_name,
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

    UPDATE public.admin_flags SET status = 'approved', is_verified = true
    WHERE user_id = target_user;

    DELETE FROM public.staged_skills WHERE user_id = target_user;
    DELETE FROM public.staged_work_history WHERE user_id = target_user;
    DELETE FROM public.staged_education WHERE user_id = target_user;
    DELETE FROM public.staged_alumni_details WHERE user_id = target_user;
    END;
    $function$;

    CREATE OR REPLACE FUNCTION public.reject_staged(target_user uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
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
    $function$;

    CREATE OR REPLACE FUNCTION public.resubmit_profile()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    DECLARE
    current_status text;
    BEGIN
    SELECT status INTO current_status
    FROM public.admin_flags
    WHERE user_id = auth.uid();

    IF current_status IS NULL THEN
        INSERT INTO public.admin_flags(user_id, status, is_verified)
        VALUES (auth.uid(), 'pending', false)
        ON CONFLICT (user_id) DO UPDATE
        SET status = 'pending', is_verified = false;
    ELSE
        UPDATE public.admin_flags
        SET status = 'pending', is_verified = false
        WHERE user_id = auth.uid();
    END IF;
    END;
    $function$;

    CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
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
    $function$;

    -- Triggers
    DROP TRIGGER IF EXISTS trigger_update_attendee_count ON public.event_attendees;
    CREATE TRIGGER trigger_update_attendee_count AFTER INSERT OR DELETE ON public.event_attendees FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();

    DROP TRIGGER IF EXISTS trigger_notify_on_event_create ON public.events;
    CREATE TRIGGER trigger_notify_on_event_create AFTER INSERT OR UPDATE ON public.events FOR EACH ROW WHEN ((new.is_published = true)) EXECUTE FUNCTION handle_new_event();

    -- RLS enablement
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.admin_flags ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.alumni_details ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.imported_alumni ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staged_alumni_details ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staged_education ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staged_work_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.staged_skills ENABLE ROW LEVEL SECURITY;

    -- Policies (public schema)
    CREATE POLICY "admin_flags_admin_all" ON public.admin_flags FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());
    CREATE POLICY "admin_flags_owner_read" ON public.admin_flags FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = user_id));

    CREATE POLICY "alumni_details_owner_crud" ON public.alumni_details FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));
    CREATE POLICY "alumni_details_read_if_approved" ON public.alumni_details FOR SELECT TO public USING (((( SELECT auth.uid() AS uid) = id) OR is_user_approved(id)));

    CREATE POLICY "education_owner_crud" ON public.education FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
    CREATE POLICY "education_read_if_approved" ON public.education FOR SELECT TO public USING (((EXISTS ( SELECT 1
    FROM admin_flags f
    WHERE ((f.user_id = education.user_id) AND (f.status = 'approved'::text)))) OR (( SELECT auth.uid() AS uid) = user_id)));

    CREATE POLICY "Users can cancel their registration" ON public.event_attendees FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
    CREATE POLICY "Users can delete their registration" ON public.event_attendees FOR DELETE TO public USING ((auth.uid() = user_id));
    CREATE POLICY "Users can register for events" ON public.event_attendees FOR INSERT TO public WITH CHECK (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
    FROM events
    WHERE ((events.id = event_attendees.event_id) AND (events.is_published = true) AND (events.registration_required = true) AND ((events.max_attendees IS NULL) OR (events.current_attendees < events.max_attendees)))))));
    CREATE POLICY "Users can view event attendees" ON public.event_attendees FOR SELECT TO public USING ((EXISTS ( SELECT 1
    FROM events
    WHERE ((events.id = event_attendees.event_id) AND (events.is_published = true)))));

    CREATE POLICY "Admins can create events" ON public.events FOR INSERT TO public WITH CHECK (is_admin());
    CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO public USING (is_admin());
    CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO public USING (is_admin());
    CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT TO public USING ((is_published = true));

    CREATE POLICY "import_batches_admin_all" ON public.import_batches FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());
    CREATE POLICY "imported_alumni_admin_all" ON public.imported_alumni FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());

    CREATE POLICY "invites_admin_all" ON public.invites FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());
    CREATE POLICY "invites_redeemed_by_owner_read" ON public.invites FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = redeemed_by));

    CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
    CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO public USING ((auth.uid() = user_id));

    CREATE POLICY "profiles_admin_read" ON public.profiles FOR SELECT TO public USING (is_admin());
    CREATE POLICY "profiles_owner_rw" ON public.profiles FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));
    CREATE POLICY "profiles_read_if_approved" ON public.profiles FOR SELECT TO public USING ((is_user_approved(id) OR (( SELECT auth.uid() AS uid) = id)));

    CREATE POLICY "skills_owner_crud" ON public.skills FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
    CREATE POLICY "skills_read_if_approved" ON public.skills FOR SELECT TO public USING (((EXISTS ( SELECT 1
    FROM admin_flags f
    WHERE ((f.user_id = skills.user_id) AND (f.status = 'approved'::text)))) OR (( SELECT auth.uid() AS uid) = user_id)));

    CREATE POLICY "staged_admin_read" ON public.staged_alumni_details FOR SELECT TO public USING (is_admin());
    CREATE POLICY "staged_details_owner_crud" ON public.staged_alumni_details FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

    CREATE POLICY "staged_edu_admin_read" ON public.staged_education FOR SELECT TO public USING (is_admin());
    CREATE POLICY "staged_edu_owner_crud" ON public.staged_education FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

    CREATE POLICY "staged_skills_admin_read" ON public.staged_skills FOR SELECT TO public USING (is_admin());
    CREATE POLICY "staged_skills_owner_crud" ON public.staged_skills FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

    CREATE POLICY "staged_work_admin_read" ON public.staged_work_history FOR SELECT TO public USING (is_admin());
    CREATE POLICY "staged_work_owner_crud" ON public.staged_work_history FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

    CREATE POLICY "work_owner_crud" ON public.work_history FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
    CREATE POLICY "work_read_if_approved" ON public.work_history FOR SELECT TO public USING (((EXISTS ( SELECT 1
    FROM admin_flags f
    WHERE ((f.user_id = work_history.user_id) AND (f.status = 'approved'::text)))) OR (( SELECT auth.uid() AS uid) = user_id)));

    COMMIT;



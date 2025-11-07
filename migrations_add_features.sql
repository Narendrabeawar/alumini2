-- ============================================
-- ADDITIONAL FEATURES FOR ALUMNI WEBSITE
-- Jobs, Gallery, and News/Blog
-- ============================================

-- ========== JOBS/OPPORTUNITIES ==========

CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text,
  location text,
  job_type text CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  salary_range text,
  application_url text,
  application_email text,
  posted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_is_published ON public.jobs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON public.jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);

-- ========== GALLERY ==========

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_is_published ON public.gallery_items(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_event_id ON public.gallery_items(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery_items(created_at DESC);

-- ========== NEWS/BLOG ==========

CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text,
  tags text[],
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_is_published ON public.news(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);

-- ========== RLS POLICIES ==========

-- Jobs: Anyone can read published jobs, only admins can create/update/delete
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published jobs"
  ON public.jobs FOR SELECT
  USING (is_published = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage jobs"
  ON public.jobs FOR ALL
  USING (public.is_admin());

-- Gallery: Anyone can view published items, only admins can manage
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published gallery items"
  ON public.gallery_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery_items FOR ALL
  USING (public.is_admin());

-- News: Anyone can read published news, only admins can manage
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published news"
  ON public.news FOR SELECT
  USING (is_published = true AND published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Admins can manage news"
  ON public.news FOR ALL
  USING (public.is_admin());


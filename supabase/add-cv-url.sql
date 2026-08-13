-- Run in Supabase SQL editor

ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS cv_url text;

-- Create private storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-cvs', 'application-cvs', false)
ON CONFLICT (id) DO NOTHING;

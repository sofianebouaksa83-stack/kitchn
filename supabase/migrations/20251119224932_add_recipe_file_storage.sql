/*
  # Add Recipe File Storage

  1. Changes
    - Add `file_url` column to recipes table to store uploaded file URL
    - Add `file_name` column to store original filename
    - Add `file_size` column to store file size in bytes
    - Create storage bucket for recipe files
    - Add storage policies for authenticated users

  2. Security
    - Only authenticated users can upload files
    - Users can only access their own recipe files
*/

ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size integer;

INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-files', 'recipe-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their recipe files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their recipe files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recipe-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their recipe files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

/*
  # Update Recipe Files Bucket to Public

  1. Changes
    - Update the recipe-files bucket to be public
    - This allows Google Docs Viewer and Office Online to access the files

  2. Security
    - Files are still protected by user-specific folder structure
    - Only users who know the exact file path can access files
*/

UPDATE storage.buckets 
SET public = true 
WHERE id = 'recipe-files';

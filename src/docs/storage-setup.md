# Storage Setup for Resume Uploads

This document explains how to set up Supabase storage for resume uploads in the job board application.

## Prerequisites

- Supabase project set up
- Admin access to Supabase dashboard

## Storage Bucket Setup

### 1. Create the Resume Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the bucket name to: `resumes`
5. Set the bucket to **Public** (so resumes can be accessed via URLs)
6. Click **Create bucket**

### 2. Set Up Storage Policies

Create the following RLS (Row Level Security) policies for the `resumes` bucket:

#### Policy 1: Allow users to upload their own resumes
```sql
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 2: Allow users to view their own resumes
```sql
CREATE POLICY "Users can view their own resumes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Allow users to delete their own resumes
```sql
CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Allow admins to view all resumes
```sql
CREATE POLICY "Admins can view all resumes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'resumes' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);
```

### 3. File Structure

The application organizes resumes in the following structure:
```
resumes/
├── {user_id}/
│   └── resume_{timestamp}.{extension}
```

### 4. Supported File Types

- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Maximum file size: 5MB

### 5. Environment Variables

Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

### Resume Upload
- Users can upload resumes from their profile page
- Files are validated for type and size
- Progress indicator during upload
- Automatic URL generation and database update

### Resume Management
- View uploaded resume
- Download resume
- Delete and replace resume
- Resume status shown on dashboard

### Resume in Job Applications
- Resume automatically attached to job applications
- Admins can view candidate resumes
- Resume URLs stored in application records

## Troubleshooting

### Common Issues

1. **Upload fails with permission error**
   - Check that storage policies are correctly set up
   - Verify user is authenticated
   - Ensure bucket is public

2. **File size too large**
   - Maximum file size is 5MB
   - Compress PDF or use a smaller file

3. **Unsupported file type**
   - Only PDF, DOC, and DOCX files are supported
   - Convert other formats before uploading

4. **Resume not showing in applications**
   - Check that `resume_url` field is properly updated in users table
   - Verify storage policies allow admin access

### Storage Policies Verification

To verify policies are working:
1. Go to Supabase Dashboard > Storage > Policies
2. Check that all 4 policies are active
3. Test upload/download functionality

## Security Considerations

- Files are organized by user ID to prevent unauthorized access
- RLS policies ensure users can only access their own files
- Admins have read-only access to all resumes for application review
- File type validation prevents malicious uploads
- File size limits prevent storage abuse 
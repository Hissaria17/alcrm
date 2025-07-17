import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// File validation types
export interface UploadValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

// Upload result interface
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

// Default validation for resume uploads
export const RESUME_UPLOAD_VALIDATION: UploadValidation = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedExtensions: ['.pdf', '.doc', '.docx']
};

// Default validation for profile picture uploads
export const PROFILE_PICTURE_UPLOAD_VALIDATION: UploadValidation = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
};

// Default validation for free resource uploads
export const FREE_RESOURCE_UPLOAD_VALIDATION: UploadValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi']
};

/**
 * Validates a file for upload
 */
export function validateFile(file: File, validation: UploadValidation): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > validation.maxSize) {
    const maxSizeMB = validation.maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  // Check file type
  if (!validation.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${validation.allowedExtensions.join(', ')}`
    };
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!validation.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension not allowed. Allowed extensions: ${validation.allowedExtensions.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Generates a unique filename for the resume
 */
export function generateResumeFileName(userId: string, originalFileName: string): string {
  if (!userId) {
    throw new Error('userId is required for resume upload');
  }
  
  const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || 'pdf';
  
  // Ensure userId is properly sanitized and used as the first folder
  // This matches the storage policy: storage.foldername(name)[1] = auth.uid()

  
  // Create path: userId/randomId.extension
  // This ensures the first folder is the user ID as required by the storage policy
  return `${userId}/${randomId}.${fileExtension}`;
}

/**
 * Uploads a resume file to Supabase storage
 */
export async function uploadResume(
  file: File, 
  userId: string, 
  validation: UploadValidation = RESUME_UPLOAD_VALIDATION
): Promise<UploadResult> {
  try {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for resume upload'
      };
    }

    // Validate the file
    const validationResult = validateFile(file, validation);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    // Generate unique filename
    const fileName = generateResumeFileName(userId, file.name);

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('resume')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file'
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('resume')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Deletes a resume file from Supabase storage
 */
export async function deleteResume(fileName: string): Promise<UploadResult> {
  try {
    const { error } = await supabase.storage
      .from('resume')
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete file'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Deletes a resume file from Supabase storage using the stored filename
 */
export async function deleteResumeByUserId(userId: string): Promise<UploadResult> {
  try {
    // First, get the user's resume URL from the database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('resume_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return {
        success: false,
        error: fetchError.message || 'Failed to fetch user data'
      };
    }

    if (!userData?.resume_url) {
      return {
        success: false,
        error: 'No resume file found for this user'
      };
    }

    // Extract filename from the URL
    // Supabase storage URLs typically have the format: 
    // https://project.supabase.co/storage/v1/object/public/resume/userId/filename
    try {
      const url = new URL(userData.resume_url);
      const pathParts = url.pathname.split('/');
      
      // Find the index of 'resume' in the path
      const resumeIndex = pathParts.findIndex(part => part === 'resume');
      if (resumeIndex === -1 || resumeIndex + 2 >= pathParts.length) {
        throw new Error('Invalid resume URL format');
      }
      
      // Extract userId and filename from the path
      const fileUserId = pathParts[resumeIndex + 1];
      const fileName = pathParts[resumeIndex + 2];
      const fullFileName = `${fileUserId}/${fileName}`;

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('resume')
        .remove([fullFileName]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return {
          success: false,
          error: deleteError.message || 'Failed to delete file'
        };
      }
    } catch (urlError) {
      console.error('Error parsing resume URL:', urlError);
      return {
        success: false,
        error: 'Invalid resume URL format'
      };
    }

    // Update the database to remove the resume URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        resume_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return {
        success: false,
        error: updateError.message || 'Failed to update database'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Updates a user's resume URL in the database
 */
export async function updateUserResumeUrl(userId: string, resumeUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        resume_url: resumeUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Database update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update resume URL in database'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Database update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Complete resume upload workflow - uploads file and updates user profile
 */
export async function uploadResumeAndUpdateProfile(
  file: File, 
  userId: string, 
  validation: UploadValidation = RESUME_UPLOAD_VALIDATION
): Promise<UploadResult> {
  try {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for resume upload'
      };
    }

    // Upload the file
    const uploadResult = await uploadResume(file, userId, validation);
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    // Update the user's resume URL in the database
    const updateResult = await updateUserResumeUrl(userId, uploadResult.url!);
    
    if (!updateResult.success) {
      // If database update fails, try to delete the uploaded file
      await deleteResumeByUserId(userId);
      return {
        success: false,
        error: updateResult.error
      };
    }

    return uploadResult;

  } catch (error) {
    console.error('Complete upload workflow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Generates a unique filename for the profile picture
 */
export function generateProfilePictureFileName(userId: string, originalFileName: string): string {
  if (!userId) {
    throw new Error('userId is required for profile picture upload');
  }
  
  const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Create path: userId/randomId.extension
  // This ensures the first folder is the user ID as required by the storage policy
  return `${userId}/${randomId}.${fileExtension}`;
}

/**
 * Uploads a profile picture file to Supabase storage
 */
export async function uploadProfilePicture(
  file: File, 
  userId: string, 
  validation: UploadValidation = PROFILE_PICTURE_UPLOAD_VALIDATION
): Promise<UploadResult> {
  try {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for profile picture upload'
      };
    }

    // Validate the file
    const validationResult = validateFile(file, validation);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    // Generate unique filename
    const fileName = generateProfilePictureFileName(userId, file.name);

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('profile-picture')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file'
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('profile-picture')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Deletes a profile picture file from Supabase storage using the stored filename
 */
export async function deleteProfilePictureByUserId(userId: string): Promise<UploadResult> {
  try {
    // First, get the user's profile picture URL from the database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('photo_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return {
        success: false,
        error: fetchError.message || 'Failed to fetch user data'
      };
    }

    if (!userData?.photo_url) {
      return {
        success: false,
        error: 'No profile picture found for this user'
      };
    }

    // Extract filename from the URL
    try {
      const url = new URL(userData.photo_url);
      const pathParts = url.pathname.split('/');
      
      // Find the index of 'profile-picture' in the path
      const profilePictureIndex = pathParts.findIndex(part => part === 'profile-picture');
      if (profilePictureIndex === -1 || profilePictureIndex + 2 >= pathParts.length) {
        throw new Error('Invalid profile picture URL format');
      }
      
      // Extract userId and filename from the path
      const fileUserId = pathParts[profilePictureIndex + 1];
      const fileName = pathParts[profilePictureIndex + 2];
      const fullFileName = `${fileUserId}/${fileName}`;

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-picture')
        .remove([fullFileName]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return {
          success: false,
          error: deleteError.message || 'Failed to delete file'
        };
      }
    } catch (urlError) {
      console.error('Error parsing profile picture URL:', urlError);
      return {
        success: false,
        error: 'Invalid profile picture URL format'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Updates a user's profile picture URL in the database
 */
export async function updateUserProfilePictureUrl(userId: string, profilePictureUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        photo_url: profilePictureUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Database update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile picture URL in database'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Database update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Complete profile picture upload workflow - uploads file and updates user profile
 */
export async function uploadProfilePictureAndUpdateProfile(
  file: File, 
  userId: string, 
  validation: UploadValidation = PROFILE_PICTURE_UPLOAD_VALIDATION
): Promise<UploadResult> {
  try {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for profile picture upload'
      };
    }

    // Delete existing profile picture if it exists
    await deleteProfilePictureByUserId(userId);

    // Upload the new file
    const uploadResult = await uploadProfilePicture(file, userId, validation);
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    // Update the user's profile picture URL in the database
    const updateResult = await updateUserProfilePictureUrl(userId, uploadResult.url!);
    
    if (!updateResult.success) {
      // If database update fails, try to delete the uploaded file
      await deleteProfilePictureByUserId(userId);
      return {
        success: false,
        error: updateResult.error
      };
    }

    return uploadResult;

  } catch (error) {
    console.error('Complete upload workflow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Generates a unique filename for free resources
 */
export function generateFreeResourceFileName(userId: string, originalFileName: string): string {
  if (!userId) {
    throw new Error('userId is required for free resource upload');
  }
  
  const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop()?.toLowerCase() || 'pdf';
  
  // Create path: userId/randomId.extension
  // This ensures the first folder is the user ID as required by the storage policy
  return `${userId}/${randomId}.${fileExtension}`;
}

/**
 * Uploads a free resource file to Supabase storage
 */
export async function uploadFreeResource(
  file: File, 
  userId: string, 
  validation: UploadValidation = FREE_RESOURCE_UPLOAD_VALIDATION
): Promise<UploadResult> {
  try {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for free resource upload'
      };
    }

    // Validate the file
    const validationResult = validateFile(file, validation);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    // Generate unique filename
    const fileName = generateFreeResourceFileName(userId, file.name);

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('free-resources')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file'
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('free-resources')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Complete free resource upload workflow - uploads file and returns URL
 */
export async function uploadFreeResourceAndGetUrl(
  file: File, 
  userId: string, 
  validation: UploadValidation = FREE_RESOURCE_UPLOAD_VALIDATION
): Promise<UploadResult> {
  try {
    // Validate userId is provided
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required for free resource upload'
      };
    }

    // Upload the file
    const uploadResult = await uploadFreeResource(file, userId, validation);
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    return uploadResult;

  } catch (error) {
    console.error('Complete upload workflow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

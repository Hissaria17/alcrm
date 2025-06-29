"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Save,
  Camera,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Download,
  Trash2,
  MapPin,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { useUser, useUserProfile } from "@/contexts/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { User as UserType } from '@/lib/supabase';
import { ProfileSkeleton } from '@/components/skeletons/user/profile-skeleton';
import { 
  uploadResumeAndUpdateProfile, 
  deleteResumeByUserId, 
  RESUME_UPLOAD_VALIDATION,
  uploadProfilePictureAndUpdateProfile,
  deleteProfilePictureByUserId,
  PROFILE_PICTURE_UPLOAD_VALIDATION
} from "@/lib/utils";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const user = useUser();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<UserType>({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'USER',
    resume_url: '',
    phone: '',
    bio: '',
    photo_url: '',
    base_location: '',
    current_location: '',
    qualification: '',
    date_of_birth: '',
    whatsapp_number: '',
    created_at: '',
    updated_at: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile && user) {
      setProfileData({
        id: userProfile.id || '',
        email: user.email || '',
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        role: userProfile.role || 'USER',
        resume_url: userProfile.resume_url || '',
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
        photo_url: userProfile.photo_url || '',
        base_location: userProfile.base_location || '',
        current_location: userProfile.current_location || '',
        qualification: userProfile.qualification || '',
        date_of_birth: userProfile.date_of_birth || '',
        whatsapp_number: userProfile.whatsapp_number || '',
        created_at: userProfile.created_at || '',
        updated_at: userProfile.updated_at || '',
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (field: keyof UserType, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingPhoto(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      // Use the utility function for profile picture upload
      const result = await uploadProfilePictureAndUpdateProfile(file, user.id, PROFILE_PICTURE_UPLOAD_VALIDATION);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success && result.url) {
        // Update local state with the new profile picture URL
        setProfileData(prev => ({
          ...prev,
          photo_url: result.url || ''
        }));
        
        toast.success('Profile picture uploaded successfully!');
      } else {
        throw new Error(result.error || 'Failed to upload profile picture');
      }
    } catch (error: unknown) {
      clearInterval(progressInterval);
      console.error('Error uploading photo:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo";
      toast.error(errorMessage);
    } finally {
      setIsUploadingPhoto(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
      
      // Reset the file input
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  const handlePhotoDelete = async () => {
    if (!user?.id || !profileData.photo_url) return;

    setIsUploadingPhoto(true);

    try {
      // Use the utility function for profile picture deletion
      const result = await deleteProfilePictureByUserId(user.id);
      
      if (result.success) {
        // Update local state
        setProfileData(prev => ({
          ...prev,
          photo_url: ''
        }));

        toast.success('Profile picture deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete profile picture');
      }
    } catch (error: unknown) {
      console.error('Error deleting photo:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete photo";
      toast.error(errorMessage);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setSelectedFile(file);
    await processResumeUpload(file);
    
    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !user?.id) return;

    setSelectedFile(file);
    await processResumeUpload(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processResumeUpload = async (file: File) => {
    setIsUploadingResume(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      // Use the utility function for resume upload
      const result = await uploadResumeAndUpdateProfile(file, user!.id, RESUME_UPLOAD_VALIDATION);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        // Update local state with the new resume URL
        setProfileData(prev => ({
          ...prev,
          resume_url: result.url || ''
        }));
        
        setSelectedFile(null);
        toast.success('Resume uploaded successfully!');
      } else {
        throw new Error(result.error || 'Failed to upload resume');
      }
    } catch (error: unknown) {
      clearInterval(progressInterval);
      console.error('Error uploading resume:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload resume";
      toast.error(errorMessage);
    } finally {
      setIsUploadingResume(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleResumeDelete = async () => {
    if (!user?.id || !profileData.resume_url) return;

    try {
      // Use the utility function for resume deletion by user ID
      const result = await deleteResumeByUserId(user.id);
      
      if (result.success) {
        // Update local state
        setProfileData(prev => ({
          ...prev,
          resume_url: ''
        }));

        toast.success('Resume deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete resume');
      }
    } catch (error: unknown) {
      console.error('Error deleting resume:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete resume";
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          bio: profileData.bio,
          base_location: profileData.base_location,
          current_location: profileData.current_location,
          qualification: profileData.qualification,
          date_of_birth: profileData.date_of_birth,
          whatsapp_number: profileData.whatsapp_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setSuccess("Password updated successfully!");
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success('Password updated successfully!');
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };


  const getInitials = () => {
    const firstName = profileData.first_name || '';
    const lastName = profileData.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Photo Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profileData.photo_url || undefined} alt="Profile" />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              
              <div className="space-y-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="w-full"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {profileData.photo_url ? 'Change Photo' : 'Upload Photo'}
                    </>
                  )}
                </Button>
                
                {profileData.photo_url && (
                  <Button
                    variant="destructive"
                    onClick={handlePhotoDelete}
                    disabled={isUploadingPhoto}
                    className="w-full"
                    size="sm"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Photo
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {isUploadingPhoto && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500 mt-2">Uploading photo...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    value={profileData.whatsapp_number}
                    onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your WhatsApp number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseLocation">Base Location</Label>
                  <Input
                    id="baseLocation"
                    value={profileData.base_location}
                    onChange={(e) => handleInputChange('base_location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your permanent location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentLocation">Current Location</Label>
                  <Input
                    id="currentLocation"
                    value={profileData.current_location}
                    onChange={(e) => handleInputChange('current_location', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your current location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={profileData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your highest qualification"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileData.resume_url ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">Resume Uploaded</h4>
                      <p className="text-sm text-green-700">Your resume is ready for job applications</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(profileData.resume_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingResume}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Update Resume
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResumeDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900">No Resume Uploaded</h4>
                      <p className="text-sm text-orange-700">Upload your resume to apply for jobs</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">File Requirements:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Supported formats: PDF, DOC, DOCX</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Ensure your resume is up-to-date and professional</li>
                    </ul>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {isDragOver ? 'Drop your resume here' : 'Drag and drop your resume here, or'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingResume}
                      className="mt-2"
                    >
                      {isUploadingResume ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>

                  {selectedFile && !isUploadingResume && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-blue-900">Selected File:</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelectedFile}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <FileText className="h-4 w-4" />
                        <span>{selectedFile.name}</span>
                        <span className="text-blue-600">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isUploadingResume && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500 mt-2">Uploading resume... {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new password.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter your current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Enter your new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordUpdate}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 
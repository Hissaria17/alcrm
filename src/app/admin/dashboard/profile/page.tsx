"use client";

import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useClientRouteGuard } from "@/hooks/useClientRouteGuard";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Trash2
} from "lucide-react";
import { useUser, useUserProfile } from "@/contexts/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  uploadProfilePictureAndUpdateProfile, 
  deleteProfilePictureByUserId,
  PROFILE_PICTURE_UPLOAD_VALIDATION 
} from "@/lib/utils";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  role: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  // Auth checks
  const { loading: authLoading, isAuthenticated } = useAuthGuard();
  const { isAdmin, requireRole } = useAuth();
  
  // Client-side route protection
  useClientRouteGuard();

  const user = useUser();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    role: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Verify admin role access
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      requireRole(['ADMIN']);
    }
  }, [authLoading, isAuthenticated, requireRole]);

  // Load user profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile && user && isAdmin) {
      setProfileData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        email: user.email || "",
        phone: userProfile.phone || "",
        bio: userProfile.bio || "",
        role: userProfile.role || "",
      });
    }
  }, [userProfile, user, isAdmin]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
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

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name.trim(),
          phone: profileData.phone.trim(),
          bio: profileData.bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      setError(errorMessage);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setIsChangingPassword(true);
    setError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setIsChangingPassword(false);
      return;
    }

    try {
      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully!");
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      setError(errorMessage);
      toast.error("Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}`.toUpperCase();
    }
    if (profileData.email) {
      return profileData.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingPhoto(true);
    setError("");
    setSuccess("");

    try {
      const result = await uploadProfilePictureAndUpdateProfile(file, user.id);
      
      if (result.success) {
        toast.success("Profile picture updated successfully!");
        setSuccess("Profile picture updated successfully!");
        // Force a page refresh to show the new image
        window.location.reload();
      } else {
        throw new Error(result.error || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload profile picture";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploadingPhoto(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    if (!user?.id) return;

    const confirmed = window.confirm("Are you sure you want to delete your profile picture?");
    if (!confirmed) return;

    setIsUploadingPhoto(true);
    setError("");
    setSuccess("");

    try {
      const result = await deleteProfilePictureByUserId(user.id);
      
      if (result.success) {
        toast.success("Profile picture deleted successfully!");
        setSuccess("Profile picture deleted successfully!");
        
        // Update the database to remove the photo_url
        await supabase
          .from('users')
          .update({
            photo_url: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        // Force a page refresh to show the change
        window.location.reload();
      } else {
        throw new Error(result.error || "Failed to delete profile picture");
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete profile picture";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Admin Profile" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin (redirect will happen)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Admin Profile" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={userProfile?.photo_url || undefined} 
                        alt="Profile" 
                      />
                      <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    
                    {/* Upload Button */}
                    <div className="absolute -bottom-2 -right-2">
                      <input
                        type="file"
                        id="photo-upload"
                        accept={PROFILE_PICTURE_UPLOAD_VALIDATION.allowedTypes.join(',')}
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploadingPhoto}
                      />
                      <label htmlFor="photo-upload">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-full p-0 cursor-pointer"
                          disabled={isUploadingPhoto}
                          asChild
                        >
                          <span>
                            {isUploadingPhoto ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>

                    {/* Delete Button - Only show if user has a profile picture */}
                    {userProfile?.photo_url && (
                      <div className="absolute -top-2 -right-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 rounded-full p-0 bg-red-50 border-red-200 hover:bg-red-100"
                          onClick={handlePhotoDelete}
                          disabled={isUploadingPhoto}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        {isEditing ? (
                          <Input
                            id="first_name"
                            value={profileData.first_name}
                            onChange={(e) => handleInputChange("first_name", e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{profileData.first_name || "Not provided"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        {isEditing ? (
                          <Input
                            id="last_name"
                            value={profileData.last_name}
                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900 font-medium">{profileData.last_name || "Not provided"}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{profileData.email}</span>
                        </div>
                        <p className="text-xs text-gray-500">Email cannot be changed here</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {isEditing ? (
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <span className="text-gray-600">{profileData.phone || "Not provided"}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-gray-600 leading-relaxed">{profileData.bio || "No bio provided"}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Joined {userProfile?.created_at ? formatDate(userProfile.created_at) : "Unknown"}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        <Shield className="h-3 w-3 mr-1" />
                        {profileData.role === 'ADMIN' ? 'Administrator' : 'User'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
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
                          Enter your new password below. Make sure it&apos;s at least 6 characters long.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                        {error && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">{error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsPasswordDialogOpen(false);
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                            setError("");
                          }}
                          disabled={isChangingPassword}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handlePasswordUpdate} disabled={isChangingPassword}>
                          {isChangingPassword ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Key className="h-4 w-4 mr-2" />
                          )}
                          {isChangingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 
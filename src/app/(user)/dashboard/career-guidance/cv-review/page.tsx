"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Star,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface MentorshipSession {
  session_id: string;
  mentor_id?: string;
  user_id: string;
  session_type: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  scheduled_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  is_deleted: boolean;
  session_duration_minutes?: number;
  session_rating?: number;
  session_feedback?: string;
  mentor_notes?: string;
  updated_at: string;
}

export default function CVReviewPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviewRequests, setReviewRequests] = useState<MentorshipSession[]>([]);
  const [formData, setFormData] = useState({
    session_type: "CV_REVIEW",
    notes: "",
    use_current_resume: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const MAX_REQUESTS = 2;
  const requestsUsed = reviewRequests.length;
  const requestsRemaining = MAX_REQUESTS - requestsUsed;

  const loadReviewRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'CV_REVIEW')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviewRequests(data || []);
    } catch (error) {
      console.error('Error loading review requests:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReviewRequests();
    }
  }, [user, loadReviewRequests]);

  const handleFileUpload = async (file: File) => {
    if (!user) return null;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload resume');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      toast.error('Please sign in to submit a CV review request');
      return;
    }

    if (requestsRemaining <= 0) {
      toast.error('You have reached the maximum number of CV review requests (2)');
      return;
    }

    if (!formData.session_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    let resumeUrl = user.resume_url;

    // Handle file upload if new resume is selected
    if (!formData.use_current_resume && selectedFile) {
      resumeUrl = await handleFileUpload(selectedFile);
      if (!resumeUrl) return;
    }

    if (!resumeUrl) {
      toast.error('Please upload a resume or use your current resume');
      return;
    }

    try {
      setIsLoading(true);
      const {  error } = await supabase
        .from('mentorship_sessions')
        .insert([{
          user_id: user.id,
          session_type: formData.session_type,
          status: 'PENDING',
          notes: formData.notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('CV review request submitted successfully!');
      setFormData({
        session_type: "CV_REVIEW",
        notes: "",
        use_current_resume: true
      });
      setSelectedFile(null);
      loadReviewRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit CV review request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'SCHEDULED': return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/career-guidance" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Career Guidance
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CV Review & Enhancement</h1>
            <p className="text-gray-600">Get your resume professionally reviewed and enhanced by industry experts</p>
          </div>
        </div>

        {/* Usage Tracker */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Requests Used</span>
            <span className="text-sm text-blue-600">{requestsUsed} / {MAX_REQUESTS}</span>
          </div>
          <Progress value={(requestsUsed / MAX_REQUESTS) * 100} className="h-2" />
          <p className="text-xs text-blue-600 mt-2">
            You have {requestsRemaining} review request{requestsRemaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Submit CV Review Request
            </CardTitle>
            <CardDescription>
              Get expert feedback on your resume structure, content, and formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {requestsRemaining <= 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have reached the maximum number of CV review requests (2). 
                  Please wait for your current requests to be completed.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Session Type */}
                <div className="space-y-2">
                  <Label htmlFor="session-type">Session Type *</Label>
                  <Select value={formData.session_type} onValueChange={(value) => setFormData(prev => ({ ...prev, session_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CV_REVIEW">CV Review & Enhancement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Resume Source */}
                <div className="space-y-4">
                  <Label>Resume Source</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="current-resume"
                        name="resume-source"
                        checked={formData.use_current_resume}
                        onChange={() => setFormData(prev => ({ ...prev, use_current_resume: true }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="current-resume" className="text-sm font-medium">
                        Use my current resume
                      </label>
                      {user?.resume_url && (
                        <Badge variant="outline" className="text-xs">Available</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="new-resume"
                        name="resume-source"
                        checked={!formData.use_current_resume}
                        onChange={() => setFormData(prev => ({ ...prev, use_current_resume: false }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor="new-resume" className="text-sm font-medium">
                        Upload new resume
                      </label>
                    </div>
                  </div>

                  {!formData.use_current_resume && (
                    <div className="space-y-2">
                      <Label htmlFor="resume-file">Upload Resume (PDF, DOC, DOCX)</Label>
                      <Input
                        id="resume-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-sm text-green-600">Selected: {selectedFile.name}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific areas you'd like us to focus on? (e.g., formatting, content structure, industry-specific keywords)"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={handleSubmitRequest}
                  disabled={isLoading || uploading || requestsRemaining <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading || uploading ? 'Submitting...' : 'Submit Review Request'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              What You&apos;ll Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Comprehensive Review</h4>
                  <p className="text-sm text-gray-600">Detailed analysis of content, structure, and formatting</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Industry-Specific Feedback</h4>
                  <p className="text-sm text-gray-600">Tailored recommendations for your target industry</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Enhanced Version</h4>
                  <p className="text-sm text-gray-600">Professionally enhanced resume with improvements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold">ATS Optimization</h4>
                  <p className="text-sm text-gray-600">Optimized for Applicant Tracking Systems</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Maximum 2 review requests per user</li>
                <li>• Review process takes 3-5 business days</li>
                <li>• Enhanced resume will be provided in PDF format</li>
                <li>• One revision included per request</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Pricing</h4>
              <p className="text-2xl font-bold text-blue-600">₹2,999 <span className="text-sm font-normal">per review</span></p>
              <p className="text-sm text-blue-600 mt-1">Professional CV enhancement by industry experts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Requests */}
      {reviewRequests.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your CV Review Requests</CardTitle>
            <CardDescription>Track the status of your submitted requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewRequests.map((request) => (
                <div key={request.session_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.replace('_', ' ')}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {request.status === 'COMPLETED' && request.mentor_notes && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        View Feedback
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Session Type:</span> {request.session_type}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {request.status}
                    </div>
                  </div>
                  {request.mentor_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <span className="font-medium text-sm">Feedback:</span>
                      <p className="text-sm mt-1">{request.mentor_notes}</p>
                    </div>
                  )}
                  {request.notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <span className="font-medium text-sm">Your Notes:</span>
                      <p className="text-sm mt-1">{request.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
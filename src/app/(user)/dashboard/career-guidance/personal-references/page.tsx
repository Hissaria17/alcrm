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
  Handshake, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  ArrowLeft,
  Target,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { mentorshipSessionAPI, type MentorshipSession } from "@/lib/api/career-guidance";

const organizations = [
  { 
    id: "big4", 
    name: "Big 4 Firms", 
    companies: ["Deloitte", "PwC", "EY", "KPMG"],
    description: "Top global accounting and consulting firms"
  },
  { 
    id: "mid-tier", 
    name: "Mid-Tier Firms", 
    companies: ["BDO", "Grant Thornton", "RSM", "Baker Tilly"],
    description: "Established mid-tier accounting firms"
  },
  { 
    id: "banks", 
    name: "Banks & Financial Services", 
    companies: ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"],
    description: "Leading banking and financial institutions"
  },
  { 
    id: "corporates", 
    name: "Corporates & MNCs", 
    companies: ["TCS", "Infosys", "Wipro", "HCL"],
    description: "Fortune 500 and large corporate organizations"
  },
  { 
    id: "consulting", 
    name: "Consulting Firms", 
    companies: ["McKinsey", "BCG", "Bain", "Accenture"],
    description: "Top management and strategy consulting firms"
  },
  { 
    id: "startups", 
    name: "Startups & Unicorns", 
    companies: ["Razorpay", "CRED", "PhonePe", "Groww"],
    description: "High-growth startups and unicorn companies"
  }
];

export default function PersonalReferencesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [referenceSessions, setReferenceSessions] = useState<MentorshipSession[]>([]);
  const [formData, setFormData] = useState({
    target_organization: "",
    specific_company: "",
    message: "",
    experience_level: "",
    target_role: ""
  });

  const MAX_REQUESTS = 3;
  const requestsUsed = referenceSessions.filter(session => 
    session.session_type.toLowerCase().includes('reference') ||
    session.session_type === 'PERSONAL_REFERENCE'
  ).length;
  const requestsRemaining = MAX_REQUESTS - requestsUsed;

  const loadReferenceSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      const sessions = await mentorshipSessionAPI.getUserSessions(user.id);
      // Filter for reference-related sessions
      const referenceSessions = sessions.filter(session => 
        session.session_type.toLowerCase().includes('reference') ||
        session.session_type === 'PERSONAL_REFERENCE'
      );
      setReferenceSessions(referenceSessions);
    } catch (error) {
      console.error('Error loading reference sessions:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReferenceSessions();
    }
  }, [user, loadReferenceSessions]);

  const handleSubmitRequest = async () => {
    if (!user) {
      toast.error('Please sign in to request a reference');
      return;
    }

    if (requestsRemaining <= 0) {
      toast.error('You have reached the maximum number of reference requests (3)');
      return;
    }

    if (!formData.target_organization || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create session notes with form data
      const sessionNotes = `Organization: ${formData.target_organization}${formData.specific_company ? `, Company: ${formData.specific_company}` : ''}${formData.experience_level ? `, Experience: ${formData.experience_level}` : ''}${formData.target_role ? `, Target Role: ${formData.target_role}` : ''}, Message: ${formData.message.trim()}`;
      
      const sessionData = {
        mentor_id: 'system-reference-coordinator', // System mentor for reference coordination
        user_id: user.id,
        session_type: 'PERSONAL_REFERENCE',
        notes: sessionNotes
      };

      await mentorshipSessionAPI.bookSession(sessionData);
      
      toast.success('Reference request submitted successfully!');
      setFormData({
        target_organization: "",
        specific_company: "",
        message: "",
        experience_level: "",
        target_role: ""
      });
      loadReferenceSessions();
    } catch (error) {
      console.error('Error requesting reference:', error);
      toast.error('Failed to submit reference request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const selectedOrg = organizations.find(org => org.id === formData.target_organization);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/career-guidance" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Career Guidance
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
            <Handshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personal Job References</h1>
            <p className="text-gray-600">Get direct referrals to top organizations through our professional network</p>
          </div>
        </div>

        {/* Usage Tracker */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Requests Used</span>
            <span className="text-sm text-purple-600">{requestsUsed} / {MAX_REQUESTS}</span>
          </div>
          <Progress value={(requestsUsed / MAX_REQUESTS) * 100} className="h-2" />
          <p className="text-xs text-purple-600 mt-2">
            You have {requestsRemaining} reference request{requestsRemaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Submit Reference Request
              </CardTitle>
              <CardDescription>
                Get connected to hiring managers and decision makers at your target organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {requestsRemaining <= 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have reached the maximum number of reference requests (3). 
                    Please wait for your current requests to be processed.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Target Organization */}
                  <div className="space-y-2">
                    <Label htmlFor="target-organization">Target Organization Type *</Label>
                    <Select 
                      value={formData.target_organization} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, target_organization: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div>
                              <div className="font-medium">{org.name}</div>
                              <div className="text-xs text-gray-500">{org.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedOrg && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Popular companies in this category:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedOrg.companies.map((company) => (
                            <Badge key={company} variant="outline" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specific Company */}
                  <div className="space-y-2">
                    <Label htmlFor="specific-company">Specific Company (Optional)</Label>
                    <Input
                      id="specific-company"
                      placeholder="Enter specific company name if you have a preference..."
                      value={formData.specific_company}
                      onChange={(e) => setFormData(prev => ({ ...prev, specific_company: e.target.value }))}
                    />
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-2">
                    <Label htmlFor="experience-level">Your Experience Level</Label>
                    <Select 
                      value={formData.experience_level} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior-level">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="executive">Executive (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Role */}
                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Role (Optional)</Label>
                    <Input
                      id="target-role"
                      placeholder="e.g., Senior Analyst, Manager, Director..."
                      value={formData.target_role}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_role: e.target.value }))}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Background & Requirements *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your background, experience, and what you're looking for. Include any specific requirements or preferences..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500">
                      Tip: Include your domain expertise, career goals, and why you re interested in this organization
                    </p>
                  </div>

                  <Button 
                    onClick={handleSubmitRequest}
                    disabled={isLoading || requestsRemaining <= 0}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Reference Request'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Direct Referrals</h4>
                    <p className="text-sm text-gray-600">Personal introductions to hiring managers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Priority Consideration</h4>
                    <p className="text-sm text-gray-600">Your application gets noticed first</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Insider Information</h4>
                    <p className="text-sm text-gray-600">Get insights about company culture and openings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Network Access</h4>
                    <p className="text-sm text-gray-600">Connect with industry professionals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">85%</div>
                <p className="text-sm text-gray-600">Interview Success Rate</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">72%</div>
                  <p className="text-xs text-gray-600">Offer Rate</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">5-7</div>
                  <p className="text-xs text-gray-600">Days Average</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">1</div>
                  <div>
                    <h4 className="font-medium">Submit Request</h4>
                    <p className="text-sm text-gray-600">Provide your background and preferences</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">2</div>
                  <div>
                    <h4 className="font-medium">Profile Review</h4>
                    <p className="text-sm text-gray-600">Our team reviews and matches you</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">3</div>
                  <div>
                    <h4 className="font-medium">Referral Connection</h4>
                    <p className="text-sm text-gray-600">Direct introduction to hiring team</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">4</div>
                  <div>
                    <h4 className="font-medium">Follow-up Support</h4>
                    <p className="text-sm text-gray-600">Ongoing guidance throughout process</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">₹4,999</div>
                <p className="text-sm text-gray-600">per organization</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Maximum 3 requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>6-month validity</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Previous Requests */}
      {referenceSessions.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Reference Requests</CardTitle>
            <CardDescription>Track the status of your submitted reference requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referenceSessions.map((session) => (
                <div key={session.session_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.session_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">Reference Request</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <span className="font-medium">Request Details:</span>
                    <p className="mt-1">{session.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
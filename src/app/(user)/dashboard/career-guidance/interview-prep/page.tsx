"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  ArrowLeft,
  Calendar,
  User,
  Target
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { mentorshipSessionAPI, type MentorshipSession } from "@/lib/api/career-guidance";

export default function InterviewPrepPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [interviewSessions, setInterviewSessions] = useState<MentorshipSession[]>([]);
  const [activeTab, setActiveTab] = useState("mock-interview");
  const [formData, setFormData] = useState<{
    session_type: 'MOCK_INTERVIEW' | 'DOMAIN_COACHING' | 'BEHAVIORAL_PREP';
    domain: string;
    experience_level: string;
    target_role: string;
    specific_focus: string;
    preferred_date: string;
  }>({
    session_type: 'MOCK_INTERVIEW',
    domain: "",
    experience_level: "",
    target_role: "",
    specific_focus: "",
    preferred_date: ""
  });

  const MAX_REQUESTS = 3;
  const requestsUsed = interviewSessions.filter(session => 
    session.session_type.includes('INTERVIEW') || 
    session.session_type.includes('COACHING') || 
    session.session_type.includes('BEHAVIORAL')
  ).length;
  const requestsRemaining = MAX_REQUESTS - requestsUsed;

  const loadInterviewSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      const sessions = await mentorshipSessionAPI.getUserSessions(user.id);
      const interviewSessions = sessions.filter(session => 
        session.session_type.includes('INTERVIEW') || 
        session.session_type.includes('COACHING') || 
        session.session_type.includes('BEHAVIORAL')
      );
      setInterviewSessions(interviewSessions);
    } catch (error) {
      console.error('Error loading interview sessions:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadInterviewSessions();
    }
  }, [user, loadInterviewSessions]);

  const handleSubmitRequest = async () => {
    if (!user) {
      toast.error('Please sign in to book an interview prep session');
      return;
    }

    if (requestsRemaining <= 0) {
      toast.error('You have reached the maximum number of interview prep sessions (3)');
      return;
    }

    if (!formData.domain || !formData.experience_level) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create session notes with form data
      const sessionNotes = `Domain: ${formData.domain}, Experience: ${formData.experience_level}${formData.target_role ? `, Target Role: ${formData.target_role}` : ''}${formData.specific_focus ? `, Focus: ${formData.specific_focus}` : ''}`;
      
      const sessionData = {
        mentor_id: null, // Use null for system-generated interview prep sessions
        user_id: user.id,
        session_type: formData.session_type,
        scheduled_at: formData.preferred_date || undefined,
        notes: sessionNotes
      };

      await mentorshipSessionAPI.bookSession(sessionData);

      toast.success('Interview prep session booked successfully!');
      setFormData({
        session_type: 'MOCK_INTERVIEW',
        domain: "",
        experience_level: "",
        target_role: "",
        specific_focus: "",
        preferred_date: ""
      });
      loadInterviewSessions();
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book interview prep session');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'SCHEDULED': return <Calendar className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const sessionTypes = [
    {
      id: 'MOCK_INTERVIEW',
      title: 'Mock Interview',
      description: 'Full-length mock interview with industry professionals',
      duration: '60 minutes',
      price: '₹3,999',
      features: ['Real interview simulation', 'Detailed feedback', 'Performance scoring', 'Improvement recommendations']
    },
    {
      id: 'DOMAIN_COACHING',
      title: 'Domain Coaching',
      description: 'Focused coaching on domain-specific questions and scenarios',
      duration: '45 minutes',
      price: '₹2,999',
      features: ['Industry-specific preparation', 'Technical question practice', 'Case study discussions', 'Expert guidance']
    },
    {
      id: 'BEHAVIORAL_PREP',
      title: 'Behavioral Prep',
      description: 'Practice behavioral and situational interview questions',
      duration: '30 minutes',
      price: '₹1,999',
      features: ['STAR method training', 'Common questions practice', 'Communication skills', 'Confidence building']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/career-guidance" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Career Guidance
        </Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain-Specific Interview Prep</h1>
            <p className="text-gray-600">Professional interview preparation tailored to your industry and role</p>
          </div>
        </div>

        {/* Usage Tracker */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Sessions Used</span>
            <span className="text-sm text-green-600">{requestsUsed} / {MAX_REQUESTS}</span>
          </div>
          <Progress value={(requestsUsed / MAX_REQUESTS) * 100} className="h-2" />
          <p className="text-xs text-green-600 mt-2">
            You have {requestsRemaining} session{requestsRemaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Session Types */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Prep Session</CardTitle>
              <CardDescription>Select the type of interview preparation that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mock-interview">Mock Interview</TabsTrigger>
                  <TabsTrigger value="domain-coaching">Domain Coaching</TabsTrigger>
                  <TabsTrigger value="behavioral-prep">Behavioral Prep</TabsTrigger>
                </TabsList>

                {sessionTypes.map((sessionType) => (
                  <TabsContent 
                    key={sessionType.id} 
                    value={sessionType.id.toLowerCase().replace('_', '-')}
                    className="mt-6"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{sessionType.title}</h3>
                          <p className="text-gray-600">{sessionType.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{sessionType.price}</p>
                          <p className="text-sm text-gray-500">{sessionType.duration}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {sessionType.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {requestsRemaining <= 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            You have reached the maximum number of interview prep sessions (3). 
                            Please wait for your current sessions to be completed.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {/* Domain Selection */}
                          <div className="space-y-2">
                            <Label htmlFor="domain">Domain/Industry *</Label>
                            <Select 
                              value={formData.domain} 
                              onValueChange={(value) => {
                                setFormData(prev => ({ ...prev, domain: value, session_type: sessionType.id as 'MOCK_INTERVIEW' | 'DOMAIN_COACHING' | 'BEHAVIORAL_PREP' }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select your target domain" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="accounting">Accounting & Finance</SelectItem>
                                <SelectItem value="audit">Audit & Assurance</SelectItem>
                                <SelectItem value="tax">Tax & Compliance</SelectItem>
                                <SelectItem value="consulting">Business Consulting</SelectItem>
                                <SelectItem value="banking">Banking & Financial Services</SelectItem>
                                <SelectItem value="technology">Technology & IT</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="retail">Retail & Consumer Goods</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Experience Level */}
                          <div className="space-y-2">
                            <Label htmlFor="experience-level">Experience Level *</Label>
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
                            <Select 
                              value={formData.target_role} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, target_role: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select target role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="analyst">Analyst</SelectItem>
                                <SelectItem value="associate">Associate</SelectItem>
                                <SelectItem value="senior-associate">Senior Associate</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="senior-manager">Senior Manager</SelectItem>
                                <SelectItem value="director">Director</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Specific Focus */}
                          <div className="space-y-2">
                            <Label htmlFor="specific-focus">Specific Focus Areas (Optional)</Label>
                            <Textarea
                              id="specific-focus"
                              placeholder="Any specific topics, skills, or areas you'd like to focus on during the session..."
                              value={formData.specific_focus}
                              onChange={(e) => setFormData(prev => ({ ...prev, specific_focus: e.target.value }))}
                              className="min-h-[80px]"
                            />
                          </div>

                          {/* Preferred Date */}
                          <div className="space-y-2">
                            <Label htmlFor="preferred-date">Preferred Date & Time</Label>
                            <input
                              type="datetime-local"
                              id="preferred-date"
                              value={formData.preferred_date}
                              onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>

                          <Button 
                            onClick={handleSubmitRequest}
                            disabled={isLoading || requestsRemaining <= 0}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {isLoading ? 'Booking...' : `Book ${sessionType.title} - ${sessionType.price}`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Expert Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Our Experts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold">Industry Professionals</h4>
                <p className="text-sm text-gray-600 mt-2">
                  Our interview coaches are experienced professionals from top companies with 10+ years of industry experience.
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Big 4 Accounting Firms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Top Consulting Companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Leading Financial Institutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Fortune 500 Companies</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">92%</div>
                <p className="text-sm text-gray-600">Interview Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4.8/5</div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <p className="text-sm text-gray-600">Successful Placements</p>
              </div>
            </CardContent>
          </Card>

          {/* My Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>My Interview Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {interviewSessions.length > 0 ? (
                <div className="space-y-3">
                  {interviewSessions.slice(0, 3).map((session) => (
                    <div key={session.session_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <div>
                          <p className="text-sm font-medium">{session.session_type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">
                            {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                  {interviewSessions.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{interviewSessions.length - 3} more sessions
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No sessions booked yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
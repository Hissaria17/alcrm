"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Video, 
  MessageCircle, 
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { careerMentorAPI, mentorshipSessionAPI, type CareerMentor, type MentorshipSession } from "@/lib/api/career-guidance";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MentorRegistrationDialog } from "@/module/user/components/career-guidance/mentor-registration-dialog";
import Link from "next/link";

export default function MentorshipPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<CareerMentor[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<string>("");
  const [sessionType, setSessionType] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("book-session");

  // Session types with pricing
  const sessionTypes = [
    { value: "career-guidance", label: "Career Guidance", price: 1500, duration: 45, icon: Users },
    { value: "mock-interview", label: "Mock Interview", price: 2500, duration: 60, icon: Video },
    { value: "resume-review", label: "Resume Review", price: 1200, duration: 30, icon: MessageCircle },
    { value: "industry-insights", label: "Industry Insights", price: 1800, duration: 45, icon: Star },
    { value: "skill-development", label: "Skill Development", price: 2000, duration: 60, icon: CheckCircle }
  ];

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [mentorsData, sessionsData] = await Promise.all([
        careerMentorAPI.getMentors(),
        mentorshipSessionAPI.getUserSessions(user!.id)
      ]);
      setMentors(mentorsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load mentorship data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleBookSession = async () => {
    if (!user || !selectedMentor || !sessionType || !scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionData = {
        mentor_id: selectedMentor,
        user_id: user.id,
        session_type: sessionType,
        scheduled_at: scheduledDate,
        notes: sessionNotes || undefined
      };

      await mentorshipSessionAPI.bookSession(sessionData);
      toast.success('Mentorship session booked successfully!');
      setIsBookingDialogOpen(false);
      resetForm();
      loadData(); // Refresh sessions
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMentor("");
    setSessionType("");
    setScheduledDate("");
    setSessionNotes("");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const selectedSessionType = sessionTypes.find(type => type.value === sessionType);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to access mentorship services</h1>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/career-guidance">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Career Guidance
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Expert Mentorship</h1>
        <p className="text-gray-600">Connect with industry experts for personalized career guidance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="book-session">Book Session</TabsTrigger>
          <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="become-mentor">Become Mentor</TabsTrigger>
        </TabsList>

        {/* Book Session Tab */}
        <TabsContent value="book-session" className="space-y-6">
          {/* Session Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card key={type.value} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-[#388E3C] rounded-full flex items-center justify-center mb-3">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                    <CardDescription>{type.duration} minutes</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-[#388E3C] mb-4">₹{type.price}</div>
                    <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-[#388E3C] hover:bg-[#2E7D32]"
                          onClick={() => setSessionType(type.value)}
                        >
                          Book Now
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Available Mentors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Available Mentors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#388E3C] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading mentors...</p>
                </div>
              ) : mentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentors.map((mentor) => (
                    <div key={mentor.mentor_id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={mentor.user?.photo_url} />
                        <AvatarFallback className="bg-[#388E3C] text-white">
                          {mentor.user?.first_name?.[0]}{mentor.user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {mentor.user?.first_name} {mentor.user?.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{mentor.domain}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {mentor.experience_years} years experience
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-[#388E3C] text-white">
                        Expert
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No mentors available at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Sessions Tab */}
        <TabsContent value="my-sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>My Mentorship Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#388E3C] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading sessions...</p>
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.session_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(session.status)}
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {session.session_type.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Scheduled:</strong> {new Date(session.scheduled_at || '').toLocaleString()}
                          </p>
                          {session.completed_at && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Completed:</strong> {new Date(session.completed_at).toLocaleString()}
                            </p>
                          )}
                          {session.session_duration_minutes && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Duration:</strong> {session.session_duration_minutes} minutes
                            </p>
                          )}
                          {session.notes && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Notes:</strong> {session.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {session.session_rating && (
                            <div className="flex items-center space-x-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < session.session_rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(session.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {session.session_feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Feedback:</strong> {session.session_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No mentorship sessions booked yet</p>
                  <Button 
                    className="bg-[#388E3C] hover:bg-[#2E7D32]"
                    onClick={() => setActiveTab("book-session")}
                  >
                    Book Your First Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Become Mentor Tab */}
        <TabsContent value="become-mentor" className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Become a Mentor</CardTitle>
              <CardDescription>
                Share your expertise and help others advance their careers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-16 h-16 bg-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Share Knowledge</h3>
                  <p className="text-sm text-gray-600">Help others with your industry experience</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Build Reputation</h3>
                  <p className="text-sm text-gray-600">Establish yourself as an industry expert</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Flexible Schedule</h3>
                  <p className="text-sm text-gray-600">Work on your own terms and schedule</p>
                </div>
              </div>
              
              <div className="text-center">
                <MentorRegistrationDialog>
                  <Button className="bg-[#388E3C] hover:bg-[#2E7D32] text-white px-8 py-3">
                    Apply to Become a Mentor
                  </Button>
                </MentorRegistrationDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Mentorship Session</DialogTitle>
            <DialogDescription>
              {selectedSessionType && (
                <>Book a {selectedSessionType.label} session for ₹{selectedSessionType.price}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mentor" className="text-right">Mentor</Label>
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.mentor_id} value={mentor.mentor_id}>
                      {mentor.user?.first_name} {mentor.user?.last_name} - {mentor.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduled-date" className="text-right">Date & Time</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="col-span-3"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any specific topics or questions you'd like to discuss..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookSession} disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : `Book Session (₹${selectedSessionType?.price || 0})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
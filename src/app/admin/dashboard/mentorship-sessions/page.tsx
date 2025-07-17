"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { useClientRouteGuard } from "@/hooks/useClientRouteGuard"
import { useAuth } from "@/hooks/useAuth"
import { DashboardHeader } from "@/module/admin/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/module/admin/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, Calendar, Plus, Eye, Clock, Star } from "lucide-react"
import { truncateToWords } from "@/utils/text"
import { DataTable, type DataColumn, formatDate, getStatusBadge, getThemeBadge } from "@/components/data-table"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"
import Image from "next/image"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Mentor {
  mentor_id: string
  user_id: string
  domain: string
  experience_years: number
  bio: string
  created_at: string
  users?: {
    first_name: string
    last_name: string
    email: string
    photo_url?: string
  }
}

interface MentorshipSession {
  session_id: string
  mentor_id: string
  user_id: string
  session_type: string
  status: string
  scheduled_at: string
  completed_at?: string
  session_duration_minutes?: number
  session_rating?: number
  created_at: string
  career_mentors?: {
    users?: {
      first_name: string
      last_name:string
    }
  }
  users?: {
    first_name: string
    last_name:string
  }
}

interface DataAction<T> {
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  onClick: (item: T) => void
}

const ITEMS_PER_PAGE = 10

export default function MentorshipPage() {
  // Auth checks
  const { loading: authLoading, isAuthenticated } = useAuthGuard()
  const { isAdmin, requireRole } = useAuth()
  useClientRouteGuard()

  // State
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [sessions, setSessions] = useState<MentorshipSession[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [activeTab, setActiveTab] = useState<"mentors" | "sessions">("mentors")

  // Add mentor dialog
  const [isAddMentorOpen, setIsAddMentorOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newMentor, setNewMentor] = useState({
    user_id: "",
    domain: "",
    experience_years: 0,
    bio: "",
  })

  // Add session dialog
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    mentor_id: "",
    user_id: "",
    session_type: "",
    scheduled_at: "",
  })

  // Verify admin role access
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      requireRole(["ADMIN"])
    }
  }, [authLoading, isAuthenticated, requireRole])

  // Load data
  const loadMentors = useCallback(async () => {
    try {
      setLoading(true)
      const { data, count, error } = await supabase
        .from("career_mentors")
        .select("*, users(first_name, last_name, email, photo_url)", { count: "exact" })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
        .order("created_at", { ascending: false })
      if (error) throw error
      setMentors(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading mentors:", error)
      toast.error("Failed to load mentors")
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      const { data, count, error } = await supabase
        .from("mentorship_sessions")
        .select("*, career_mentors(users(first_name, last_name)), users(first_name, last_name)", { count: "exact" })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
        .order("scheduled_at", { ascending: false })
      if (error) throw error
      setSessions(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (activeTab === "mentors") {
        loadMentors()
      } else {
        loadSessions()
      }
    }
  }, [currentPage, activeTab, isAuthenticated, isAdmin, loadMentors, loadSessions])

  const handleAddMentor = async () => {
    try {
      setIsCreating(true)
      const { error } = await supabase.from("career_mentors").insert([newMentor])

      if (error) throw error

      toast.success("Mentor added successfully")
      setIsAddMentorOpen(false)
      setNewMentor({ user_id: "", domain: "", experience_years: 0, bio: "" })
      loadMentors()
    } catch (error) {
      console.error("Error adding mentor:", error)
      toast.error("Failed to add mentor")
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddSession = async () => {
    try {
      setIsCreating(true)
      const { error } = await supabase.from("mentorship_sessions").insert([
        {
          ...newSession,
          status: "SCHEDULED",
        },
      ])

      if (error) throw error

      toast.success("Session scheduled successfully")
      setIsAddSessionOpen(false)
      setNewSession({ mentor_id: "", user_id: "", session_type: "", scheduled_at: "" })
      loadSessions()
    } catch (error) {
      console.error("Error scheduling session:", error)
      toast.error("Failed to schedule session")
    } finally {
      setIsCreating(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader headerTitle="Mentorship" />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const mentorColumns: DataColumn<Mentor>[] = [
    {
      key: "users",
      header: "Mentor",
      render: (mentor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {mentor.users?.photo_url ? (
              <Image
                src={mentor.users.photo_url || "/placeholder.svg"}
                alt={`${mentor.users.first_name} ${mentor.users.last_name}`}
                className="w-full h-full object-cover"
                
              />
            ) : (
              <Users className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {mentor.users?.first_name} {mentor.users?.last_name}
            </div>
            <div className="text-sm text-gray-500">{mentor.users?.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "domain",
      header: "Domain",
      render: (mentor) => getThemeBadge(mentor.domain, "primary"),
      sortable: true,
    },
    {
      key: "experience_years",
      header: "Experience",
      render: (mentor) => (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">{mentor.experience_years} years</span>
        </div>
      ),
      sortable: true,
      align: "center",
    },
    {
      key: "bio",
      header: "Bio",
      render: (mentor) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">{truncateToWords(mentor.bio || "No bio available", 5)}</p>
        </div>
      ),
      sortable: false,
    },
    {
      key: "created_at",
      header: "Joined",
      render: (mentor) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDate(mentor.created_at)}</span>
        </div>
      ),
      sortable: true,
      align: "center",
    },
  ]

  const sessionColumns: DataColumn<MentorshipSession>[] = [
    {
      key: "career_mentors",
      header: "Mentor",
      render: (session) => (
        <div className="font-medium">
          {session.career_mentors?.users?.first_name} {session.career_mentors?.users?.last_name}
        </div>
      ),
      sortable: true,
    },
    {
      key: "users",
      header: "Mentee",
      render: (session) => (
        <div className="font-medium">
          {session.users?.first_name} {session.users?.last_name}
        </div>
      ),
      sortable: true,
    },
    {
      key: "session_type",
      header: "Type",
      render: (session) => getThemeBadge(session.session_type, "secondary"),
      sortable: true,
      align: "center",
    },
    {
      key: "status",
      header: "Status",
      render: (session) => getStatusBadge(session.status),
      sortable: true,
      align: "center",
    },
    {
      key: "scheduled_at",
      header: "Scheduled",
      render: (session) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {session.scheduled_at ? formatDate(session.scheduled_at) : "Not scheduled"}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "session_rating",
      header: "Rating",
      render: (session) =>
        session.session_rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm">{session.session_rating}/5</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Not rated</span>
        ),
      sortable: true,
      align: "center",
    },
  ]

  const mentorActions: DataAction<Mentor>[] = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (mentor: Mentor) => console.log("View mentor:", mentor.mentor_id),
    },
  ]

  const sessionActions: DataAction<MentorshipSession>[] = [
    {
      label: "View Details",
      icon: Eye,
      onClick: (session: MentorshipSession) => console.log("View session:", session.session_id),
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader headerTitle="Mentorship" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("mentors")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "mentors"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Mentors
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "sessions"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sessions
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            {activeTab === "mentors" ? (
              <DataTable
                data={mentors.map((mentor) => ({ ...mentor, id: mentor.mentor_id }))}
                columns={mentorColumns}
                title={`All Mentors (${totalCount})`}
                titleIcon={Users}
                subtitle="Manage career mentors and their expertise"
                actions={mentorActions}
                searchable={true}
                searchPlaceholder="Search mentors..."
                searchKeys={["domain", "bio"]}
                sortable={true}
                pagination={{
                  enabled: true,
                  pageSize: ITEMS_PER_PAGE,
                  currentPage: currentPage,
                  totalCount: totalCount,
                  onPageChange: setCurrentPage,
                }}
                emptyMessage="No mentors found"
                emptyIcon={Users}
                emptyAction={{
                  label: "Add Mentor",
                  onClick: () => setIsAddMentorOpen(true),
                  icon: Plus,
                }}
                addAction={{
                  label: "Add Mentor",
                  onClick: () => setIsAddMentorOpen(true),
                  icon: Plus,
                  show: true,
                }}
                loading={loading}
                onRefresh={loadMentors}
                striped={true}
                hoverable={true}
                bordered={true}
                theme="primary"
                cardProps={{
                  showCard: true,
                  className: "shadow-sm",
                }}
              />
            ) : (
              <DataTable
                data={sessions.map((session) => ({ ...session, id: session.session_id }))}
                columns={sessionColumns}
                title={`All Sessions (${totalCount})`}
                titleIcon={Calendar}
                subtitle="Track and manage mentorship sessions"
                actions={sessionActions}
                searchable={true}
                searchPlaceholder="Search sessions..."
                searchKeys={["session_type", "status"]}
                sortable={true}
                pagination={{
                  enabled: true,
                  pageSize: ITEMS_PER_PAGE,
                  currentPage: currentPage,
                  totalCount: totalCount,
                  onPageChange: setCurrentPage,
                }}
                emptyMessage="No sessions found"
                emptyIcon={Calendar}
                emptyAction={{
                  label: "Schedule Session",
                  onClick: () => setIsAddSessionOpen(true),
                  icon: Plus,
                }}
                addAction={{
                  label: "Schedule Session",
                  onClick: () => setIsAddSessionOpen(true),
                  icon: Plus,
                  show: true,
                }}
                loading={loading}
                onRefresh={loadSessions}
                striped={true}
                hoverable={true}
                bordered={true}
                theme="primary"
                cardProps={{
                  showCard: true,
                  className: "shadow-sm",
                }}
              />
            )}

            {/* Add Mentor Dialog */}
            <Dialog open={isAddMentorOpen} onOpenChange={setIsAddMentorOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Mentor</DialogTitle>
                  <DialogDescription>
                    Add a new mentor to the platform. Fill in all the required information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user_id" className="mb-2 block">
                      User ID *
                    </Label>
                    <Input
                      id="user_id"
                      value={newMentor.user_id}
                      onChange={(e) => setNewMentor({ ...newMentor, user_id: e.target.value })}
                      placeholder="Enter user ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain" className="mb-2 block">
                      Domain *
                    </Label>
                    <Input
                      id="domain"
                      value={newMentor.domain}
                      onChange={(e) => setNewMentor({ ...newMentor, domain: e.target.value })}
                      placeholder="e.g., Software Engineering, Data Science"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience_years" className="mb-2 block">
                      Experience (Years) *
                    </Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={newMentor.experience_years}
                      onChange={(e) =>
                        setNewMentor({ ...newMentor, experience_years: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="Enter years of experience"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="mb-2 block">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={newMentor.bio}
                      onChange={(e) => setNewMentor({ ...newMentor, bio: e.target.value })}
                      placeholder="Enter mentor bio"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddMentorOpen(false)} disabled={isCreating}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMentor} disabled={isCreating || !newMentor.user_id || !newMentor.domain}>
                      {isCreating ? "Adding..." : "Add Mentor"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Session Dialog */}
            <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Session</DialogTitle>
                  <DialogDescription>
                    Schedule a new mentorship session. Fill in all the required information below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mentor_id" className="mb-2 block">
                      Mentor ID *
                    </Label>
                    <Input
                      id="mentor_id"
                      value={newSession.mentor_id}
                      onChange={(e) => setNewSession({ ...newSession, mentor_id: e.target.value })}
                      placeholder="Enter mentor ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_id" className="mb-2 block">
                      User ID *
                    </Label>
                    <Input
                      id="user_id"
                      value={newSession.user_id}
                      onChange={(e) => setNewSession({ ...newSession, user_id: e.target.value })}
                      placeholder="Enter user ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="session_type" className="mb-2 block">
                      Session Type *
                    </Label>
                    <Select
                      value={newSession.session_type}
                      onValueChange={(value) => setNewSession({ ...newSession, session_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAREER_GUIDANCE">Career Guidance</SelectItem>
                        <SelectItem value="RESUME_REVIEW">Resume Review</SelectItem>
                        <SelectItem value="INTERVIEW_PREP">Interview Preparation</SelectItem>
                        <SelectItem value="SKILL_DEVELOPMENT">Skill Development</SelectItem>
                        <SelectItem value="GENERAL">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduled_at" className="mb-2 block">
                      Scheduled Date & Time *
                    </Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={newSession.scheduled_at}
                      onChange={(e) => setNewSession({ ...newSession, scheduled_at: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddSessionOpen(false)} disabled={isCreating}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSession}
                      disabled={isCreating || !newSession.mentor_id || !newSession.user_id || !newSession.session_type}
                    >
                      {isCreating ? "Scheduling..." : "Schedule Session"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}

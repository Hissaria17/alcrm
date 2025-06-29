import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Eye, TrendingUp } from "lucide-react";
import { JobPosting } from "@/types/job";

interface DashboardStatsProps {
  jobPostings: JobPosting[];
}

export function DashboardStats({ jobPostings }: DashboardStatsProps) {
  const totalJobs = jobPostings.length;
  const activeJobs = jobPostings.filter(job => job.status === "OPEN").length;
  const fullTimeJobs = jobPostings.filter(job => job.type === "FULL-TIME").length;
  const closedJobs = jobPostings.filter(job => job.status === "CLOSED").length;

  const stats = [
    {
      title: "Total Job Postings",
      value: totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Jobs",
      value: activeJobs,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Full-Time Jobs",
      value: fullTimeJobs,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Closed Jobs",
      value: closedJobs,
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">
                {stat.title === "Active Jobs" && "Open"}
                {stat.title === "Full-Time Jobs" && "Full-Time"}
                {stat.title === "Closed Jobs" && "Completed"}
                {stat.title === "Total Job Postings" && "All Time"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 
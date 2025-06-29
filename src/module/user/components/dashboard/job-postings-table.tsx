"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  Calendar } from "lucide-react";
import { JobPosting } from "@/app/(user)/dashboard/page";

interface JobPostingsTableProps {
  jobPostings: JobPosting[];
}

export function JobPostingsTable({ jobPostings, }: JobPostingsTableProps) {

  const getStatusBadge = (status: JobPosting["status"]) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Open</Badge>;
      case "CLOSED":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: JobPosting["type"]) => {
    const colors = {
      "FULL-TIME": "bg-blue-100 text-blue-800",
      "PART-TIME": "bg-purple-100 text-purple-800",
      "CONTRACT": "bg-orange-100 text-orange-800",
      "INTERNSHIP": "bg-green-100 text-green-800",
    };
    
    const labels = {
      "FULL-TIME": "Full-Time",
      "PART-TIME": "Part-Time",
      "CONTRACT": "Contract",
      "INTERNSHIP": "Internship",
    };
    
    return (
      <Badge className={`${colors[type]} hover:${colors[type]}`}>
        {labels[type]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Job Postings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobPostings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No job postings found. Create your first job posting to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobPostings.map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {job.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{getTypeBadge(job.type)}</TableCell>
                      <TableCell className="font-medium">{job.salary}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{formatDate(job.postedDate)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
    </>
  );
} 
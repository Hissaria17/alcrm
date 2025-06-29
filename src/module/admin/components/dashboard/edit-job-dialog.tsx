"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobPosting } from "@/types/job";

interface EditJobDialogProps {
  job: JobPosting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (job: JobPosting) => void;
}

export function EditJobDialog({ job, open, onOpenChange, onSave }: EditJobDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "" as JobPosting["type"],
    salary: "",
    status: "OPEN" as JobPosting["status"],
    description: "",
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company || '',
        location: job.location,
        type: job.type,
        salary: job.salary || '',
        status: job.status,
        description: job.description,
      });
    }
  }, [job]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.location || !formData.type) {
      return;
    }

    const updatedJob: JobPosting = {
      ...job,
      ...formData,
    };

    onSave(updatedJob);
  };

  const handleCancel = () => {
    // Reset form to original job data
    setFormData({
      title: job.title,
      company: job.company || '',
      location: job.location,
      type: job.type,
      salary: job.salary || '',
      status: job.status,
      description: job.description,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
          <DialogDescription>
            Update the job posting information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company *</Label>
                <Input
                  id="edit-company"
                  name="company"
                  placeholder="e.g. TechCorp Inc."
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  name="location"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Job Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL-TIME">Full-Time</SelectItem>
                    <SelectItem value="PART-TIME">Part-Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salary Range</Label>
                <Input
                  id="edit-salary"
                  name="salary"
                  placeholder="e.g. $80,000 - $120,000"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Job Description *</Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
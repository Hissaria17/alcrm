"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Copy, 
  Twitter, 
  Linkedin, 
  Facebook, 
  MessageCircle,
  ExternalLink,
  Check,
  Building,
  MapPin,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { JobPosting } from "@/types/job";

interface SocialShareDialogProps {
  job: JobPosting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocialShareDialog({ job, open, onOpenChange }: SocialShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  // Generate the application URL
  const applicationUrl = job ? `${window.location.origin}/jobs/${job.id}` : '';
  
  // Generate default message
  const generateDefaultMessage = () => {
    if (!job) return '';
    const jobType = job.type.replace('-', ' ').toLowerCase();
    return `🚀 New ${jobType} opportunity!\n\n📋 ${job.title}\n📍 ${job.location}\n\nApply now and take the next step in your career! 👇\n\n${applicationUrl}`;
  };

  const defaultMessage = generateDefaultMessage();
  const messageToShare = customMessage || defaultMessage;

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(messageToShare);
      setCopied(true);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Share on Twitter
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messageToShare)}`;
    window.open(twitterUrl, '_blank');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    if (!job) return;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(applicationUrl)}&title=${encodeURIComponent(job.title)}&summary=${encodeURIComponent(job.description.substring(0, 200))}`;
    window.open(linkedinUrl, '_blank');
  };

  // Share on Facebook
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(applicationUrl)}&quote=${encodeURIComponent(messageToShare)}`;
    window.open(facebookUrl, '_blank');
  };

  // Share via WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageToShare)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Share via Telegram
  const shareOnTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(applicationUrl)}&text=${encodeURIComponent(messageToShare)}`;
    window.open(telegramUrl, '_blank');
  };

  const getJobTypeBadge = (type: string) => {
    const typeConfig = {
      "FULL-TIME": { label: "Full-Time", className: "bg-blue-100 text-blue-800" },
      "PART-TIME": { label: "Part-Time", className: "bg-purple-100 text-purple-800" },
      "CONTRACT": { label: "Contract", className: "bg-orange-100 text-orange-800" },
      "INTERNSHIP": { label: "Internship", className: "bg-green-100 text-green-800" },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, className: "" };
    
    return (
      <Badge className={`${config.className} hover:${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="h-5 w-5 text-blue-600" />
            </div>
            Share Job Posting
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Share this job opportunity with your network to help qualified candidates discover it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 flex-1 overflow-y-auto">
          {job ? (
            <>
              {/* Job Preview Card */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {job.postedDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getJobTypeBadge(job.type)}
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Message Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message" className="text-sm font-semibold text-gray-900 mb-2 block">
                        Customize your message
                      </Label>
                      <Textarea
                        id="message"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder={defaultMessage}
                        rows={6}
                        className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700 mb-1">Application URL</p>
                        <p className="text-sm text-gray-600 truncate">{applicationUrl}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(applicationUrl);
                          toast.success("URL copied!");
                        }}
                        className="ml-3 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share Actions */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900">Share on social platforms</h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="justify-start h-12 border-gray-200 hover:bg-gray-50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-5 w-5 mr-3 text-green-600" />
                            <span className="font-medium">Copied to clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-5 w-5 mr-3 text-gray-600" />
                            <span className="font-medium">Copy message to clipboard</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={shareOnTwitter}
                        variant="outline"
                        className="justify-start h-12 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Twitter className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="font-medium">Twitter</span>
                      </Button>
                      
                      <Button
                        onClick={shareOnLinkedIn}
                        variant="outline"
                        className="justify-start h-12 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Linkedin className="h-5 w-5 mr-3 text-blue-700" />
                        <span className="font-medium">LinkedIn</span>
                      </Button>
                      
                      <Button
                        onClick={shareOnFacebook}
                        variant="outline"
                        className="justify-start h-12 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Facebook className="h-5 w-5 mr-3 text-blue-600" />
                        <span className="font-medium">Facebook</span>
                      </Button>
                      
                      <Button
                        onClick={shareOnWhatsApp}
                        variant="outline"
                        className="justify-start h-12 border-gray-200 hover:bg-green-50 hover:border-green-200"
                      >
                        <MessageCircle className="h-5 w-5 mr-3 text-green-600" />
                        <span className="font-medium">WhatsApp</span>
                      </Button>
                    </div>

                    <Button
                      onClick={shareOnTelegram}
                      variant="outline"
                      className="w-full justify-start h-12 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <ExternalLink className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="font-medium">Telegram</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900">Message Preview</Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {messageToShare}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job selected</h3>
                  <p className="text-gray-600">Please select a job to share</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
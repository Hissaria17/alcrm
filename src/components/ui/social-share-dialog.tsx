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
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Share2, 
  Copy, 
  Twitter, 
  Linkedin, 
  Facebook, 
  MessageCircle,
  ExternalLink,
  Check,
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
  const [customMessage] = useState("");

  // Generate the application URL
  const applicationUrl = job ? `${window.location.origin}/jobs/${job.id}` : '';
  
  // Generate default message
  const generateDefaultMessage = () => {
    if (!job) return '';
    const jobType = job.type.replace('-', ' ').toLowerCase();
    return `New ${jobType} opportunity!\n\n📋 ${job.title}\n ${job.location}\n\nApply now and take the next step in your career! \n\n${applicationUrl}`;
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
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(messageToShare)}`;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Share2 className="h-4 w-4 text-blue-600" />
            </div>
            Share Job Posting
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Share this job opportunity with your network to help qualified candidates discover it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-y-auto">
          {job ? (
            <>
              {/* Share Actions & Preview Combined */}
              <Card className="border border-gray-200 shadow-lg">
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Share2 className="h-3 w-3 text-white" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Share on social platforms</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="justify-start h-12 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="font-semibold text-green-700">Copied to clipboard!</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <Copy className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="font-semibold text-gray-700">Copy message to clipboard</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={shareOnTwitter}
                        variant="outline"
                        className="justify-start h-12 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                          <Twitter className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="font-semibold text-gray-700">Twitter</span>
                      </Button>
                      
                      <Button
                        onClick={shareOnLinkedIn}
                        variant="outline"
                        className="justify-start h-12 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                          <Linkedin className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="font-semibold text-gray-700">LinkedIn</span>
                      </Button>
                      
                      <Button
                        onClick={shareOnFacebook}
                        variant="outline"
                        className="justify-start h-12 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                          <Facebook className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Facebook</span>
                      </Button>
                      
                      <Button
                        onClick={shareOnWhatsApp}
                        variant="outline"
                        className="justify-start h-12 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-green-300 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-700">WhatsApp</span>
                      </Button>
                    </div>

                    <Button
                      onClick={shareOnTelegram}
                      variant="outline"
                      className="w-full justify-start h-12 border-2 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-700">Telegram</span>
                    </Button>

                    {/* Separator */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Preview Section */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900">Message Preview</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {messageToShare}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">No job selected</h3>
                  <p className="text-gray-600 text-sm">Please select a job to share</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
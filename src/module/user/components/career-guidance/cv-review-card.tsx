import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
import Link from "next/link";

export function CVReviewCard() {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-[#1A237E] h-full">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-[#1A237E] mb-2">
          CV Review & Enhancement
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          Get expert feedback and professional enhancement of your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#1A237E] rounded-full"></div>
            <span>Industry expert analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#1A237E] rounded-full"></div>
            <span>ATS optimization</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#1A237E] rounded-full"></div>
            <span>Enhanced version provided</span>
          </div>
        </div>
        
        <Button className="w-full bg-[#1A237E] hover:bg-[#0D47A1] text-white font-semibold" asChild>
          <Link href="/dashboard/career-guidance/cv-review">
            <Upload className="w-4 h-4 mr-2" />
            Get CV Review
          </Link>
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">Max 2 requests • ₹2,999</p>
        </div>
      </CardContent>
    </Card>
  );
} 
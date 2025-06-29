import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Target } from "lucide-react";
import Link from "next/link";



export function InterviewPreparationCard() {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-[#B8860B] h-full">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#B8860B] to-[#DAA520] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <Target className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-[#B8860B] mb-2">
          Interview Preparation
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          Domain-specific interview prep with mock sessions and expert guidance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#B8860B] rounded-full"></div>
            <span>Mock interview sessions</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#B8860B] rounded-full"></div>
            <span>Domain-specific coaching</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#B8860B] rounded-full"></div>
            <span>Behavioral prep training</span>
          </div>
        </div>
        
        <Button className="w-full bg-[#B8860B] hover:bg-[#A67C00] text-white font-semibold" asChild>
          <Link href="/dashboard/career-guidance/interview-prep">
            <Play className="w-4 h-4 mr-2" />
            Start Preparation
          </Link>
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">Max 3 sessions • From ₹1,999</p>
        </div>
      </CardContent>
    </Card>
  );
} 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {  Calendar,Users } from "lucide-react";
import { useState, useEffect } from "react";
import { careerMentorAPI, type CareerMentor } from "@/lib/api/career-guidance";
import { toast } from "sonner";
import Link from "next/link";

export function MentorshipCard() {
  const [, setMentors] = useState<CareerMentor[]>([]);
  const [, setIsLoading] = useState(false);


  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setIsLoading(true);
      const data = await careerMentorAPI.getMentors();
      setMentors(data);
    } catch (error) {
      console.error('Error loading mentors:', error);
      toast.error('Failed to load mentors');
    } finally {
      setIsLoading(false);
    }
  };

 
 
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-[#388E3C] h-full">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#388E3C] to-[#4CAF50] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <Users className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-[#388E3C] mb-2">
          Expert Mentorship
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          One-on-one guidance from industry experts and career professionals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#388E3C] rounded-full"></div>
            <span>Personalized career guidance</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#388E3C] rounded-full"></div>
            <span>Industry expert mentors</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#388E3C] rounded-full"></div>
            <span>Flexible scheduling</span>
          </div>
        </div>
        
        <Button className="w-full bg-[#388E3C] hover:bg-[#2E7D32] text-white font-semibold" asChild>
          <Link href="/dashboard/career-guidance/mentorship">
            <Calendar className="w-4 h-4 mr-2" />
            Book Mentorship
          </Link>
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">Flexible sessions • From ₹1,500</p>
        </div>
      </CardContent>
    </Card>
  );
} 
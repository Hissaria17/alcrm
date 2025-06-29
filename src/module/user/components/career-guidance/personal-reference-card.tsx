import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Handshake } from "lucide-react";


export function PersonalReferenceCard() {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-[#1A237E] h-full">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <Handshake className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-[#1A237E] mb-2">
          Personal Job References
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          Get direct referrals to top organizations through our professional network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#1A237E] rounded-full"></div>
            <span>Direct hiring manager connections</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#1A237E] rounded-full"></div>
            <span>85% interview success rate</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-[#1A237E] rounded-full"></div>
            <span>Priority application processing</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-[#1A237E] hover:bg-[#0D47A1] text-white font-semibold"
          asChild
        >
          <Link href="/dashboard/career-guidance/personal-references">
            <Handshake className="w-4 h-4 mr-2" />
            Request Reference
          </Link>
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">Max 3 requests • ₹4,999</p>
        </div>
      </CardContent>
    </Card>
  );
} 
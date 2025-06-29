import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {Wand2, Download } from "lucide-react";

export function CVPreparationCard() {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#388E3C] bg-gradient-to-br from-white to-green-50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#388E3C] to-[#4CAF50] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#388E3C] mb-2">
          AI-Powered CV Creation
        </CardTitle>
        <CardDescription className="text-gray-600 text-base">
          Generate tailored CVs based on specific job descriptions and requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#B8860B] rounded-full"></div>
            <span>AI analyzes job requirements</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#B8860B] rounded-full"></div>
            <span>Tailors content to match job description</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#B8860B] rounded-full"></div>
            <span>Highlights relevant skills and experience</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-700">
            <div className="w-2 h-2 bg-[#B8860B] rounded-full"></div>
            <span>Professional formatting and layout</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Job Description</label>
          <Textarea 
            placeholder="Paste the job description here to generate a tailored CV..."
            className="min-h-[100px] border-gray-300 focus:border-[#388E3C] focus:ring-[#388E3C]"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button className="flex-1 bg-[#388E3C] hover:bg-[#2E7D32] text-white font-semibold py-3">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate CV
          </Button>
          <Button variant="outline" className="border-[#388E3C] text-[#388E3C] hover:bg-[#388E3C] hover:text-white">
            <Download className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Starting from ₹1499</p>
        </div>
      </CardContent>
    </Card>
  );
} 
"use client"
import { 
  CVReviewCard, 
  // CVPreparationCard, 
  // MentorshipCard, 
  InterviewPreparationCard, 
  PersonalReferenceCard 
} from "@/module/user/components/career-guidance";
import { GraduationCap, Star, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from 'react';
import { CareerGuidanceSkeleton } from '@/components/skeletons/user/career-guidance-skeleton';

export default function CareerGuidancePage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <CareerGuidanceSkeleton />;

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1A237E] via-[#3949AB] to-[#5C6BC0] text-white py-16 px-6 rounded-lg mb-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Career Guidance & Mentorship
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Accelerate your career with expert guidance, personalized mentorship, and industry-specific preparation
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-blue-100 text-sm">Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">95%</div>
              <div className="text-blue-100 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">30+</div>
              <div className="text-blue-100 text-sm">Domains</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-blue-100 text-sm">Students Helped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <CVReviewCard />
          <InterviewPreparationCard />
          <PersonalReferenceCard />
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A237E] mb-4">
              Why Choose Our Career Guidance?
            </h2>
            <p className="text-gray-600 text-lg">
              Comprehensive support at every step of your career journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A237E] mb-3">
                Expert Mentors
              </h3>
              <p className="text-gray-600">
                Learn from industry veterans with 10+ years of experience in Big 4, corporates, and startups
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#B8860B] to-[#DAA520] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A237E] mb-3">
                Proven Results
              </h3>
              <p className="text-gray-600">
                95% success rate with students landing their dream jobs within 6 months
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#388E3C] to-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A237E] mb-3">
                Personalized Approach
              </h3>
              <p className="text-gray-600">
                Tailored guidance based on your background, goals, and target organizations
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#1A237E] to-[#3949AB] rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their careers with our guidance
          </p>
          <button className="bg-white text-[#1A237E] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </>
  );
}
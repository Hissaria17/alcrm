'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-sky-500 via-indigo-400 to-indigo-600 animate-gradient-x relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center shadow-2xl rounded-3xl bg-white/30 backdrop-blur-md ring-1 ring-white/20">
        <div className="space-y-8 py-12">
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm mb-2 shadow">
            🚀 New for 2024
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow text-white">
            Ready to accelerate your career?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs and advanced their careers with <span className="font-bold text-indigo-600">ALCRM</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signin">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold shadow-md rounded-xl group transition">
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold rounded-xl transition"
            >
              Browse Jobs
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 pt-8">
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="w-5 h-5 text-yellow-300" />
              <span>Free to get started</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="w-5 h-5 text-yellow-300" />
              <span>Expert career guidance</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-100">
              <CheckCircle className="w-5 h-5 text-yellow-300" />
              <span>Thousands of opportunities</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-yellow-200/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-200/30 rounded-full blur-3xl"></div>
    </section>
  );
}
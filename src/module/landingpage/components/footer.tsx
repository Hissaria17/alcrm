'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';


export default function Footer() {

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center">
              <Image 
                src="/images/logo_.png" 
                alt="ALCRM Logo" 
                width={120} 
                height={120} 
                className='rounded-md'
              />
            </div>
            <p className="text-gray-400 max-w-md">
              Empowering professionals to find their dream careers through job opportunities, mentorship, and comprehensive career resources.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Job Seekers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Seekers</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Resume Review</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Interview Prep</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Career Coaching</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Skill Assessment</a></li>
            </ul>
          </div>

          {/* Companies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Companies</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Post Jobs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Find Talent</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Employer Branding</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li>
                <Link 
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 ALCRM. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link 
              href="/privacy"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
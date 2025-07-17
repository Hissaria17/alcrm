'use client';

import Link from 'next/link';
import Image from 'next/image';
import {  Linkedin, Mail } from 'lucide-react';


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
          
                              <a href="https://www.linkedin.com/in/sachin-hissaria/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
         
                              <a href="mailto:CISAwithSachin@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
            </div>
          </div>

          {/* Job Seekers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Resume Review</Link></li>
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Interview Prep</Link></li>
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Career Coaching</Link></li>
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Skill Assessment</Link></li>
            </ul>
          </div>

          {/* Companies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Companies</h3>
            <ul className="space-y-2">
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Post Jobs</Link></li>
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Find Talent</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li>
                <Link 
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
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
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ALCRM</span>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-8">
            <a href="#jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Find Jobs
            </a>
            <a href="#companies" className="text-gray-600 hover:text-gray-900 transition-colors">
              Companies
            </a>
            <a href="#mentorship" className="text-gray-600 hover:text-gray-900 transition-colors">
              Mentorship
            </a>
            <a href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors">
              Resources
            </a>
            <a href="#resume" className="text-gray-600 hover:text-gray-900 transition-colors">
              Resume Review
            </a>
          </div> */}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900"
            onClick={() => router.push('/signin')}
            >
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => router.push('/signup')}
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <div className="flex flex-col space-y-4">
              {/* <a href="#jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
                Find Jobs
              </a>
              <a href="#companies" className="text-gray-600 hover:text-gray-900 transition-colors">
                Companies
              </a>
              <a href="#mentorship" className="text-gray-600 hover:text-gray-900 transition-colors">
                Mentorship
              </a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors">
                Resources
              </a>
              <a href="#resume" className="text-gray-600 hover:text-gray-900 transition-colors">
                Resume Review
              </a> */}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200/50">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 justify-start"
                onClick={() => router.push('/signin')}
                >
                  Sign In
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start"
                onClick={() => router.push('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
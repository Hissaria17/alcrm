'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';


export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <Image 
                src="/images/logo_.png" 
                alt="ALCRM Logo" 
                width={120} 
                height={120} 
                className='rounded-md'
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
    
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200/50">
                <Link href="/signin">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900 justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white justify-start">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
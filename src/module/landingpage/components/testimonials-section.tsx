'use client';

import { Star, UserRound } from 'lucide-react';

const testimonials = [
  {
    name: 'CA Ritika Singh',
    role: 'Independent Tax Consultant',
    company: '',
    gender: 'female',
    content: 'ALCRM helped me clear my CA Final on the first attempt and kickstart my consulting career. The mentorship and mock interviews were spot on.',
    rating: 5
  },
  {
    name: 'CA Dharmendra Shivhare',
    role: 'Finance Manager',
    company: 'MNC (Big 4)',
    gender: 'male',
    content: 'The case study preparation and expert sessions at ALCRM helped me land a job at a Big 4 right after qualifying. Their structured approach really works.',
    rating: 4
  },
  {
    name: 'Megha Garg',
    role: 'Audit Associate',
    company: 'Mid-size CA Firm',
    gender: 'female',
    content: 'I was confused after my articleship, but ALCRM\'s career guidance helped me pick the right role and build confidence during interviews.',
    rating: 4
  }
];


export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Success stories from
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}our community
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how ALCRM has helped thousands of professionals land their dream jobs and advance their careers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors duration-300 border border-gray-200/50"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
              &quot;{testimonial.content}&quot;
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <UserRound className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
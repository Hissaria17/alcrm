'use client';

import { Briefcase, Users, BookOpen, FileText, MessageCircle, Award } from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Job Discovery',
    description: 'Browse thousands of job opportunities from top companies across various industries and experience levels.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileText,
    title: 'Resume Review',
    description: 'Get your resume professionally reviewed by industry experts to maximize your chances of landing interviews.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Users,
    title: 'Mentorship Sessions',
    description: 'Connect with experienced professionals for one-on-one mentorship to accelerate your career growth.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BookOpen,
    title: 'Interview Resources',
    description: 'Access comprehensive interview preparation materials, practice questions, and expert tips.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: MessageCircle,
    title: 'Career Guidance',
    description: 'Receive personalized career advice and guidance from industry professionals and career coaches.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Award,
    title: 'Skill Assessment',
    description: 'Take skill assessments to showcase your abilities and get matched with relevant job opportunities.',
    color: 'from-red-500 to-pink-500'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}advance your career
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and resources you need to find your dream job, improve your skills, and accelerate your professional growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-gray-300/50 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
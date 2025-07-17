import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Users, TrendingUp, Globe, Building2 } from "lucide-react";
import Navigation from "@/module/landingpage/components/navigation";
import Footer from "@/module/landingpage/components/footer";
import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">
              Meet The Founder
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Driven by Excellence,
              <span className="text-blue-600"> Powered by Experience</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading India&apos;s premier consultancy and placement platform with a mission to bring 
              audit excellence to every pin code across the nation.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-1 lg:order-1">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 transform rotate-3 absolute inset-0"></div>
              <div className="bg-white rounded-3xl p-8 relative shadow-2xl">
                    <Image
                    width={1000}
                    height={1000}
                    src="/images/founderprof.png"
                    alt="CA Chaturved Mehta" 
                    className="w-full h-96 object-cover rounded-2xl mb-6"
                  />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">CA Chaturved Mehta</h3>
                  <p className="text-blue-600 font-semibold mb-4">Founder & Lead Consultant</p>
                  <Link 
                    href="https://www.linkedin.com/in/cachaturvedmehtause" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>Connect on LinkedIn</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="space-y-8 order-2 lg:order-2">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">The Visionary Behind ALCRM</h2>
                <p className="text-lg text-gray-600 mb-6">
                  CA Chaturved Mehta qualified at the remarkable age of 21, establishing himself as the 
                  Founder of ALCRM Consultancy and Placements. With an impressive 10 years of experience, 
                  he&apos;s driven by an unwavering mission to bring audit excellence to every corner of India.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  His deep passion spans across Internal Audit, Risk Management, Cost Optimization, 
                  SOP Formulation, and Process Controls, making him a comprehensive authority in the field.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2,500+</div>
                  <div className="text-sm text-gray-600">Bank Branch Audits</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">900+</div>
                  <div className="text-sm text-gray-600">Insurance Audits</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">700+</div>
                  <div className="text-sm text-gray-600">NBFC Audits</div>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">25K+</div>
                  <div className="text-sm text-gray-600">Stock Take Activities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Expert Team</h2>
            <p className="text-xl text-gray-600">
              Comprised of highly experienced professionals across multiple disciplines
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="flex flex-col items-center p-8">
                <Image
                  src="/images/monika.png"
                  alt="Monika Shanbhag"
                  width={220}
                  height={220}
                  className="rounded-2xl object-cover mb-6 w-56 h-56 border-4 border-orange-200 shadow-lg"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Monika Shanbhag</h3>
                <p className="text-orange-600 font-semibold mb-2">Co-founder</p>
                <p className="text-gray-700 text-center mb-4">
                  Monika serves as the Operations Head of our organization, overseeing the end-to-end execution of our career guidance and job placement services. With a strong focus on operational efficiency, she ensures that every CV we receive is matched with the right opportunities across companies, industries, and CA firms. Beyond placements, she also manages the delivery of our mentorship programs, interview preparation sessions, and CV refinement services, making sure each participant receives comprehensive support throughout their job-seeking journey.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="flex flex-col items-center p-8">
                <Image
                  src="/images/sachin.png"
                  alt="Sachin Hissaria"
                  width={220}
                  height={220}
                  className="rounded-2xl object-cover mb-6 w-56 h-56 border-4 border-orange-200 shadow-lg"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Sachin Hissaria</h3>
                <p className="text-orange-600 font-semibold mb-2">Mentor</p>
                <p className="text-gray-700 text-center mb-4">
                  With over a decade of experience in Information Technology and Information Security, Sachin brings deep expertise across system audits, data center assessments, data privacy evaluations, BCP/DR audits, IT policy development, and risk-based internal audits. Over the years, he has successfully led and completed more than 500 audit projects for over 60 multinational corporations and small businesses, delivering actionable insights and strengthening their IT governance frameworks.
                </p>
                <p className="text-gray-700 text-center mb-4">
                  He has mentored and trained thousands of aspiring professionals pursuing certifications like CISA, IT and GRC Audit and ISO 27001 Lead Auditor. Known for delivering impactful webinars, corporate seminars, and hands-on training sessions, he specializes in bridging the gap between theoretical knowledge and real-world IT audit practices.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Multidisciplinary Excellence</h3>
                <p className="text-lg mb-6">
                  Our team includes CA, CS, MBA, HR, and IT professionals with specialized 
                  certifications including CISA, DISA, and CEH, bringing comprehensive 
                  expertise to every engagement.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">CA Professionals</Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">CS Experts</Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">MBA Consultants</Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">HR Specialists</Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30">IT Security</Badge>
                </div>
              </div>
              <div className="text-center">
                <Building2 className="h-32 w-32 text-white/80 mx-auto mb-4" />
                <div className="text-4xl font-bold">Excellence</div>
                <div className="text-xl">in Every Service</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Building a National Network</h2>
            <p className="text-xl text-gray-600">
              Since 2015, transforming careers and connecting professionals across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-2">
              <CardHeader>
                <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Professional Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">29K+</div>
                    <div className="text-gray-600">LinkedIn Connections</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">20K+</div>
                    <div className="text-gray-600">WhatsApp Connects</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">60K+</div>
                    <div className="text-gray-600">Finance Professionals</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-2">
              <CardHeader>
                <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Career Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">5,000+</div>
                    <div className="text-gray-600">Professional CVs Referred</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">1,200+</div>
                    <div className="text-gray-600">CA Articles Referred</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-2">
              <CardHeader>
                <Globe className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">National Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">4,500+</div>
                    <div className="text-gray-600">Active Associates</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">1,500+</div>
                    <div className="text-gray-600">Locations Covered</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About; 
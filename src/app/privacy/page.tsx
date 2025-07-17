import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Users, Globe, FileText, Scale, Linkedin } from "lucide-react";
import Navigation from '@/module/landingpage/components/navigation';
import Footer from '@/module/landingpage/components/footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 mt-6">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how ALCRM collects, uses, and protects your personal information
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="prose prose-gray max-w-none">
              <div className="flex items-center space-x-3 mb-8">
                <FileText className="h-6 w-6 text-purple-600" />
                <p className="text-sm text-gray-600 font-medium">
                  <strong>Effective Date:</strong> January 1, 2024
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  We, at ALCRM, are committed to respecting your online privacy and recognise the need for appropriate protection and management of any personally identifiable information you share with us. This Privacy Policy describes how ALCRM collects, uses, discloses and transfers personal information of users through our platform and services.
                </p>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
                  </div>
                  <div className="ml-11">
                    <p className="text-gray-700 leading-relaxed">
                      This Privacy Policy applies to those who visit the Platform, or whose information ALCRM otherwise receives in connection with its services. For this Privacy Policy, &quot;You&quot; or &quot;Your&quot; shall mean the person who is accessing the Platform.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Types of Personal Information Collected</h2>
                  </div>
                  <div className="ml-11 space-y-4">
                    <p className="text-gray-700 font-medium">
                      We collect the following categories of Personal Information:
                    </p>
                    <div className="grid gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Users className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Account Information</h4>
                              <p className="text-gray-700 text-sm">Name, email address, password, country, city, contact number and company/organisation details when you sign up</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <FileText className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Resume Information</h4>
                              <p className="text-gray-700 text-sm">Work experience, educational qualifications, salary data, and resume copies when you register</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Globe className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                              <p className="text-gray-700 text-sm">Information about services you use, log information, and location data</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                  </div>
                  <div className="ml-11 space-y-4">
                    <p className="text-gray-700">
                      We will only use your data fairly and reasonably, and where we have a lawful reason to do so. We may process your Personal Information for the following purposes:
                    </p>
                    <div className="grid gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                        <p className="text-gray-700">Providing our services including job alerts, search results, and recommendations</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                        <p className="text-gray-700">Protecting our users and providing customer support</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                        <p className="text-gray-700">Improving platform experience and service quality</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                        <p className="text-gray-700">Conducting market research and surveys</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
                  </div>
                  <div className="ml-11">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Eye className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">Cookie Usage</h4>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Some of our web pages utilize &quot;cookies&quot; and other tracking technologies to collect information about website activity and improve your user experience. You can control cookies through your browser settings.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
                  </div>
                  <div className="ml-11 space-y-4">
                    <p className="text-gray-700">
                      We restrict access to your Personal Information to employees who reasonably need that information. ALCRM does not disclose your Personal Information except with:
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Potential recruiters when your resume matches job descriptions</li>
                        <li>• Third parties when required by law or legal process</li>
                        <li>• Service providers who assist in platform operations</li>
                        <li>• Third-party advertisers (without personal identification)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">6</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                  </div>
                  <div className="ml-11">
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Lock className="h-6 w-6 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">Security Measures</h4>
                        </div>
                        <p className="text-gray-700">
                          The security and confidentiality of your Personal Information are important to us. ALCRM has invested significant resources to protect your data and ensure compliance with applicable data protection laws.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">13</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="ml-11">
                    <p className="text-gray-700 mb-4">
                      If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">ALCRM - Professional Career Enhancement Platform</p>
                            <div  className="flex items-center space-x-2 mt-2">
                            <p className="text-gray-600">Connect with our founder on LinkedIn:</p>
                            <Link 
                              href="https://www.linkedin.com/in/cachaturvedmehtause"    
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              <Linkedin className="h-5 w-5" />
                              </Link>
                            </div>

                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </div>

              <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                      <FileText className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link href="/terms">
                    <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                      <Scale className="h-4 w-4 mr-2" />
                      View Terms & Conditions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
} 
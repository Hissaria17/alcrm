import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Shield, Scale, FileText, Users, Lock, Globe, Linkedin } from "lucide-react";
import Navigation from '@/module/landingpage/components/navigation';
import Footer from '@/module/landingpage/components/footer';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 mt-6">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Please read these terms carefully as they govern your use of ALCRM platform and services
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="prose prose-gray max-w-none">

              {/* <div className="flex items-center space-x-3 mb-8">
               <FileText className="h-6 w-6 text-blue-600" />
                  <p className="text-sm text-gray-600 font-medium">
                  <strong>Effective Date:</strong> July 10, 2025
                </p> 
              </div> */}

              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to ALCRM. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our website (the &quot;Site&quot;) and services provided by ALCRM (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using this Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.
                </p>
              </div>

              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Use of the Website</h2>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">The content on this Site is for general information and use only. It is subject to change without notice.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">You agree not to use the Site for any unlawful purpose or any purpose prohibited under these Terms.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">You must not engage in any activity that disrupts or interferes with the Site&apos;s operation or security.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">All content on this Site, including text, graphics, logos, images, and software, is the property of ALCRM or its licensors and is protected by copyright and other intellectual property laws.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">You may not reproduce, distribute, or transmit any content from the Site without our prior written permission.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">You agree to provide accurate and complete information and to update it as necessary.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Services Offered</h2>
                  </div>
                  <div className="ml-11 space-y-4">
                    <p className="text-gray-700 font-medium">
                      ALCRM provides professional services to assist candidates in securing employment. These services include but are not limited to:
                    </p>
                    <div className="grid gap-3">
                      <div className="flex items-start space-x-3">
                        <Users className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">CV and resume rewriting to align with industry best practices and targeted job roles</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">Personalized interview preparation sessions, including mock interviews and feedback</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Globe className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">Guidance and support throughout the job application and recruitment process</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-amber-800 font-medium">⚠️ ALCRM does not guarantee employment or specific job placement outcomes.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Terms</h2>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">Payment is required in advance for all services unless otherwise agreed upon in writing.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">All fees are non-refundable unless specified otherwise in our refund policy.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">6</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
                  </div>
                  <div className="ml-11">
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <p className="text-gray-700">
                        ALCRM shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">7</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Termination</h2>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">We may terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that violates these Terms.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="text-gray-700">You may terminate your account at any time by contacting us.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">8</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Changes to Terms</h2>
                  </div>
                  <div className="ml-11">
                    <p className="text-gray-700">
                      We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this Site. Your continued use of the Site after any changes constitutes your acceptance of the new Terms.
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3">

                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">

                      <span className="text-white font-bold text-sm">9</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="ml-11">
                    <p className="text-gray-700 mb-4">
                      If you have any questions about these Terms and Conditions, please contact us at:
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
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                      <FileText className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link href="/privacy">
                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                      <Lock className="h-4 w-4 mr-2" />
                      View Privacy Policy
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
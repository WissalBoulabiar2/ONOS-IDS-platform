import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Award, Shield, Target } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              About <span className="text-cyan-600">PMS Investment Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Two decades of excellence in portfolio management, built on trust, expertise, and unwavering commitment to
              our clients' financial success.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-black text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 font-sans leading-relaxed">
                Founded in 2004, PMS Investment Services began with a simple yet powerful vision: to democratize
                sophisticated investment management for discerning investors. What started as a boutique firm serving a
                select group of high-net-worth individuals has evolved into one of India's most trusted portfolio
                management companies.
              </p>
              <p className="text-lg text-gray-600 mb-6 font-sans leading-relaxed">
                Our journey has been marked by consistent performance, unwavering ethical standards, and an relentless
                focus on client success. Through market cycles, economic uncertainties, and changing investment
                landscapes, we have remained steadfast in our commitment to delivering exceptional results.
              </p>
              <p className="text-lg text-gray-600 mb-8 font-sans leading-relaxed">
                Today, we manage over ₹500 crores in assets for more than 200 satisfied clients, each receiving
                personalized attention and customized investment strategies designed to meet their unique financial
                goals.
              </p>
            </div>
            <div className="relative">
              <img
                src="/images/pms-img-1.jpg"
                alt="PMS Investment Services office"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              The principles that guide every decision we make and every relationship we build.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center">
                  We operate with complete transparency, putting our clients' interests first in every decision and
                  maintaining the highest ethical standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center">
                  We strive for excellence in everything we do, from investment research to client service, continuously
                  raising the bar for performance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Client Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center">
                  Every strategy, every decision, and every action is designed with our clients' long-term financial
                  success as the primary objective.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Meet the experienced professionals who guide our investment strategies and client relationships.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-6">
                <img
                  src="/images/avatar/avatar-1.jpg"
                  alt="Rajesh Mehta"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Rajesh Mehta</h3>
                <p className="text-cyan-600 font-sans mb-4">Founder & CEO</p>
                <p className="text-gray-600 font-sans text-sm">
                  25+ years in investment management. Former VP at Goldman Sachs. CFA charterholder with expertise in
                  equity research and portfolio construction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-6">
                <img
                  src="/images/avatar/avatar-4.jpg"
                  alt="Priya Sharma"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Priya Sharma</h3>
                <p className="text-cyan-600 font-sans mb-4">Chief Investment Officer</p>
                <p className="text-gray-600 font-sans text-sm">
                  20+ years in asset management. Former fund manager at HDFC AMC. Specializes in risk management and
                  alternative investments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-6">
                <img
                  src="/images/avatar/avatar-3.jpg"
                  alt="Amit Kumar"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Amit Kumar</h3>
                <p className="text-cyan-600 font-sans mb-4">Head of Research</p>
                <p className="text-gray-600 font-sans text-sm">
                  15+ years in equity research. Former analyst at Morgan Stanley. Expert in fundamental analysis and
                  sector rotation strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Investment Approach</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              A disciplined, research-driven methodology that has delivered consistent results across market cycles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Rigorous Research Process</h3>
                    <p className="text-gray-600 font-sans">
                      Our investment decisions are backed by comprehensive fundamental analysis, technical research, and
                      macroeconomic insights.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk-Adjusted Returns</h3>
                    <p className="text-gray-600 font-sans">
                      We focus on generating superior risk-adjusted returns rather than chasing short-term performance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Active Portfolio Management</h3>
                    <p className="text-gray-600 font-sans">
                      Continuous monitoring and rebalancing to adapt to changing market conditions and opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Long-term Perspective</h3>
                    <p className="text-gray-600 font-sans">
                      We invest with a long-term horizon, focusing on sustainable wealth creation over market cycles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/images/pms-img-1.jpg"
                alt="Investment research and analysis"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Track Record</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Numbers that speak to our commitment to excellence and client success.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-serif font-black text-cyan-600 mb-2">20+</div>
              <div className="text-gray-600 font-sans">Years of Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-serif font-black text-cyan-600 mb-2">₹500Cr+</div>
              <div className="text-gray-600 font-sans">Assets Under Management</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-serif font-black text-cyan-600 mb-2">200+</div>
              <div className="text-gray-600 font-sans">Satisfied Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-serif font-black text-cyan-600 mb-2">15.2%</div>
              <div className="text-gray-600 font-sans">Average Annual Returns</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Partner with Us?</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Join our family of successful investors and experience the difference that professional portfolio management
            can make.
          </p>
          <Link href="/consultation">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
              Schedule a Consultation
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-serif font-black text-cyan-400 mb-4">PMS Investment Services</h3>
              <p className="text-gray-400 font-sans mb-4">
                Empowering your financial future with expertise, transparency, and unwavering trust.
              </p>
              <div className="text-sm text-gray-400 font-sans">
                <p>SEBI Registered Investment Advisor</p>
                <p>Registration No: INA000012345</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 font-sans">
                <li>
                  <Link href="/services/portfolio-management" className="hover:text-cyan-400 transition-colors">
                    Portfolio Management
                  </Link>
                </li>
                <li>
                  <Link href="/services/wealth-planning" className="hover:text-cyan-400 transition-colors">
                    Wealth Planning
                  </Link>
                </li>
                <li>
                  <Link href="/services/risk-assessment" className="hover:text-cyan-400 transition-colors">
                    Risk Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/services/tax-optimization" className="hover:text-cyan-400 transition-colors">
                    Tax Optimization
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 font-sans">
                <li>
                  <Link href="/about" className="hover:text-cyan-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/about#team" className="hover:text-cyan-400 transition-colors">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-cyan-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-cyan-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400 font-sans">
                <p>📧 info@pmsinvestment.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 font-sans">
              © 2024 PMS Investment Services. All rights reserved by <a href="https://codescandy.com/" target="_blank">CodesCandy</a>. Distributed by <a href="https://themewagon.com" target="_blank">ThemeWagon</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

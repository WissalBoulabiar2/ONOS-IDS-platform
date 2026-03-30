import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, TrendingUp, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              Client <span className="text-cyan-600">Success Stories</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Hear directly from our clients about their investment journey and the results they've achieved with our
              portfolio management services.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-white">
              <CardContent className="p-8">
                <Quote className="h-12 w-12 text-cyan-600 mb-6" />
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 font-sans mb-6 italic leading-relaxed">
                  "PMS Investment Services transformed my approach to wealth management. Their personalized strategy
                  helped me achieve a 22% annual return over the past three years, significantly outperforming my
                  previous investments. The team's expertise and transparent communication give me complete confidence
                  in my financial future."
                </p>
                <div className="flex items-center">
                  <img
                    src="/images/avatar/avatar-1.jpg"
                    alt="Rajesh Kumar"
                    className="w-15 h-15 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-serif font-bold text-gray-900 text-lg">Rajesh Kumar</div>
                    <div className="text-cyan-600 font-sans">Tech Entrepreneur</div>
                    <div className="text-sm text-gray-600 font-sans">Portfolio Value: ₹2.5 Crores</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-8">
                <Quote className="h-12 w-12 text-amber-600 mb-6" />
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 font-sans mb-6 italic leading-relaxed">
                  "After losing money with other investment advisors, I was skeptical about portfolio management
                  services. PMS changed my perspective completely. Their risk management approach protected my
                  investments during market volatility while still delivering impressive returns. I've recommended them
                  to all my friends."
                </p>
                <div className="flex items-center">
                  <img
                    src="/images/avatar/avatar-4.jpg"
                    alt="Priya Sharma"
                    className="w-15 h-15 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-serif font-bold text-gray-900 text-lg">Priya Sharma</div>
                    <div className="text-amber-600 font-sans">Senior Executive, MNC</div>
                    <div className="text-sm text-gray-600 font-sans">Portfolio Value: ₹1.8 Crores</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Testimonials Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Over 200 satisfied clients trust us with their wealth management needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "The quarterly reviews and detailed reports help me understand exactly where my money is invested. The
                  transparency is refreshing compared to other investment firms I've worked with."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-2.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Amit Patel</div>
                    <div className="text-sm text-gray-600 font-sans">Manufacturing Business Owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "My relationship manager is always available to answer questions and explain market movements. The
                  personalized service makes me feel like their most important client."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-3.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Sunita Agarwal</div>
                    <div className="text-sm text-gray-600 font-sans">Retired Government Officer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "They helped me diversify my portfolio beyond just real estate and fixed deposits. The returns have
                  been consistently better than my previous investments."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-5.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Vikram Singh</div>
                    <div className="text-sm text-gray-600 font-sans">Real Estate Developer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "The tax optimization strategies they implemented saved me lakhs in taxes while improving my overall
                  returns. Their holistic approach is impressive."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-6.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Meera Joshi</div>
                    <div className="text-sm text-gray-600 font-sans">CA & Financial Consultant</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "During the 2020 market crash, while others panicked, PMS kept me calm and actually found
                  opportunities. My portfolio recovered faster than I expected."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-7.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Ravi Gupta</div>
                    <div className="text-sm text-gray-600 font-sans">Import-Export Business</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "As a busy doctor, I don't have time to manage investments. PMS takes care of everything while keeping
                  me informed. Perfect solution for professionals like me."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-8.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Dr. Kavita Reddy</div>
                    <div className="text-sm text-gray-600 font-sans">Cardiologist</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Client Success Metrics</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Real results that demonstrate our commitment to client success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8 pb-8">
                <TrendingUp className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
                <div className="text-4xl font-serif font-black text-cyan-600 mb-2">15.2%</div>
                <div className="text-lg font-serif font-bold text-gray-900 mb-2">Average Annual Returns</div>
                <div className="text-gray-600 font-sans">
                  Consistently outperforming market benchmarks over the past 5 years
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8 pb-8">
                <Shield className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <div className="text-4xl font-serif font-black text-amber-600 mb-2">98%</div>
                <div className="text-lg font-serif font-bold text-gray-900 mb-2">Client Retention Rate</div>
                <div className="text-gray-600 font-sans">
                  Our clients stay with us because we deliver on our promises
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8 pb-8">
                <Users className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
                <div className="text-4xl font-serif font-black text-cyan-600 mb-2">85%</div>
                <div className="text-lg font-serif font-bold text-gray-900 mb-2">Referral Rate</div>
                <div className="text-gray-600 font-sans">
                  Most of our new clients come through referrals from existing clients
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Join Our Success Stories</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Experience the same level of service and results that our clients rave about.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
              Start Your Journey Today
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

import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, TrendingUp, Shield, Users, Target } from "lucide-react"
import Link from "next/link"

export default function PortfolioManagementPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-cyan-600 text-white mb-4">Our Flagship Service</Badge>
              <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
                Portfolio <span className="text-cyan-600">Management</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 font-sans leading-relaxed">
                Professional investment management that adapts to your goals, risk tolerance, and market conditions. Let
                our experienced team handle the complexities while you focus on what matters most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 text-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 px-8 py-4 text-lg bg-transparent"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/pms-img-1.jpg"
                alt="Portfolio management dashboard"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Why Choose Our Portfolio Management?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Comprehensive investment management designed to maximize returns while managing risk.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <TrendingUp className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Superior Returns</h3>
                <p className="text-gray-600 font-sans text-sm">Average annual returns of 15.2% over the past decade</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <Shield className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk Management</h3>
                <p className="text-gray-600 font-sans text-sm">Advanced risk controls and diversification strategies</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <Users className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Personal Service</h3>
                <p className="text-gray-600 font-sans text-sm">
                  Dedicated relationship manager for personalized attention
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <Target className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Goal Alignment</h3>
                <p className="text-gray-600 font-sans text-sm">
                  Strategies tailored to your specific financial objectives
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-black text-gray-900 mb-6">Our Investment Approach</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Research-Driven Decisions</h3>
                    <p className="text-gray-600 font-sans">
                      Every investment decision is backed by comprehensive fundamental and technical analysis conducted
                      by our experienced research team.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Dynamic Asset Allocation</h3>
                    <p className="text-gray-600 font-sans">
                      We continuously adjust portfolio allocations based on market conditions, economic indicators, and
                      your changing life circumstances.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk-Adjusted Performance</h3>
                    <p className="text-gray-600 font-sans">
                      Our focus is on generating superior risk-adjusted returns rather than chasing short-term
                      performance at the expense of long-term stability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Transparent Reporting</h3>
                    <p className="text-gray-600 font-sans">
                      Regular, detailed reports keep you informed about your portfolio performance, holdings, and our
                      investment rationale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/images/pms-img-2.jpg"
                alt="Investment research and analysis"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">What's Included</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Comprehensive portfolio management services designed to meet all your investment needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif font-bold text-gray-900">Investment Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-sans text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Customized asset allocation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Diversified portfolio construction
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Regular rebalancing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Tax-efficient investing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif font-bold text-gray-900">Ongoing Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-sans text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Daily portfolio monitoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Performance tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Risk management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Market opportunity identification
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif font-bold text-gray-900">Client Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-sans text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Dedicated relationship manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Quarterly portfolio reviews
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    24/7 online access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Priority customer support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Portfolio Management Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Choose the plan that best fits your investment needs and portfolio size.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-cyan-600 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold">Essential</CardTitle>
                <div className="text-4xl font-serif font-black text-cyan-600 mt-4">2.5%</div>
                <div className="text-sm text-gray-600 font-sans">Annual management fee</div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-lg font-serif font-bold text-gray-900">₹25 Lakhs minimum</div>
                </div>
                <ul className="space-y-2 font-sans text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Quarterly reviews
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Online portfolio access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Email support
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-cyan-600 relative shadow-xl">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500">Most Popular</Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold">Premium</CardTitle>
                <div className="text-4xl font-serif font-black text-cyan-600 mt-4">2.0%</div>
                <div className="text-sm text-gray-600 font-sans">Annual management fee</div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-lg font-serif font-bold text-gray-900">₹50 Lakhs minimum</div>
                </div>
                <ul className="space-y-2 font-sans text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Monthly reviews
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Dedicated manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-cyan-600 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold">Elite</CardTitle>
                <div className="text-4xl font-serif font-black text-cyan-600 mt-4">1.5%</div>
                <div className="text-sm text-gray-600 font-sans">Annual management fee</div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-lg font-serif font-bold text-gray-900">₹1 Crore minimum</div>
                </div>
                <ul className="space-y-2 font-sans text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Weekly monitoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Senior manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    24/7 support
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Start?</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Schedule a consultation to discuss your investment goals and learn how our portfolio management can help you
            achieve them.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
              Schedule Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
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

import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              Transparent <span className="text-cyan-600">Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Choose the plan that best fits your investment goals. No hidden fees, no surprises - just transparent
              pricing aligned with your success.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-cyan-600 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold">Essential</CardTitle>
                <CardDescription className="font-sans text-lg">Perfect for growing portfolios</CardDescription>
                <div className="text-5xl font-serif font-black text-cyan-600 mt-6">2.5%</div>
                <div className="text-gray-600 font-sans">Annual management fee</div>
                <div className="text-sm text-gray-500 font-sans mt-2">No performance fees</div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-gray-900 mb-2">₹25 Lakhs</div>
                  <div className="text-gray-600 font-sans">Minimum investment</div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-gray-900">What's Included:</h4>
                  <ul className="space-y-3 font-sans">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Quarterly portfolio reviews
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      24/7 online portfolio access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Email support (48-hour response)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Basic tax reporting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Diversified equity portfolio
                    </li>
                    <li className="flex items-center text-gray-400">
                      <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      Dedicated relationship manager
                    </li>
                    <li className="flex items-center text-gray-400">
                      <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      Alternative investments
                    </li>
                  </ul>
                </div>

                <Link href="/contact" className="block">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-cyan-600 relative shadow-xl">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold">Premium</CardTitle>
                <CardDescription className="font-sans text-lg">For serious investors</CardDescription>
                <div className="text-5xl font-serif font-black text-cyan-600 mt-6">2.0%</div>
                <div className="text-gray-600 font-sans">Annual management fee</div>
                <div className="text-sm text-gray-500 font-sans mt-2">+ 20% performance fee above 12% returns</div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-gray-900 mb-2">₹50 Lakhs</div>
                  <div className="text-gray-600 font-sans">Minimum investment</div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-gray-900">What's Included:</h4>
                  <ul className="space-y-3 font-sans">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Monthly portfolio reviews
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Dedicated relationship manager
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Priority phone support (24-hour response)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Advanced tax optimization
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Multi-asset class portfolio
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Quarterly strategy calls
                    </li>
                    <li className="flex items-center text-gray-400">
                      <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      Alternative investments
                    </li>
                  </ul>
                </div>

                <Link href="/contact" className="block">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-cyan-600 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold">Elite</CardTitle>
                <CardDescription className="font-sans text-lg">For high net worth individuals</CardDescription>
                <div className="text-5xl font-serif font-black text-cyan-600 mt-6">1.5%</div>
                <div className="text-gray-600 font-sans">Annual management fee</div>
                <div className="text-sm text-gray-500 font-sans mt-2">+ 25% performance fee above 15% returns</div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-gray-900 mb-2">₹1 Crore</div>
                  <div className="text-gray-600 font-sans">Minimum investment</div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-gray-900">What's Included:</h4>
                  <ul className="space-y-3 font-sans">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Weekly portfolio monitoring
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Senior portfolio manager
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      24/7 concierge support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Estate planning assistance
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Alternative investments access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Monthly strategy meetings
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-cyan-600 mr-3 flex-shrink-0" />
                      Custom investment solutions
                    </li>
                  </ul>
                </div>

                <Link href="/contact" className="block">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fee Structure Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Fee Structure Details</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Complete transparency in our pricing with no hidden costs or surprise charges.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-serif font-bold text-gray-900">Management Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-sans">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Essential Plan</span>
                  <span className="font-bold text-cyan-600">2.5% annually</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Premium Plan</span>
                  <span className="font-bold text-cyan-600">2.0% annually</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Elite Plan</span>
                  <span className="font-bold text-cyan-600">1.5% annually</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Management fees are calculated monthly and deducted quarterly from your portfolio.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-serif font-bold text-gray-900">Performance Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-sans">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Essential Plan</span>
                  <span className="font-bold text-gray-900">No performance fee</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Premium Plan</span>
                  <span className="font-bold text-cyan-600">20% above 12% returns</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Elite Plan</span>
                  <span className="font-bold text-cyan-600">25% above 15% returns</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Performance fees are only charged when we exceed the specified benchmark returns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Costs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-black text-gray-900 mb-4">What's NOT Included</h2>
            <p className="text-lg text-gray-600 font-sans">
              Transparency means telling you about all potential costs upfront.
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Transaction Costs</h3>
                  <ul className="space-y-2 font-sans text-gray-600">
                    <li>• Brokerage charges (typically 0.1-0.5%)</li>
                    <li>• STT, stamp duty, and other statutory charges</li>
                    <li>• Mutual fund expense ratios (if applicable)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">Optional Services</h3>
                  <ul className="space-y-2 font-sans text-gray-600">
                    <li>• Tax filing assistance (₹10,000 annually)</li>
                    <li>• Estate planning consultation (₹25,000)</li>
                    <li>• Insurance review (₹5,000)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-4 bg-cyan-50 rounded-lg">
                <p className="text-cyan-800 font-sans text-sm">
                  <strong>Note:</strong> All transaction costs are passed through at actual cost with no markup. We
                  maintain complete transparency in all charges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Schedule a consultation to discuss which plan is right for your investment goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg font-sans bg-transparent"
            >
              Download Fee Schedule
            </Button>
          </div>
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

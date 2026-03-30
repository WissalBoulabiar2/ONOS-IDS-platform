import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle, ArrowRight, TrendingUp, Shield, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default function WealthPlanningPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-500 text-white mb-4">Comprehensive Planning</Badge>
              <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
                Wealth <span className="text-amber-500">Planning</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 font-sans leading-relaxed">
                Strategic financial planning that goes beyond investments. We help you build, preserve, and transfer
                wealth across generations with comprehensive planning strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg">
                    Start Planning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-50 px-8 py-4 text-lg bg-transparent"
                  >
                    Free Consultation
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/pms-img-4.jpg"
                alt="Wealth planning consultation"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Planning Areas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Comprehensive Wealth Planning</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Our holistic approach covers all aspects of your financial life to ensure long-term wealth creation and
              preservation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Goal-Based Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Define and prioritize your financial goals with clear timelines and actionable strategies.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Retirement planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Children's education
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Home purchase
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Business expansion
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Protect your wealth and family with comprehensive insurance and risk mitigation strategies.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Life insurance review
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Health insurance planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Disability coverage
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Emergency fund planning
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Estate Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Ensure smooth wealth transfer to future generations with proper estate planning structures.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Will preparation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Trust structures
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Succession planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Tax optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Retirement Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Build a secure retirement with strategic planning and disciplined wealth accumulation.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Retirement corpus calculation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Pension planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Post-retirement income
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Healthcare planning
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Tax Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Minimize tax liability and maximize after-tax wealth through strategic tax planning.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Tax-saving investments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Capital gains planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Income tax optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Compliance support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Cash Flow Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Optimize your cash flow and liquidity management for better financial stability.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Budget optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Debt management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Liquidity planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Expense tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Planning Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              A systematic approach to understanding your needs and creating a comprehensive wealth plan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Discovery</h3>
              <p className="text-gray-600 font-sans">
                Comprehensive assessment of your current financial situation, goals, and risk tolerance.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Analysis</h3>
              <p className="text-gray-600 font-sans">
                Detailed analysis of gaps between current position and future goals with actionable recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Strategy</h3>
              <p className="text-gray-600 font-sans">
                Development of customized wealth planning strategies aligned with your specific objectives.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                4
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Implementation</h3>
              <p className="text-gray-600 font-sans">
                Execution of the wealth plan with ongoing monitoring and periodic reviews for optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-6">Ready to Plan Your Financial Future?</h2>
          <p className="text-xl text-amber-100 mb-8 font-sans">
            Start your comprehensive wealth planning journey with our expert advisors today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-amber-500 hover:bg-gray-100 px-8 py-4 text-lg">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-amber-500 px-8 py-4 text-lg bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-serif font-black">PMS Investment</span>
              </div>
              <p className="text-gray-400 mb-6 font-sans max-w-md">
                Professional Portfolio Management Services helping you build and preserve wealth through strategic
                investment planning.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold mb-4">Services</h3>
              <ul className="space-y-2 font-sans text-gray-400">
                <li>
                  <Link href="/services/portfolio-management" className="hover:text-white">
                    Portfolio Management
                  </Link>
                </li>
                <li>
                  <Link href="/services/wealth-planning" className="hover:text-white">
                    Wealth Planning
                  </Link>
                </li>
                <li>
                  <Link href="/services/risk-assessment" className="hover:text-white">
                    Risk Assessment
                  </Link>
                </li>
                <li>
                  <Link href="/services/tax-optimization" className="hover:text-white">
                    Tax Optimization
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold mb-4">Company</h3>
              <ul className="space-y-2 font-sans text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="hover:text-white">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
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

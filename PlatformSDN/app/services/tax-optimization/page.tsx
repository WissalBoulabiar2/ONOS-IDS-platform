import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, CheckCircle, ArrowRight, TrendingUp, FileText, PiggyBank, Building, Users } from "lucide-react"
import Link from "next/link"

export default function TaxOptimizationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-500 text-white mb-4">Tax Efficiency</Badge>
              <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
                Tax <span className="text-amber-500">Optimization</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 font-sans leading-relaxed">
                Maximize your after-tax returns through strategic tax planning and optimization techniques. Our
                comprehensive approach helps you keep more of what you earn while staying compliant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg">
                    Optimize My Taxes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-amber-500 text-amber-500 hover:bg-amber-50 px-8 py-4 text-lg bg-transparent"
                  >
                    Free Tax Review
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/pms-img-3.jpg"
                alt="Tax optimization strategies"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tax Optimization Strategies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Comprehensive Tax Strategies</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Our multi-faceted approach to tax optimization covers all aspects of your financial life to minimize tax
              liability and maximize wealth accumulation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Capital Gains Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Strategic timing of asset sales to optimize capital gains tax liability and maximize after-tax
                  returns.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Tax-loss harvesting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Long-term vs short-term gains
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Asset location strategies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Wash sale rule compliance
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Retirement Tax Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Optimize retirement account contributions and withdrawals to minimize lifetime tax burden.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    401(k) optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    IRA conversion strategies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Required distribution planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Tax-deferred vs tax-free
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Income Tax Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Comprehensive income tax planning to reduce current and future tax obligations.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Deduction maximization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Tax credit utilization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Income timing strategies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Alternative minimum tax planning
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Estate Tax Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Minimize estate and gift taxes while maximizing wealth transfer to beneficiaries.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Gift tax optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Trust structures
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Generation-skipping strategies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Charitable giving optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Business Tax Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Strategic tax planning for business owners and entrepreneurs to minimize corporate tax burden.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Entity structure optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Section 199A deduction
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Equipment depreciation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    R&D credit optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Tax-Efficient Investing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Investment strategies designed to minimize tax drag and maximize after-tax portfolio growth.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Municipal bond strategies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Index fund optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Dividend tax planning
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    International tax considerations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tax Planning Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Tax Optimization Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              A systematic approach to identifying tax-saving opportunities and implementing optimization strategies.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Tax Situation Analysis</h3>
              <p className="text-gray-600 font-sans">
                Comprehensive review of your current tax situation, including income sources and deductions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Opportunity Identification</h3>
              <p className="text-gray-600 font-sans">
                Identify specific tax-saving opportunities based on your unique financial circumstances.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Strategy Implementation</h3>
              <p className="text-gray-600 font-sans">
                Execute tax optimization strategies with proper documentation and compliance procedures.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                4
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Ongoing Monitoring</h3>
              <p className="text-gray-600 font-sans">
                Regular review and adjustment of tax strategies as laws change and circumstances evolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-6">Start Saving on Taxes Today</h2>
          <p className="text-xl text-amber-100 mb-8 font-sans">
            Get a comprehensive tax review and personalized optimization strategy from our experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-amber-500 hover:bg-gray-100 px-8 py-4 text-lg">
                Get Tax Review
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
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-serif font-black">PMS Investment</span>
              </div>
              <p className="text-gray-400 mb-6 font-sans max-w-md">
                Professional Portfolio Management Services helping you build and preserve wealth through strategic
                investment planning.
              </p>
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
            <p className="text-gray-400 font-sans">© 2024 PMS Investment Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

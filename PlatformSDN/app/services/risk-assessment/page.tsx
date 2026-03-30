import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, ArrowRight, AlertTriangle, BarChart3, Target, TrendingDown, Activity } from "lucide-react"
import Link from "next/link"

export default function RiskAssessmentPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-cyan-600 text-white mb-4">Risk Management</Badge>
              <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
                Risk <span className="text-cyan-600">Assessment</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 font-sans leading-relaxed">
                Comprehensive risk analysis and management strategies to protect your investments and optimize returns
                while maintaining your comfort level with market volatility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 text-lg">
                    Get Risk Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 px-8 py-4 text-lg bg-transparent"
                  >
                    Free Assessment
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/pms-img-1.jpg"
                alt="Risk assessment analysis"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Risk Assessment Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Comprehensive Risk Analysis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              We evaluate multiple risk dimensions to create a complete picture of your investment risk profile and
              develop appropriate mitigation strategies.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Market Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Evaluate exposure to market volatility and systematic risks across different asset classes.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Volatility assessment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Beta analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Correlation studies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Stress testing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Credit Risk Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Assess counterparty risk and credit quality of fixed income investments and issuers.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Credit rating analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Default probability
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Issuer quality review
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Concentration limits
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Liquidity Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Evaluate the ability to convert investments to cash without significant price impact.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Trading volume analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Bid-ask spread review
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Market depth study
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Emergency liquidity planning
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Concentration Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Identify and manage risks from over-concentration in specific assets, sectors, or regions.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Portfolio diversification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Sector allocation limits
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Geographic distribution
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Single stock limits
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Drawdown Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Measure potential losses during adverse market conditions and recovery timeframes.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Maximum drawdown calculation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Recovery period analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Scenario modeling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-cyan-600 mr-2" />
                    Risk tolerance alignment
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Operational Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center mb-4">
                  Evaluate risks from operational failures, system issues, and process breakdowns.
                </p>
                <ul className="space-y-2 font-sans text-gray-600 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Custodian risk assessment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Technology risk review
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Process documentation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Contingency planning
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Management Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Risk Management Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              A systematic approach to identifying, measuring, and managing investment risks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk Identification</h3>
              <p className="text-gray-600 font-sans">
                Comprehensive identification of all potential risks affecting your investment portfolio.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk Measurement</h3>
              <p className="text-gray-600 font-sans">
                Quantitative analysis using advanced metrics and models to measure risk exposure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk Mitigation</h3>
              <p className="text-gray-600 font-sans">
                Implementation of strategies to reduce, transfer, or eliminate identified risks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                4
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Risk Monitoring</h3>
              <p className="text-gray-600 font-sans">
                Continuous monitoring and periodic review to ensure risk levels remain appropriate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-cyan-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-6">
            Protect Your Investments with Professional Risk Management
          </h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Get a comprehensive risk assessment and personalized risk management strategy today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Get Risk Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg bg-transparent"
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
                  <Shield className="h-6 w-6 text-white" />
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

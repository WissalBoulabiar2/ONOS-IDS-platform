import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, TrendingUp, Users, Calculator, ArrowRight, CheckCircle, Target, PieChart } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      slug: "portfolio-management",
      title: "Portfolio Management",
      description: "Professional investment management tailored to your financial goals and risk tolerance.",
      icon: PieChart,
      color: "cyan",
      features: ["Diversified Investment Strategy", "Regular Rebalancing", "Performance Monitoring", "Risk Management"],
      minInvestment: "₹25 Lakhs",
      managementFee: "1.5% - 2.5%",
    },
    {
      slug: "wealth-planning",
      title: "Wealth Planning",
      description: "Comprehensive financial planning to help you build and preserve wealth over the long term.",
      icon: Target,
      color: "amber",
      features: ["Goal-Based Planning", "Retirement Planning", "Estate Planning", "Insurance Review"],
      minInvestment: "₹10 Lakhs",
      managementFee: "Consultation Based",
    },
    {
      slug: "risk-assessment",
      title: "Risk Assessment",
      description: "Thorough analysis of your risk profile to optimize your investment strategy.",
      icon: Shield,
      color: "cyan",
      features: ["Risk Profiling", "Stress Testing", "Scenario Analysis", "Risk Mitigation"],
      minInvestment: "₹5 Lakhs",
      managementFee: "₹25,000 - ₹50,000",
    },
    {
      slug: "tax-optimization",
      title: "Tax Optimization",
      description: "Strategic tax planning to maximize your after-tax returns and minimize tax liability.",
      icon: Calculator,
      color: "amber",
      features: ["Tax-Loss Harvesting", "Asset Location", "Tax-Efficient Investing", "Compliance Support"],
      minInvestment: "₹15 Lakhs",
      managementFee: "0.5% - 1.0%",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              Our <span className="text-cyan-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Comprehensive investment and wealth management services designed to help you achieve your financial goals
              with confidence and peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              const bgColor = service.color === "cyan" ? "bg-cyan-100" : "bg-amber-100"
              const textColor = service.color === "cyan" ? "text-cyan-600" : "text-amber-600"
              const borderColor = service.color === "cyan" ? "border-cyan-600" : "border-amber-600"

              return (
                <Card key={service.slug} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-4`}>
                      <IconComponent className={`h-8 w-8 ${textColor}`} />
                    </div>
                    <CardTitle className="text-2xl font-serif font-bold text-gray-900">{service.title}</CardTitle>
                    <p className="text-gray-600 font-sans leading-relaxed">{service.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-serif font-bold text-gray-900">Key Features:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center font-sans text-gray-600">
                            <CheckCircle className="h-4 w-4 text-cyan-600 mr-3 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500 font-sans">Minimum Investment</p>
                        <p className="font-serif font-bold text-gray-900">{service.minInvestment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-sans">Fee Structure</p>
                        <p className="font-serif font-bold text-gray-900">{service.managementFee}</p>
                      </div>
                    </div>

                    <Link href={`/services/${service.slug}`}>
                      <Button
                        className={`w-full ${borderColor} ${textColor} hover:bg-cyan-50 bg-transparent`}
                        variant="outline"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Why Choose Our Services?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              We combine decades of experience with cutting-edge technology to deliver exceptional results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8 pb-8">
                <TrendingUp className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Proven Track Record</h3>
                <p className="text-gray-600 font-sans">
                  Over 20 years of consistent outperformance with average annual returns of 15.2%
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8 pb-8">
                <Users className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Personalized Approach</h3>
                <p className="text-gray-600 font-sans">
                  Dedicated relationship managers and customized strategies for each client's unique needs
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="pt-8 pb-8">
                <Shield className="h-16 w-16 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Regulatory Compliance</h3>
                <p className="text-gray-600 font-sans">
                  SEBI registered and fully compliant with all regulatory requirements for your peace of mind
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              A systematic approach to understanding your needs and delivering exceptional results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Discovery</h3>
              <p className="text-gray-600 font-sans">
                Understand your financial goals, risk tolerance, and investment preferences through detailed
                consultation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Strategy</h3>
              <p className="text-gray-600 font-sans">
                Develop a customized investment strategy and financial plan tailored to your specific needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Implementation</h3>
              <p className="text-gray-600 font-sans">
                Execute the strategy with careful attention to timing, allocation, and risk management.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                4
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Monitoring</h3>
              <p className="text-gray-600 font-sans">
                Continuous monitoring, regular reviews, and adjustments to ensure optimal performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Schedule a consultation to discuss which services are right for your investment goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg font-sans bg-transparent"
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

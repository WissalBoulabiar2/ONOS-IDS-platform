import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Shield, TrendingUp, Users, CheckCircle, Star } from "lucide-react"
import Navigation from "@/components/navigation"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              Empowering Your <span className="text-cyan-600">Financial Future</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Tailored investment strategies for discerning investors. Experience professional portfolio management with
              expertise, transparency, and unwavering trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 text-lg">
                  Schedule a Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 px-8 py-4 text-lg bg-transparent"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-black text-gray-900 mb-6">Who We Are</h2>
              <p className="text-lg text-gray-600 mb-6 font-sans leading-relaxed">
                At PMS Investment Services, we understand that your wealth deserves a careful and strategic approach.
                With over two decades of experience in portfolio management, we've built our reputation on delivering
                exceptional results for high-net-worth individuals and institutional clients.
              </p>
              <p className="text-lg text-gray-600 mb-8 font-sans leading-relaxed">
                Our team of seasoned investment professionals combines deep market knowledge with cutting-edge
                analytical tools to create personalized investment strategies that align with your financial goals and
                risk tolerance.
              </p>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-serif font-black text-cyan-600">20+</div>
                  <div className="text-sm text-gray-600 font-sans">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-black text-cyan-600">₹500Cr+</div>
                  <div className="text-sm text-gray-600 font-sans">Assets Under Management</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif font-black text-cyan-600">200+</div>
                  <div className="text-sm text-gray-600 font-sans">Satisfied Clients</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/pms-img-2.jpg"
                alt="Professional financial advisors"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our PMS */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Why Choose Our PMS?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              We offer more than just investment management – we provide a comprehensive wealth management experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center">
                  Advanced risk assessment and mitigation strategies to protect your wealth while maximizing growth
                  potential.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Performance Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center">
                  Consistent outperformance through disciplined investment processes and market expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle className="text-xl font-serif font-bold">Personalized Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 font-sans text-center">
                  Dedicated relationship managers providing personalized attention and regular portfolio reviews.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Philosophy */}
      <section id="philosophy" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Our Investment Philosophy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              We believe in transparency, integrity, and dedication to your financial success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Research-Driven Approach</h3>
                    <p className="text-gray-600 font-sans">
                      Comprehensive fundamental and technical analysis guides every investment decision.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Long-term Value Creation</h3>
                    <p className="text-gray-600 font-sans">
                      Focus on sustainable growth and wealth preservation over market cycles.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Diversification Strategy</h3>
                    <p className="text-gray-600 font-sans">
                      Balanced portfolios across asset classes, sectors, and geographies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Transparent Communication</h3>
                    <p className="text-gray-600 font-sans">
                      Regular reporting and open dialogue about portfolio performance and strategy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/images/pms-img-1.jpg"
                alt="Investment analysis"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Our streamlined process ensures a smooth onboarding and ongoing management experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Initial Consultation</h3>
              <p className="text-gray-600 font-sans">
                Understand your financial goals, risk tolerance, and investment preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Strategy Development</h3>
              <p className="text-gray-600 font-sans">
                Create a customized investment strategy tailored to your specific needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Portfolio Implementation</h3>
              <p className="text-gray-600 font-sans">
                Execute the investment strategy with careful attention to timing and allocation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-black">
                4
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Ongoing Management</h3>
              <p className="text-gray-600 font-sans">
                Regular monitoring, rebalancing, and reporting to ensure optimal performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Client Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Hear from our satisfied clients about their investment journey with us.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "Working with PMS has transformed my investment strategy. Their expertise is unparalleled, and the
                  returns have exceeded my expectations consistently."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-1.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Rajesh Kumar</div>
                    <div className="text-sm text-gray-600 font-sans">Business Owner</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "The personalized attention and transparent communication make all the difference. I feel confident
                  about my financial future."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-4.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Priya Sharma</div>
                    <div className="text-sm text-gray-600 font-sans">Senior Executive</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 font-sans mb-4 italic">
                  "Their risk management approach protected my portfolio during market volatility while still delivering
                  strong returns."
                </p>
                <div className="flex items-center">
                  <img src="/images/avatar/avatar-5.jpg" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-serif font-bold text-gray-900">Amit Patel</div>
                    <div className="text-sm text-gray-600 font-sans">Entrepreneur</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plans & Fees */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Plans & Fees Overview</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
              Transparent pricing structure designed to align our success with yours.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200 hover:border-cyan-600 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold">Essential</CardTitle>
                <CardDescription className="font-sans">For growing portfolios</CardDescription>
                <div className="text-4xl font-serif font-black text-cyan-600 mt-4">2.5%</div>
                <div className="text-sm text-gray-600 font-sans">Annual management fee</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-sans">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Minimum investment: ₹25 Lakhs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Quarterly portfolio reviews
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Online portfolio access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Email support
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-cyan-600 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500">Most Popular</Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold">Premium</CardTitle>
                <CardDescription className="font-sans">For serious investors</CardDescription>
                <div className="text-4xl font-serif font-black text-cyan-600 mt-4">2.0%</div>
                <div className="text-sm text-gray-600 font-sans">Annual management fee</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-sans">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Minimum investment: ₹50 Lakhs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Monthly portfolio reviews
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Dedicated relationship manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Priority phone support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Tax optimization strategies
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-cyan-600 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif font-bold">Elite</CardTitle>
                <CardDescription className="font-sans">For high net worth individuals</CardDescription>
                <div className="text-4xl font-serif font-black text-cyan-600 mt-4">1.5%</div>
                <div className="text-sm text-gray-600 font-sans">Annual management fee</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 font-sans">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Minimum investment: ₹1 Crore
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Weekly portfolio monitoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Senior portfolio manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    24/7 concierge support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Estate planning assistance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mr-2" />
                    Alternative investments access
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700">Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 font-sans">
              Get answers to common questions about our portfolio management services.
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-serif font-bold text-gray-900 hover:text-cyan-600">
                What is the minimum investment amount?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 font-sans">
                Our minimum investment varies by plan: ₹25 Lakhs for Essential, ₹50 Lakhs for Premium, and ₹1 Crore for
                Elite. This ensures we can provide the level of personalized service and diversification that our
                clients deserve.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-serif font-bold text-gray-900 hover:text-cyan-600">
                How often will I receive portfolio updates?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 font-sans">
                Update frequency depends on your plan: Quarterly for Essential, Monthly for Premium, and Weekly
                monitoring for Elite clients. All clients have 24/7 online access to their portfolio performance and can
                request updates anytime.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-serif font-bold text-gray-900 hover:text-cyan-600">
                What types of investments do you focus on?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 font-sans">
                We invest across a diversified range of asset classes including equities, fixed income, commodities, and
                alternative investments. Our approach is tailored to each client's risk profile and investment
                objectives.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-serif font-bold text-gray-900 hover:text-cyan-600">
                How do you ensure the security of my investments?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 font-sans">
                We are registered with SEBI and follow all regulatory guidelines. Your investments are held in your name
                with qualified custodians, and we maintain comprehensive insurance coverage. We also employ advanced
                cybersecurity measures to protect your data.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-serif font-bold text-gray-900 hover:text-cyan-600">
                Can I withdraw my investments anytime?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 font-sans">
                Yes, you can request withdrawals at any time. Most withdrawals are processed within 3-5 business days,
                though some alternative investments may have longer redemption periods. We'll always communicate any
                restrictions upfront.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Take the first step towards securing your financial future with our expert portfolio management services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg font-sans bg-transparent"
            >
              Download Brochure
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

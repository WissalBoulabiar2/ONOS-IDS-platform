import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Phone, Mail, MapPin, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ConsultationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              Schedule Your <span className="text-cyan-600">Consultation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Take the first step towards your financial goals. Book a complimentary consultation with our expert
              advisors to discuss your investment needs and explore how we can help you build wealth.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Consultation Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl font-serif font-bold text-gray-900">Book Your Consultation</CardTitle>
                <p className="text-gray-600 font-sans">
                  Fill out the form below and we'll get back to you within 24 hours to schedule your personalized
                  consultation.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-sans">
                        First Name *
                      </Label>
                      <Input id="firstName" placeholder="Enter your first name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="font-sans">
                        Last Name *
                      </Label>
                      <Input id="lastName" placeholder="Enter your last name" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans">
                      Email Address *
                    </Label>
                    <Input id="email" type="email" placeholder="Enter your email address" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans">
                      Phone Number *
                    </Label>
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investmentAmount" className="font-sans">
                      Investment Amount Range
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25-50">₹25 Lakhs - ₹50 Lakhs</SelectItem>
                        <SelectItem value="50-100">₹50 Lakhs - ₹1 Crore</SelectItem>
                        <SelectItem value="100-250">₹1 Crore - ₹2.5 Crores</SelectItem>
                        <SelectItem value="250+">₹2.5 Crores+</SelectItem>
                        <SelectItem value="discuss">Prefer to discuss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services" className="font-sans">
                      Services of Interest
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portfolio-management">Portfolio Management</SelectItem>
                        <SelectItem value="wealth-planning">Wealth Planning</SelectItem>
                        <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                        <SelectItem value="tax-optimization">Tax Optimization</SelectItem>
                        <SelectItem value="multiple">Multiple Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTime" className="font-sans">
                      Preferred Meeting Time
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                        <SelectItem value="evening">Evening (4 PM - 7 PM)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meetingType" className="font-sans">
                      Meeting Preference
                    </Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person (Mumbai Office)</SelectItem>
                        <SelectItem value="video-call">Video Call</SelectItem>
                        <SelectItem value="phone-call">Phone Call</SelectItem>
                        <SelectItem value="no-preference">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-sans">
                      Additional Information
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your investment goals, current portfolio, or any specific questions you have..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm font-sans text-gray-600">
                      I agree to the{" "}
                      <Link href="/privacy" className="text-cyan-600 hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      and consent to being contacted about PMS Investment Services.
                    </Label>
                  </div>

                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-lg font-sans">
                    Schedule My Consultation
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Consultation Information */}
            <div className="space-y-8">
              {/* What to Expect */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-gray-900">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-gray-900 mb-1">Comprehensive Assessment</h3>
                      <p className="text-gray-600 font-sans text-sm">
                        We'll review your current financial situation, investment goals, and risk tolerance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-gray-900 mb-1">Personalized Strategy</h3>
                      <p className="text-gray-600 font-sans text-sm">
                        Receive tailored investment recommendations based on your unique circumstances.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-gray-900 mb-1">No Obligation</h3>
                      <p className="text-gray-600 font-sans text-sm">
                        This consultation is completely free with no commitment required.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-gray-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-gray-900">Phone</p>
                      <p className="text-gray-600 font-sans">+91 98765 43210</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-gray-900">Email</p>
                      <p className="text-gray-600 font-sans">consultation@pmsinvestment.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-gray-900">Office</p>
                      <p className="text-gray-600 font-sans">Nariman Point, Mumbai 400021</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-gray-900">Hours</p>
                      <p className="text-gray-600 font-sans">Mon-Fri: 9 AM - 7 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-amber-50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <TrendingUp className="h-12 w-12 text-cyan-600 mx-auto" />
                    <h3 className="text-xl font-serif font-bold text-gray-900">Why Choose Us?</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-serif font-black text-cyan-600">20+</div>
                        <div className="text-sm text-gray-600 font-sans">Years Experience</div>
                      </div>
                      <div>
                        <div className="text-2xl font-serif font-black text-cyan-600">₹500Cr+</div>
                        <div className="text-sm text-gray-600 font-sans">Assets Managed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-serif font-black text-cyan-600">200+</div>
                        <div className="text-sm text-gray-600 font-sans">Happy Clients</div>
                      </div>
                      <div>
                        <div className="text-2xl font-serif font-black text-cyan-600">15.2%</div>
                        <div className="text-sm text-gray-600 font-sans">Avg. Returns</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-black text-gray-900 mb-4">Consultation FAQs</h2>
            <p className="text-lg text-gray-600 font-sans">Common questions about our consultation process.</p>
          </div>
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">How long is the consultation?</h3>
                <p className="text-gray-600 font-sans">
                  Initial consultations typically last 45-60 minutes, giving us enough time to understand your needs and
                  provide meaningful insights.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                  What should I bring to the consultation?
                </h3>
                <p className="text-gray-600 font-sans">
                  Please bring recent investment statements, tax returns, insurance policies, and any financial
                  documents that provide a complete picture of your current situation.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                  Is there any cost for the consultation?
                </h3>
                <p className="text-gray-600 font-sans">
                  No, the initial consultation is completely complimentary. We believe in demonstrating our value before
                  asking for your business.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                  What happens after the consultation?
                </h3>
                <p className="text-gray-600 font-sans">
                  We'll provide you with a detailed proposal outlining our recommended strategy, fee structure, and next
                  steps. You'll have time to review everything before making any decisions.
                </p>
              </CardContent>
            </Card>
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

"use client"

import type React from "react"

import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Calendar, Users, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    investmentAmount: "",
    message: "",
    preferredContact: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Contact form submission:", formData)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif font-black text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 font-sans mb-8">
              We've received your message and will get back to you within 24 hours.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">Return to Homepage</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6">
              Get In <span className="text-cyan-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
              Ready to start your investment journey? Our team of experts is here to help you achieve your financial
              goals.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 font-sans mb-4">Speak directly with our investment advisors</p>
                <a href="tel:+919876543210" className="text-cyan-600 hover:text-cyan-700 font-sans font-medium text-lg">
                  +91 98765 43210
                </a>
                <p className="text-sm text-gray-500 font-sans mt-2">Mon-Fri: 9:00 AM - 6:00 PM</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 font-sans mb-4">Send us your questions anytime</p>
                <a
                  href="mailto:info@pmsinvestment.com"
                  className="text-cyan-600 hover:text-cyan-700 font-sans font-medium"
                >
                  info@pmsinvestment.com
                </a>
                <p className="text-sm text-gray-500 font-sans mt-2">We respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Schedule Meeting</h3>
                <p className="text-gray-600 font-sans mb-4">Book a consultation at your convenience</p>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Book Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form and Office Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-gray-900 flex items-center">
                    <MessageSquare className="h-6 w-6 text-cyan-600 mr-3" />
                    Send Us a Message
                  </CardTitle>
                  <p className="text-gray-600 font-sans">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 font-sans">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans"
                          placeholder="Your first name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 font-sans">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-sans">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 font-sans">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700 font-sans">
                        Subject *
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("subject", value)}>
                        <SelectTrigger className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Schedule a Consultation</SelectItem>
                          <SelectItem value="portfolio-review">Portfolio Review</SelectItem>
                          <SelectItem value="investment-planning">Investment Planning</SelectItem>
                          <SelectItem value="tax-optimization">Tax Optimization</SelectItem>
                          <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investmentAmount" className="text-sm font-medium text-gray-700 font-sans">
                        Investment Amount Range
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("investmentAmount", value)}>
                        <SelectTrigger className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans">
                          <SelectValue placeholder="Select investment range (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25-50-lakhs">₹25 - ₹50 Lakhs</SelectItem>
                          <SelectItem value="50-lakhs-1-crore">₹50 Lakhs - ₹1 Crore</SelectItem>
                          <SelectItem value="1-2-crores">₹1 - ₹2 Crores</SelectItem>
                          <SelectItem value="2-5-crores">₹2 - ₹5 Crores</SelectItem>
                          <SelectItem value="5-crores-plus">₹5 Crores+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredContact" className="text-sm font-medium text-gray-700 font-sans">
                        Preferred Contact Method
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("preferredContact", value)}>
                        <SelectTrigger className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans">
                          <SelectValue placeholder="How would you like us to contact you?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="in-person">In-Person Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 font-sans">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 font-sans resize-none"
                        placeholder="Tell us about your investment goals, questions, or how we can help you..."
                      />
                    </div>

                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 font-sans">
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Office Locations */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-black text-gray-900 mb-8">Our Offices</h2>

                {/* Mumbai Office */}
                <Card className="border-0 shadow-lg mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Mumbai Head Office</h3>
                        <div className="space-y-2 text-gray-600 font-sans">
                          <p className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                            15th Floor, Nariman Point,
                            <br />
                            Mumbai, Maharashtra 400021
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            +91 98765 43210
                          </p>
                          <p className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            mumbai@pmsinvestment.com
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            Mon-Fri: 9:00 AM - 6:00 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delhi Office */}
                <Card className="border-0 shadow-lg mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Delhi Branch</h3>
                        <div className="space-y-2 text-gray-600 font-sans">
                          <p className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                            8th Floor, Connaught Place,
                            <br />
                            New Delhi, Delhi 110001
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            +91 98765 43211
                          </p>
                          <p className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            delhi@pmsinvestment.com
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            Mon-Fri: 9:30 AM - 6:30 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bangalore Office */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Bangalore Branch</h3>
                        <div className="space-y-2 text-gray-600 font-sans">
                          <p className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                            12th Floor, UB City Mall,
                            <br />
                            Bangalore, Karnataka 560001
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            +91 98765 43212
                          </p>
                          <p className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            bangalore@pmsinvestment.com
                          </p>
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            Mon-Fri: 9:00 AM - 6:00 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Contact Info */}
              <Card className="border-0 shadow-lg bg-cyan-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="h-6 w-6 text-cyan-600 mr-3" />
                    Need Immediate Assistance?
                  </h3>
                  <div className="space-y-3 text-gray-700 font-sans">
                    <p>
                      <strong>Emergency Support:</strong> +91 98765 43200 (Available 24/7 for existing clients)
                    </p>
                    <p>
                      <strong>WhatsApp Support:</strong> +91 98765 43210 (Mon-Fri: 9 AM - 9 PM)
                    </p>
                    <p>
                      <strong>Client Portal Support:</strong> support@pmsinvestment.com
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl text-cyan-100 mb-8 font-sans">
            Schedule a free consultation with our investment experts and discover how we can help you achieve your
            financial goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-sans">
              Schedule Free Consultation
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 text-lg font-sans bg-transparent"
            >
              Download Investment Guide
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

"use client"

import type React from "react"

import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password reset logic here
    console.log("Password reset request for:", email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                  <Mail className="h-8 w-8 text-cyan-600" />
                </div>
                <h2 className="text-3xl font-serif font-black text-gray-900">Forgot Password?</h2>
                <p className="mt-2 text-gray-600 font-sans">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Reset Form */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-serif font-bold">Reset Password</CardTitle>
                  <CardDescription className="font-sans">
                    Enter your email address and we'll send you a link to reset your password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-sans">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm font-sans"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 font-sans"
                    >
                      Send Reset Instructions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500 font-sans">Remember your password?</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50 bg-transparent font-sans"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-serif font-black text-gray-900">Check Your Email</h2>
                <p className="mt-2 text-gray-600 font-sans">
                  We've sent password reset instructions to your email address.
                </p>
              </div>

              <Card className="border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <p className="text-sm text-cyan-800 font-sans">
                        <strong>Email sent to:</strong> {email}
                      </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 font-sans">
                      <p>Please check your email and click the reset link to create a new password.</p>
                      <p>
                        <strong>Didn't receive the email?</strong> Check your spam folder or contact our support team.
                      </p>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50 bg-transparent font-sans"
                      >
                        Try Different Email
                      </Button>

                      <Link href="/login">
                        <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-sans">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Help Section */}
          <div className="text-center">
            <p className="text-xs text-gray-500 font-sans mb-2">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@pmsinvestment.com" className="text-cyan-600 hover:text-cyan-700">
                support@pmsinvestment.com
              </a>
            </p>
            <p className="text-xs text-gray-500 font-sans">
              Or call us at{" "}
              <a href="tel:+919876543210" className="text-cyan-600 hover:text-cyan-700">
                +91 98765 43210
              </a>
            </p>
          </div>
        </div>
      </div>

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

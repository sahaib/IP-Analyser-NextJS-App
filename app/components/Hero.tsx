"use client"

import { useUser } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Shield, Zap, Search, BarChart2, Download, Github, Twitter, Linkedin, Mail, Info, FileText, Lock } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react'

export function Hero() {
  const { isSignedIn } = useUser()

  const features = [
    {
      icon: <Globe className="w-12 h-12 text-blue-500" />,
      title: "Global IP Intelligence",
      description: "Get detailed geolocation data and network information for any IP address worldwide"
    },
    {
      icon: <Shield className="w-12 h-12 text-green-500" />,
      title: "Security Analysis",
      description: "Identify potential threats and analyze IP reputation using advanced AI"
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: "Bulk Processing",
      description: "Analyze thousands of IP addresses simultaneously with high performance"
    },
    {
      icon: <Search className="w-12 h-12 text-purple-500" />,
      title: "Deep Insights",
      description: "Uncover detailed ISP information, ASN details, and network characteristics"
    },
    {
      icon: <BarChart2 className="w-12 h-12 text-red-500" />,
      title: "Visual Analytics",
      description: "Interactive charts and maps to visualize IP data patterns and trends"
    },
    {
      icon: <Download className="w-12 h-12 text-indigo-500" />,
      title: "Export Options",
      description: "Export results in multiple formats including CSV, JSON, and printable reports"
    }
  ]

  return (
    <div className="py-12 space-y-12">
      <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold mb-4">IP Address Analyzer</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Analyze IP addresses in bulk. Get detailed information about location,
          ISP, and more. Perfect for network administrators and security professionals.
        </p>
        {!isSignedIn && (
          <SignInButton mode="modal">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800">
              Get Started Now
            </Button>
          </SignInButton>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4">{feature.icon}</div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Section */}
      <footer className="border-t mt-24 pt-16 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">IP Analyzer</h3>
              <p className="text-sm text-muted-foreground">
                Advanced IP analysis tools for security professionals and network administrators.
              </p>
              <div className="flex space-x-4">
                <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        About
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>About IP Analyzer</SheetTitle>
                        <SheetDescription className="space-y-4 pt-4">
                          <p>
                            IP Analyzer is a cutting-edge platform designed for network administrators,
                            security professionals, and IT teams who need comprehensive IP address analysis
                            and monitoring capabilities.
                          </p>
                          <p>
                            Our platform combines advanced geolocation data, security threat analysis,
                            and network insights to provide you with the most accurate and up-to-date
                            information about any IP address worldwide.
                          </p>
                          <p>
                            Founded by a team of cybersecurity experts, IP Analyzer aims to make
                            professional IP analysis tools accessible and easy to use for organizations
                            of all sizes.
                          </p>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Privacy Policy
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Privacy Policy</SheetTitle>
                        <SheetDescription className="space-y-4 pt-4">
                          <h4 className="font-semibold">Data Collection</h4>
                          <p>
                            We collect only essential information needed to provide our IP analysis services.
                            This includes IP addresses submitted for analysis and basic user account information.
                          </p>
                          
                          <h4 className="font-semibold">Data Usage</h4>
                          <p>
                            The data we collect is used solely for providing our IP analysis services
                            and improving user experience. We never sell or share your data with third parties.
                          </p>
                          
                          <h4 className="font-semibold">Data Security</h4>
                          <p>
                            We employ industry-standard security measures to protect your data,
                            including encryption and secure data storage practices.
                          </p>
                          
                          <h4 className="font-semibold">User Rights</h4>
                          <p>
                            You have the right to access, modify, or delete your data at any time.
                            Contact our support team for assistance with data-related requests.
                          </p>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </li>
                <li>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Terms of Service
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Terms of Service</SheetTitle>
                        <SheetDescription className="space-y-4 pt-4">
                          <h4 className="font-semibold">Service Usage</h4>
                          <p>
                            Our services are provided "as is" and are intended for legitimate
                            network administration and security purposes only.
                          </p>
                          
                          <h4 className="font-semibold">User Responsibilities</h4>
                          <p>
                            Users must comply with all applicable laws and regulations when using
                            our services. Any misuse or abuse of the service is strictly prohibited.
                          </p>
                          
                          <h4 className="font-semibold">Service Limitations</h4>
                          <p>
                            We implement rate limiting and fair usage policies to ensure service
                            quality for all users. These limits are clearly communicated in our
                            documentation.
                          </p>
                          
                          <h4 className="font-semibold">Liability</h4>
                          <p>
                            We are not liable for any damages or losses resulting from the use
                            or inability to use our services. Users are responsible for verifying
                            the accuracy of analysis results.
                          </p>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} IP Analyzer. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link href="mailto:hello@sahaibsingh.com" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  hello@sahaibsingh.com
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


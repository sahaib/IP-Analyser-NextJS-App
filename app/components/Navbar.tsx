"use client"

import Link from 'next/link'
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const { isSignedIn } = useUser()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          IP Analyzer
        </Link>
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button variant="default">
                Sign In
              </Button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}


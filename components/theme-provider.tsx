"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  children: React.ReactNode
  attribute?: "class" | "data-theme"
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  )
} 
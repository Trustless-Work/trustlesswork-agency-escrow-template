"use client"
import * as React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span>Agency Escrow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/agency" className="text-sm font-medium hover:underline">
              Agency Dashboard
            </Link>
            <a
              href="https://docs.trustlesswork.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
            >
              Docs
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Trustless Work. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
        <CardDescription>
          This is a placeholder card to demonstrate the UI components.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Replace this with your actual content.
        </p>
      </CardContent>
    </Card>
  )
}

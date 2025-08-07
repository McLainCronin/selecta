'use client' // Ensure it's a client component for better preview compatibility

import { Button } from "@/components/ui/button"
import { Music } from 'lucide-react'
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-2">
          <Music className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Selecta</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto mt-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Sync Your Music Library <span className="text-purple-600">Everywhere</span>
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Keep your playlists in perfect sync across Spotify, Apple Music, and more. AI-powered matching ensures your
          music follows you everywhere.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signin">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Get Started Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white py-4 text-center text-sm">
        <p>© 2024 Selecta. Built with Ultrasonics foundation.</p>
      </footer>
    </div>
  )
}

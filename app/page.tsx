import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Shuffle, Download, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Sync Your Music Library
            <span className="text-purple-600"> Everywhere</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
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
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Music Management</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From bi-directional syncing to complete library backups, Selecta has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Shuffle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Bi-Directional Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Keep playlists synchronized in both directions across all your streaming platforms.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>AI-Powered Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Advanced matching using ISRC codes, metadata analysis, and AI fallbacks for perfect accuracy.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Complete Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Export your entire music library to JSON/CSV with automatic cloud storage integration.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Music className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Multi-Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Support for Spotify, Apple Music, and more streaming services with OAuth integration.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Sync Your Music?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of music lovers who trust Selecta with their libraries.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary">
              Start Syncing Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6" />
              <span className="font-semibold">Selecta</span>
            </div>
            <p className="text-gray-400">© 2024 Selecta. Built with Ultrasonics foundation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, AirplayIcon as Spotify, Apple } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Music className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Selecta</CardTitle>
          <CardDescription>Connect your music services to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full h-12" asChild>
            <Link href="/api/auth/spotify">
              <Spotify className="h-5 w-5 mr-2" />
              Continue with Spotify
            </Link>
          </Button>

          <Button className="w-full h-12 bg-transparent" variant="outline" asChild>
            <Link href="/api/auth/apple">
              <Apple className="h-5 w-5 mr-2" />
              Continue with Apple Music
            </Link>
          </Button>

          <div className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

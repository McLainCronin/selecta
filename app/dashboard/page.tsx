"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, AirplayIcon as Spotify, Apple, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  useEffect(() => {
    // Check URL parameters for connection status
    const urlParams = new URLSearchParams(window.location.search)
    const connected = urlParams.get('connected')
    const error = urlParams.get('error')
    const success = urlParams.get('success')

    if (connected && success) {
      setConnectionStatus({
        type: 'success',
        message: `Successfully connected to ${connected.charAt(0).toUpperCase() + connected.slice(1)}!`
      })
    } else if (error) {
      const service = urlParams.get('service') || 'service'
      setConnectionStatus({
        type: 'error',
        message: `Failed to connect to ${service}: ${error.replace(/_/g, ' ')}`
      })
    }

    // Clean up URL parameters
    if (connected || error || success) {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [])

  const handleSpotifyConnect = () => {
    window.location.href = '/api/auth/spotify'
  }

  const handleAppleConnect = () => {
    window.location.href = '/api/auth/apple'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold">Selecta Dashboard</h1>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Connection Status Alert */}
        {connectionStatus.type && (
          <Alert className={`mb-6 ${connectionStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {connectionStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={connectionStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {connectionStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Connected Services */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Connected Services</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Spotify className="h-8 w-8 mr-3 text-green-500" />
                <div>
                  <CardTitle className="text-lg">Spotify</CardTitle>
                  <CardDescription>Music streaming service</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Not Connected</Badge>
                  <Button onClick={handleSpotifyConnect} size="sm">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Apple className="h-8 w-8 mr-3" />
                <div>
                  <CardTitle className="text-lg">Apple Music</CardTitle>
                  <CardDescription>Music streaming service</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Not Connected</Badge>
                  <Button onClick={handleAppleConnect} size="sm" disabled>
                    Connect (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Section */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>For troubleshooting purposes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
              <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'Loading...'}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('/api/test', '_blank')}
              >
                Test API Routes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

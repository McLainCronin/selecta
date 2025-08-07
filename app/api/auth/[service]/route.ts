import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ service: string }> }) {
  try {
    console.log("=== AUTH ROUTE START ===")
    
    const { service } = await params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    
    console.log(`Service: ${service}`)
    console.log(`Code present: ${!!code}`)
    console.log(`Full URL: ${request.url}`)
    
    // Environment variable check
    const envCheck = {
      SPOTIFY_CLIENT_ID: !!process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: !!process.env.SPOTIFY_CLIENT_SECRET,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    }
    console.log("Environment variables:", envCheck)

    if (!code) {
      console.log("No code, redirecting to OAuth")
      return redirectToOAuth(service)
    }

    console.log("Code present, handling callback")
    return await handleOAuthCallback(service, code)
    
  } catch (error) {
    console.error("=== AUTH ROUTE ERROR ===", error)
    
    // Return a simple HTML page with error details instead of trying to redirect
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Auth Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>Authentication Error</h2>
            <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><a href="/dashboard">Return to Dashboard</a></p>
          </div>
        </body>
      </html>
    `
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

function redirectToOAuth(service: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${service}`

  console.log(`Redirecting to OAuth for ${service}`)
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Redirect URI: ${redirectUri}`)

  switch (service) {
    case "spotify":
      if (!process.env.SPOTIFY_CLIENT_ID) {
        throw new Error("SPOTIFY_CLIENT_ID environment variable is not set")
      }
      
      const spotifyUrl = new URL("https://accounts.spotify.com/authorize")
      spotifyUrl.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID)
      spotifyUrl.searchParams.set("response_type", "code")
      spotifyUrl.searchParams.set("redirect_uri", redirectUri)
      spotifyUrl.searchParams.set("scope", "playlist-read-private playlist-modify-private playlist-modify-public")

      console.log(`Spotify OAuth URL: ${spotifyUrl.toString()}`)
      return NextResponse.redirect(spotifyUrl.toString())

    case "apple":
      if (!process.env.APPLE_CLIENT_ID) {
        throw new Error("APPLE_CLIENT_ID environment variable is not set")
      }
      
      const appleUrl = new URL("https://appleid.apple.com/auth/authorize")
      appleUrl.searchParams.set("client_id", process.env.APPLE_CLIENT_ID)
      appleUrl.searchParams.set("response_type", "code")
      appleUrl.searchParams.set("redirect_uri", redirectUri)
      appleUrl.searchParams.set("scope", "name email")

      return NextResponse.redirect(appleUrl.toString())

    default:
      throw new Error(`Unsupported service: ${service}`)
  }
}

async function handleOAuthCallback(service: string, code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  
  console.log(`=== HANDLING CALLBACK FOR ${service.toUpperCase()} ===`)
  console.log(`Code: ${code.substring(0, 20)}...`)
  
  try {
    const tokens = await exchangeCodeForTokens(service, code)
    console.log("Token exchange successful:", Object.keys(tokens))

    // For now, just redirect to dashboard with success message
    const successUrl = `${baseUrl}/dashboard?connected=${service}&success=true`
    console.log(`Redirecting to: ${successUrl}`)
    
    return NextResponse.redirect(successUrl)
    
  } catch (error) {
    console.error(`Token exchange failed for ${service}:`, error)
    
    const errorUrl = `${baseUrl}/dashboard?error=token_exchange_failed&service=${service}`
    console.log(`Redirecting to error URL: ${errorUrl}`)
    
    return NextResponse.redirect(errorUrl)
  }
}

async function exchangeCodeForTokens(service: string, code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${service}`

  console.log(`=== TOKEN EXCHANGE FOR ${service.toUpperCase()} ===`)
  console.log(`Redirect URI: ${redirectUri}`)

  switch (service) {
    case "spotify":
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error("Spotify credentials not configured")
      }

      const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")
      
      console.log("Making request to Spotify token endpoint...")
      
      const spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${authHeader}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      })

      console.log(`Spotify response status: ${spotifyResponse.status}`)
      
      if (!spotifyResponse.ok) {
        const errorText = await spotifyResponse.text()
        console.error("Spotify error response:", errorText)
        throw new Error(`Spotify API error: ${spotifyResponse.status} - ${errorText}`)
      }

      const tokens = await spotifyResponse.json()
      console.log("Spotify tokens received successfully")
      return tokens

    case "apple":
      throw new Error("Apple Music integration not yet implemented")

    default:
      throw new Error(`Unsupported service: ${service}`)
  }
}

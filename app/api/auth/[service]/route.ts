import { type NextRequest, NextResponse } from "next/server"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID
const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET

export async function GET(request: NextRequest, { params }: { params: Promise<{ service: string }> }) {
  const { service } = await params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    // Redirect to OAuth provider
    return redirectToOAuth(service)
  }

  // Handle OAuth callback
  return handleOAuthCallback(service, code)
}

function redirectToOAuth(service: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${service}`

  switch (service) {
    case "spotify":
      const spotifyUrl = new URL("https://accounts.spotify.com/authorize")
      spotifyUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID!)
      spotifyUrl.searchParams.set("response_type", "code")
      spotifyUrl.searchParams.set("redirect_uri", redirectUri)
      spotifyUrl.searchParams.set("scope", "playlist-read-private playlist-modify-private playlist-modify-public")

      return NextResponse.redirect(spotifyUrl.toString())

    case "apple":
      // Apple Music OAuth implementation
      const appleUrl = new URL("https://appleid.apple.com/auth/authorize")
      appleUrl.searchParams.set("client_id", APPLE_CLIENT_ID!)
      appleUrl.searchParams.set("response_type", "code")
      appleUrl.searchParams.set("redirect_uri", redirectUri)
      appleUrl.searchParams.set("scope", "name email")

      return NextResponse.redirect(appleUrl.toString())

    default:
      return NextResponse.json({ error: "Unsupported service" }, { status: 400 })
  }
}

async function handleOAuthCallback(service: string, code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  try {
    console.log(`[API/Auth/${service}] Handling OAuth callback for service: ${service}`)
    console.log(`[API/Auth/${service}] Received code: ${code.substring(0, 20)}...`) // Log partial code for security

    const tokens = await exchangeCodeForTokens(service, code)
    console.log(`[API/Auth/${service}] Successfully exchanged code for tokens. Tokens:`, tokens)

    // TODO: Implement actual user creation/login and token storage in Supabase
    // For now, we'll simulate a user ID. In a real app, you'd get this from your auth system.
    const userId = "mock-user-id-123" // Replace with actual user ID from your auth system

    // Example of storing tokens (uncomment and implement with Supabase)
    // const supabase = createServerClient();
    // const { data, error: dbError } = await supabase.from('users').upsert({
    //   id: userId, // Or find existing user
    //   [`${service}_token`]: tokens.access_token,
    //   [`${service}_refresh_token`]: tokens.refresh_token,
    //   email: 'user@example.com' // Get actual email from tokens or user info
    // }, { onConflict: 'id' });
    // if (dbError) {
    //   console.error(`[API/Auth/${service}] Database error storing tokens:`, dbError);
    //   return NextResponse.redirect(`${baseUrl}/dashboard?error=db_save_failed`);
    // }

    console.log(`[API/Auth/${service}] Redirecting to dashboard.`)
    return NextResponse.redirect(`${baseUrl}/dashboard?connected=${service}`)
  } catch (error: any) {
    console.error(`[API/Auth/${service}] OAuth callback error for ${service}:`, error.message || error)
    // Redirect to an error page or dashboard with an error message
    return NextResponse.redirect(`${baseUrl}/dashboard?error=auth_failed&details=${encodeURIComponent(error.message || 'unknown_error')}`)
  }
}

async function exchangeCodeForTokens(service: string, code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${service}`
  console.log(`[API/Auth/${service}] Attempting to exchange code for tokens. Redirect URI: ${redirectUri}`)

  switch (service) {
    case "spotify":
      console.log(`[API/Auth/${service}] Spotify Client ID: ${process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not Set'}`);
      console.log(`[API/Auth/${service}] Spotify Client Secret: ${process.env.SPOTIFY_CLIENT_SECRET ? 'Set' : 'Not Set'}`);
      const spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      })

      if (!spotifyResponse.ok) {
        const errorText = await spotifyResponse.text();
        console.error(`[API/Auth/${service}] Spotify token exchange failed: ${spotifyResponse.status} - ${errorText}`);
        throw new Error(`Spotify token exchange failed: ${errorText}`);
      }
      return await spotifyResponse.json()

    case "apple":
      console.log(`[API/Auth/${service}] Apple Client ID: ${process.env.APPLE_CLIENT_ID ? 'Set' : 'Not Set'}`);
      console.log(`[API/Auth/${service}] Apple Client Secret: ${process.env.APPLE_CLIENT_SECRET ? 'Set' : 'Not Set'}`);
      const appleResponse = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.APPLE_CLIENT_ID!,
          client_secret: process.env.APPLE_CLIENT_SECRET!,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      })

      if (!appleResponse.ok) {
        const errorText = await appleResponse.text();
        console.error(`[API/Auth/${service}] Apple token exchange failed: ${appleResponse.status} - ${errorText}`);
        throw new Error(`Apple token exchange failed: ${errorText}`);
      }
      return await appleResponse.json()

    default:
      throw new Error("Unsupported service")
  }
}

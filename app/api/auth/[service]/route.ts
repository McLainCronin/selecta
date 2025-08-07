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
  try {
    const tokens = await exchangeCodeForTokens(service, code)

    // Store tokens in database (implement with Supabase)
    // await storeUserTokens(userId, service, tokens)

    // Redirect to dashboard with success
    return NextResponse.redirect("/dashboard?connected=" + service)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect("/dashboard?error=auth_failed")
  }
}

async function exchangeCodeForTokens(service: string, code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${service}`

  switch (service) {
    case "spotify":
      const spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      })

      return await spotifyResponse.json()

    case "apple":
      // Apple Music token exchange implementation
      const appleResponse = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: APPLE_CLIENT_ID!,
          client_secret: APPLE_CLIENT_SECRET!,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      })

      return await appleResponse.json()

    default:
      throw new Error("Unsupported service")
  }
}

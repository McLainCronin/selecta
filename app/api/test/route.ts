import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API routes are working",
    timestamp: new Date().toISOString(),
    env_check: {
      spotify_client_id: process.env.SPOTIFY_CLIENT_ID ? "Set" : "Not Set",
      spotify_client_secret: process.env.SPOTIFY_CLIENT_SECRET ? "Set" : "Not Set",
      base_url: process.env.NEXT_PUBLIC_BASE_URL || "Not Set",
    }
  })
}

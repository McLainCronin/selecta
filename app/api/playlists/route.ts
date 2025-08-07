import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get("service")
    const userId = request.headers.get("x-user-id") // In real app, get from auth

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    let query = supabase.from("playlists").select("*").eq("user_id", userId)

    if (service) {
      query = query.eq("service", service)
    }

    const { data: playlists, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ playlists })
  } catch (error) {
    console.error("Playlists fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 })
  }
}

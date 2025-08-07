import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const { matchId } = await params
    const { action } = await request.json() // 'approve' or 'reject'

    const supabase = createServerClient()

    const { error } = await supabase
      .from("track_matches")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", matchId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Match resolution error:", error)
    return NextResponse.json({ error: "Failed to resolve match" }, { status: 500 })
  }
}

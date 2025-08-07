import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const supabase = createServerClient()

    // Get backup file info
    const { data: backupFile, error } = await supabase
      .from("backup_files")
      .select("*")
      .eq("backup_job_id", jobId)
      .single()

    if (error || !backupFile) {
      return NextResponse.json({ error: "Backup file not found" }, { status: 404 })
    }

    // In a real implementation, you would fetch the file from storage
    // For now, return a mock response
    const mockFileContent = JSON.stringify(
      {
        message: "This would be your backup file content",
        jobId,
        format: backupFile.file_format,
      },
      null,
      2,
    )

    const headers = new Headers()
    headers.set("Content-Type", backupFile.file_format === "json" ? "application/json" : "text/csv")
    headers.set("Content-Disposition", `attachment; filename="backup-${jobId}.${backupFile.file_format}"`)

    return new NextResponse(mockFileContent, { headers })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to download backup" }, { status: 500 })
  }
}

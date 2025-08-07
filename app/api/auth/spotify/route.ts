import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  
  // Simple HTML response instead of redirect
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Spotify Auth Debug</title></head>
      <body>
        <h1>Spotify Auth Route Working!</h1>
        <p>Code received: ${code ? 'Yes' : 'No'}</p>
        <p>Full URL: ${request.url}</p>
        <p>Time: ${new Date().toISOString()}</p>
        <a href="/dashboard">Go to Dashboard</a>
      </body>
    </html>
  `
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}

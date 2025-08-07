import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  albumId?: string
  isrcCode?: string
  durationMs?: number
}

interface MatchResult {
  type: "isrc_album" | "exact" | "fuzzy" | "ai" | "no_match"
  track?: Track
  confidence?: number
}

export async function matchTracks(sourceTrack: Track, targetTracks: Track[]): Promise<MatchResult> {
  // 1. ISRC + Album Match (highest confidence)
  if (sourceTrack.isrcCode && sourceTrack.albumId) {
    const isrcAlbumMatch = targetTracks.find(
      (track) => track.isrcCode === sourceTrack.isrcCode && track.albumId === sourceTrack.albumId,
    )

    if (isrcAlbumMatch) {
      return { type: "isrc_album", track: isrcAlbumMatch, confidence: 1.0 }
    }
  }

  // 2. Exact Metadata Match
  const exactMatch = targetTracks.find(
    (track) =>
      normalizeString(track.title) === normalizeString(sourceTrack.title) &&
      normalizeString(track.artist) === normalizeString(sourceTrack.artist) &&
      Math.abs((track.durationMs || 0) - (sourceTrack.durationMs || 0)) < 2000, // 2 second tolerance
  )

  if (exactMatch) {
    return { type: "exact", track: exactMatch, confidence: 0.95 }
  }

  // 3. Fuzzy Metadata Match
  const fuzzyMatches = targetTracks
    .map((track) => ({
      track,
      score: calculateFuzzyScore(sourceTrack, track),
    }))
    .filter((match) => match.score > 0.85)

  if (fuzzyMatches.length > 0) {
    const bestMatch = fuzzyMatches.sort((a, b) => b.score - a.score)[0]
    return {
      type: "fuzzy",
      track: bestMatch.track,
      confidence: bestMatch.score,
    }
  }

  // 4. AI Fallback for ambiguous cases
  if (targetTracks.length > 0) {
    try {
      const aiMatch = await performAIMatch(sourceTrack, targetTracks)
      if (aiMatch) {
        return { type: "ai", track: aiMatch.track, confidence: aiMatch.confidence }
      }
    } catch (error) {
      console.error("AI matching failed:", error)
    }
  }

  return { type: "no_match" }
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}

function calculateFuzzyScore(source: Track, target: Track): number {
  const titleSimilarity = stringSimilarity(normalizeString(source.title), normalizeString(target.title))

  const artistSimilarity = stringSimilarity(normalizeString(source.artist), normalizeString(target.artist))

  // Duration similarity (if available)
  let durationSimilarity = 1.0
  if (source.durationMs && target.durationMs) {
    const durationDiff = Math.abs(source.durationMs - target.durationMs)
    durationSimilarity = Math.max(0, 1 - durationDiff / 30000) // 30 second max difference
  }

  // Weighted average
  return titleSimilarity * 0.5 + artistSimilarity * 0.4 + durationSimilarity * 0.1
}

function stringSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance-based similarity
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

async function performAIMatch(
  sourceTrack: Track,
  targetTracks: Track[],
): Promise<{ track: Track; confidence: number } | null> {
  try {
    const prompt = `
You are a music matching expert. Given a source track and a list of potential matches, identify the best match.

Source Track:
- Title: "${sourceTrack.title}"
- Artist: "${sourceTrack.artist}"
- Album: "${sourceTrack.album || "Unknown"}"

Potential Matches:
${targetTracks
  .map(
    (track, index) => `
${index + 1}. Title: "${track.title}", Artist: "${track.artist}", Album: "${track.album || "Unknown"}"
`,
  )
  .join("")}

Respond with only the number of the best match (1-${targetTracks.length}) and a confidence score (0.0-1.0), separated by a comma.
If no good match exists, respond with "0,0.0".

Example: "2,0.87"
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 50,
    })

    const [matchIndex, confidence] = text
      .trim()
      .split(",")
      .map((s) => Number.parseFloat(s.trim()))

    if (matchIndex > 0 && matchIndex <= targetTracks.length && confidence > 0.7) {
      return {
        track: targetTracks[matchIndex - 1],
        confidence,
      }
    }
  } catch (error) {
    console.error("AI matching error:", error)
  }

  return null
}

import { matchTracks } from "@/lib/matcher"

describe("Track Matcher", () => {
  const sourceTrack = {
    id: "source1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    albumId: "album123",
    isrcCode: "GBUM71505078",
    durationMs: 355000,
  }

  const targetTracks = [
    {
      id: "target1",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      albumId: "album123",
      isrcCode: "GBUM71505078",
      durationMs: 355000,
    },
    {
      id: "target2",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "Greatest Hits",
      albumId: "album456",
      isrcCode: "GBUM71505078",
      durationMs: 354000,
    },
  ]

  test("should match by ISRC and album ID", async () => {
    const result = await matchTracks(sourceTrack, targetTracks)

    expect(result.type).toBe("isrc_album")
    expect(result.track?.id).toBe("target1")
    expect(result.confidence).toBe(1.0)
  })

  test("should match exactly when ISRC+album fails", async () => {
    const sourceWithoutISRC = { ...sourceTrack, isrcCode: undefined }
    const result = await matchTracks(sourceWithoutISRC, targetTracks)

    expect(result.type).toBe("exact")
    expect(result.track?.id).toBe("target1")
    expect(result.confidence).toBe(0.95)
  })

  test("should perform fuzzy matching", async () => {
    const fuzzySource = {
      ...sourceTrack,
      title: "Bohemian Rhapsodie", // Slight misspelling
      isrcCode: undefined,
    }

    const result = await matchTracks(fuzzySource, targetTracks)

    expect(result.type).toBe("fuzzy")
    expect(result.confidence).toBeGreaterThan(0.85)
  })

  test("should return no match for completely different tracks", async () => {
    const differentTrack = {
      id: "different",
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      durationMs: 482000,
    }

    const result = await matchTracks(differentTrack, targetTracks)

    expect(result.type).toBe("no_match")
  })
})

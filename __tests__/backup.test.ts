import { exportBackupToJSON, exportBackupToCSV } from "@/lib/backup"

describe("Backup System", () => {
  const mockBackupData = {
    userId: "user123",
    timestamp: "2024-01-15T10:30:00Z",
    services: [
      {
        service: "spotify",
        playlists: [
          {
            id: "playlist1",
            name: "My Favorites",
            description: "My favorite tracks",
            tracks: [
              {
                id: "track1",
                title: "Bohemian Rhapsody",
                artist: "Queen",
                album: "A Night at the Opera",
                isrcCode: "GBUM71505078",
                durationMs: 355000,
                addedAt: "2024-01-01T00:00:00Z",
                position: 1,
              },
            ],
            createdAt: "2024-01-01T00:00:00Z",
            lastModified: "2024-01-15T00:00:00Z",
          },
        ],
        totalTracks: 1,
      },
    ],
  }

  test("should export backup to JSON format", async () => {
    const jsonExport = await exportBackupToJSON(mockBackupData)
    const parsed = JSON.parse(jsonExport)

    expect(parsed.userId).toBe("user123")
    expect(parsed.services).toHaveLength(1)
    expect(parsed.services[0].playlists[0].tracks).toHaveLength(1)
  })

  test("should export backup to CSV format", async () => {
    const csvExport = await exportBackupToCSV(mockBackupData)
    const lines = csvExport.split("\n")

    expect(lines[0]).toContain("Service,Playlist,Track Title")
    expect(lines[1]).toContain("spotify,My Favorites,Bohemian Rhapsody")
  })

  test("should handle CSV escaping correctly", async () => {
    const dataWithCommas = {
      ...mockBackupData,
      services: [
        {
          ...mockBackupData.services[0],
          playlists: [
            {
              ...mockBackupData.services[0].playlists[0],
              tracks: [
                {
                  ...mockBackupData.services[0].playlists[0].tracks[0],
                  title: "Track, with commas",
                  artist: 'Artist "with quotes"',
                },
              ],
            },
          ],
        },
      ],
    }

    const csvExport = await exportBackupToCSV(dataWithCommas)
    expect(csvExport).toContain('"Track, with commas"')
    expect(csvExport).toContain('"Artist ""with quotes"""')
  })
})

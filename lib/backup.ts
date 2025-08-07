interface BackupData {
  userId: string
  timestamp: string
  services: ServiceBackup[]
}

interface ServiceBackup {
  service: string
  playlists: PlaylistBackup[]
  totalTracks: number
}

interface PlaylistBackup {
  id: string
  name: string
  description?: string
  tracks: TrackBackup[]
  createdAt: string
  lastModified: string
}

interface TrackBackup {
  id: string
  title: string
  artist: string
  album?: string
  isrcCode?: string
  durationMs?: number
  addedAt: string
  position: number
}

export async function backupLibrary(userId: string, services: string[]): Promise<BackupData> {
  const backup: BackupData = {
    userId,
    timestamp: new Date().toISOString(),
    services: [],
  }

  for (const service of services) {
    try {
      const serviceBackup = await backupService(userId, service)
      backup.services.push(serviceBackup)
    } catch (error) {
      console.error(`Failed to backup ${service}:`, error)
      // Continue with other services
    }
  }

  return backup
}

async function backupService(userId: string, service: string): Promise<ServiceBackup> {
  const playlists = await fetchUserPlaylists(userId, service)
  const playlistBackups: PlaylistBackup[] = []
  let totalTracks = 0

  for (const playlist of playlists) {
    try {
      const tracks = await fetchPlaylistTracks(userId, service, playlist.id)

      const playlistBackup: PlaylistBackup = {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        tracks: tracks.map((track, index) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          isrcCode: track.isrcCode,
          durationMs: track.durationMs,
          addedAt: track.addedAt || new Date().toISOString(),
          position: index + 1,
        })),
        createdAt: playlist.createdAt || new Date().toISOString(),
        lastModified: playlist.lastModified || new Date().toISOString(),
      }

      playlistBackups.push(playlistBackup)
      totalTracks += tracks.length
    } catch (error) {
      console.error(`Failed to backup playlist ${playlist.name}:`, error)
    }
  }

  return {
    service,
    playlists: playlistBackups,
    totalTracks,
  }
}

export async function exportBackupToJSON(backup: BackupData): Promise<string> {
  return JSON.stringify(backup, null, 2)
}

export async function exportBackupToCSV(backup: BackupData): Promise<string> {
  const rows: string[] = []

  // CSV Header
  rows.push("Service,Playlist,Track Title,Artist,Album,ISRC,Duration (ms),Added At,Position")

  // Data rows
  for (const service of backup.services) {
    for (const playlist of service.playlists) {
      for (const track of playlist.tracks) {
        rows.push(
          [
            service.service,
            playlist.name,
            escapeCSV(track.title),
            escapeCSV(track.artist),
            escapeCSV(track.album || ""),
            track.isrcCode || "",
            track.durationMs?.toString() || "",
            track.addedAt,
            track.position.toString(),
          ].join(","),
        )
      }
    }
  }

  return rows.join("\n")
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function uploadToCloudStorage(fileContent: string, fileName: string, storageConfig: any): Promise<string> {
  switch (storageConfig.provider) {
    case "google-drive":
      return await uploadToGoogleDrive(fileContent, fileName, storageConfig)

    case "dropbox":
      return await uploadToDropbox(fileContent, fileName, storageConfig)

    case "s3":
      return await uploadToS3(fileContent, fileName, storageConfig)

    default:
      throw new Error(`Unsupported storage provider: ${storageConfig.provider}`)
  }
}

async function uploadToGoogleDrive(fileContent: string, fileName: string, config: any): Promise<string> {
  // Google Drive API implementation
  // This would use the Google Drive API to upload the file
  console.log("Uploading to Google Drive:", fileName)
  return `https://drive.google.com/file/d/example-file-id`
}

async function uploadToDropbox(fileContent: string, fileName: string, config: any): Promise<string> {
  // Dropbox API implementation
  console.log("Uploading to Dropbox:", fileName)
  return `https://dropbox.com/s/example-file-id/${fileName}`
}

async function uploadToS3(fileContent: string, fileName: string, config: any): Promise<string> {
  // AWS S3 implementation
  console.log("Uploading to S3:", fileName)
  return `https://s3.amazonaws.com/bucket/${fileName}`
}

// Mock functions - these would be implemented with actual API calls
async function fetchUserPlaylists(userId: string, service: string) {
  // Implementation would fetch playlists from the specific service API
  return [
    { id: "1", name: "My Favorites", description: "My favorite tracks" },
    { id: "2", name: "Workout Mix", description: "High energy tracks" },
  ]
}

async function fetchPlaylistTracks(userId: string, service: string, playlistId: string) {
  // Implementation would fetch tracks from the specific service API
  return [
    {
      id: "track1",
      title: "Example Song",
      artist: "Example Artist",
      album: "Example Album",
      isrcCode: "USRC17607839",
      durationMs: 210000,
      addedAt: "2024-01-01T00:00:00Z",
    },
  ]
}

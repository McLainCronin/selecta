"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, AirplayIcon as Spotify, Apple, Download, FolderSyncIcon as Sync, Settings, Plus } from "lucide-react"
import { ConnectServiceDialog } from "@/components/connect-service-dialog"
import { SyncPlaylistDialog } from "@/components/sync-playlist-dialog"
import { BackupDialog } from "@/components/backup-dialog"

interface Service {
  id: string
  name: string
  icon: React.ComponentType<any>
  connected: boolean
  playlists: number
}

interface SyncJob {
  id: string
  sourceName: string
  targetName: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  totalTracks: number
}

interface BackupJob {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  services: string[]
  createdAt: string
  downloadUrl?: string
}

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([
    { id: "spotify", name: "Spotify", icon: Spotify, connected: true, playlists: 12 },
    { id: "apple", name: "Apple Music", icon: Apple, connected: false, playlists: 0 },
  ])

  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([
    {
      id: "1",
      sourceName: "My Favorites",
      targetName: "My Favorites (Apple)",
      status: "running",
      progress: 65,
      totalTracks: 150,
    },
    {
      id: "2",
      sourceName: "Workout Mix",
      targetName: "Workout Mix (Apple)",
      status: "completed",
      progress: 100,
      totalTracks: 45,
    },
  ])

  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([
    {
      id: "1",
      status: "completed",
      services: ["spotify"],
      createdAt: "2024-01-15T10:30:00Z",
      downloadUrl: "/api/backup/1/download",
    },
  ])

  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [backupDialogOpen, setBackupDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "running":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "running":
        return "Running"
      case "failed":
        return "Failed"
      default:
        return "Pending"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold">Selecta Dashboard</h1>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Connected Services */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Connected Services</h2>
            <Button onClick={() => setConnectDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Service
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <service.icon className="h-8 w-8 mr-3" />
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>
                      {service.connected ? `${service.playlists} playlists` : "Not connected"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={service.connected ? "default" : "secondary"}>
                    {service.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sync" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sync">Playlist Sync</TabsTrigger>
            <TabsTrigger value="backup">Library Backup</TabsTrigger>
            <TabsTrigger value="matches">AI Matches</TabsTrigger>
          </TabsList>

          {/* Sync Tab */}
          <TabsContent value="sync" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Sync Jobs</h3>
              <Button onClick={() => setSyncDialogOpen(true)}>
                <Sync className="h-4 w-4 mr-2" />
                New Sync
              </Button>
            </div>

            <div className="space-y-4">
              {syncJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {job.sourceName} → {job.targetName}
                      </CardTitle>
                      <Badge className={getStatusColor(job.status)}>{getStatusText(job.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>
                          {Math.round((job.progress / 100) * job.totalTracks)} / {job.totalTracks} tracks
                        </span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Library Backups</h3>
              <Button onClick={() => setBackupDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>

            <div className="space-y-4">
              {backupJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Full Library Backup</CardTitle>
                      <Badge className={getStatusColor(job.status)}>{getStatusText(job.status)}</Badge>
                    </div>
                    <CardDescription>
                      Services: {job.services.join(", ")} • {new Date(job.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  {job.downloadUrl && (
                    <CardContent>
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.downloadUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <h3 className="text-xl font-semibold">Pending AI Matches</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending matches to review</p>
                  <p className="text-sm">AI matches will appear here for your approval</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ConnectServiceDialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen} />
      <SyncPlaylistDialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen} />
      <BackupDialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen} />
    </div>
  )
}

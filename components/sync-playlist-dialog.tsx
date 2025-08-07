"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SyncPlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncPlaylistDialog({ open, onOpenChange }: SyncPlaylistDialogProps) {
  const [sourcePlaylist, setSourcePlaylist] = useState("")
  const [targetService, setTargetService] = useState("")
  const [syncDirection, setSyncDirection] = useState("bidirectional")
  const [creating, setCreating] = useState(false)

  const handleCreateSync = async () => {
    setCreating(true)

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePlaylist,
          targetService,
          direction: syncDirection,
        }),
      })

      if (response.ok) {
        onOpenChange(false)
        // Refresh the dashboard
        window.location.reload()
      }
    } catch (error) {
      console.error("Sync creation failed:", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Playlist Sync</DialogTitle>
          <DialogDescription>Set up bi-directional syncing between your playlists</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="source">Source Playlist</Label>
            <Select value={sourcePlaylist} onValueChange={setSourcePlaylist}>
              <SelectTrigger>
                <SelectValue placeholder="Select source playlist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spotify-favorites">My Favorites (Spotify)</SelectItem>
                <SelectItem value="spotify-workout">Workout Mix (Spotify)</SelectItem>
                <SelectItem value="spotify-chill">Chill Vibes (Spotify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Service</Label>
            <Select value={targetService} onValueChange={setTargetService}>
              <SelectTrigger>
                <SelectValue placeholder="Select target service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple Music</SelectItem>
                <SelectItem value="youtube">YouTube Music</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Sync Direction</Label>
            <RadioGroup value={syncDirection} onValueChange={setSyncDirection}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bidirectional" id="bidirectional" />
                <Label htmlFor="bidirectional">Bi-directional (recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="source_to_target" id="source_to_target" />
                <Label htmlFor="source_to_target">Source to target only</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSync} disabled={!sourcePlaylist || !targetService || creating}>
            {creating ? "Creating..." : "Create Sync"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

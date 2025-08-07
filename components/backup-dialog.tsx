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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BackupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BackupDialog({ open, onOpenChange }: BackupDialogProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(["spotify"])
  const [format, setFormat] = useState("json")
  const [cloudStorage, setCloudStorage] = useState("none")
  const [creating, setCreating] = useState(false)

  const handleServiceToggle = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service])
    } else {
      setSelectedServices(selectedServices.filter((s) => s !== service))
    }
  }

  const handleCreateBackup = async () => {
    setCreating(true)

    try {
      const response = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: selectedServices,
          format,
          cloudStorage: cloudStorage || null,
        }),
      })

      if (response.ok) {
        onOpenChange(false)
        // Refresh the dashboard
        window.location.reload()
      }
    } catch (error) {
      console.error("Backup creation failed:", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Library Backup</DialogTitle>
          <DialogDescription>Export your music library data for safekeeping</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Services to Backup</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spotify"
                  checked={selectedServices.includes("spotify")}
                  onCheckedChange={(checked) => handleServiceToggle("spotify", checked as boolean)}
                />
                <Label htmlFor="spotify">Spotify</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="apple"
                  checked={selectedServices.includes("apple")}
                  onCheckedChange={(checked) => handleServiceToggle("apple", checked as boolean)}
                />
                <Label htmlFor="apple">Apple Music</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (recommended)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cloud">Cloud Storage (Optional)</Label>
            <Select value={cloudStorage} onValueChange={setCloudStorage}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="google-drive">Google Drive</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
                <SelectItem value="s3">Amazon S3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateBackup} disabled={selectedServices.length === 0 || creating}>
            {creating ? "Creating..." : "Create Backup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

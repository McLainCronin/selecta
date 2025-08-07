"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AirplayIcon as Spotify, Apple } from "lucide-react"

interface ConnectServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectServiceDialog({ open, onOpenChange }: ConnectServiceDialogProps) {
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (service: string) => {
    setConnecting(service)

    try {
      // Redirect to OAuth flow
      window.location.href = `/api/auth/${service}`
    } catch (error) {
      console.error("Connection failed:", error)
      setConnecting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Music Service</DialogTitle>
          <DialogDescription>Connect your streaming accounts to start syncing playlists</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            className="w-full justify-start h-12 bg-transparent"
            variant="outline"
            onClick={() => handleConnect("spotify")}
            disabled={connecting === "spotify"}
          >
            <Spotify className="h-6 w-6 mr-3 text-green-500" />
            {connecting === "spotify" ? "Connecting..." : "Connect Spotify"}
          </Button>

          <Button
            className="w-full justify-start h-12 bg-transparent"
            variant="outline"
            onClick={() => handleConnect("apple")}
            disabled={connecting === "apple"}
          >
            <Apple className="h-6 w-6 mr-3" />
            {connecting === "apple" ? "Connecting..." : "Connect Apple Music"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  document: {
    documentName: string
    filePath: string
    fileType: string
  } | null
}

export function DocumentViewer({ isOpen, onClose, document }: DocumentViewerProps) {
  const [error, setError] = useState<string | null>(null)

  if (!document) return null

  const isImage = document.fileType.startsWith("image/")
  const isPdf = document.fileType === "application/pdf"
  const isText = document.fileType.startsWith("text/")
  const isVideo = document.fileType.startsWith("video/")
  const isAudio = document.fileType.startsWith("audio/")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{document.documentName}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-auto min-h-[300px] bg-muted/30 rounded-md p-2">
          {isImage && (
            <div className="flex items-center justify-center h-full">
              <img
                src={document.filePath || "/placeholder.svg"}
                alt={document.documentName}
                className="max-w-full max-h-[70vh] object-contain"
                onError={() => setError("Failed to load image")}
              />
            </div>
          )}

          {isPdf && (
            <iframe
              src={`${document.filePath}#toolbar=0`}
              className="w-full h-[70vh]"
              title={document.documentName}
              onError={() => setError("Failed to load PDF")}
            />
          )}

          {isText && (
            <iframe
              src={document.filePath}
              className="w-full h-[70vh]"
              title={document.documentName}
              onError={() => setError("Failed to load text file")}
            />
          )}

          {isVideo && (
            <div className="flex items-center justify-center h-full">
              <video
                src={document.filePath}
                controls
                className="max-w-full max-h-[70vh]"
                onError={() => setError("Failed to load video")}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {isAudio && (
            <div className="flex items-center justify-center h-full">
              <audio
                src={document.filePath}
                controls
                className="w-full"
                onError={() => setError("Failed to load audio")}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}

          {!isImage && !isPdf && !isText && !isVideo && !isAudio && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
              <Button asChild>
                <a href={document.filePath} target="_blank" rel="noopener noreferrer">
                  Open File
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button asChild variant="outline">
            <a href={document.filePath} download={document.documentName} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


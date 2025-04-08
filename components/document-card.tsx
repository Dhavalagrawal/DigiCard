"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Download, FileText } from "lucide-react"
import Link from "next/link"

interface DocumentCardProps {
  id: string
  name: string
  type: string
  number: string
  uploadDate: string
  filePath: string
}

export function DocumentCard({ id, name, type, number, uploadDate, filePath }: DocumentCardProps) {
  const [showNumber, setShowNumber] = useState(false)

  // Only show first and last 2 digits when hidden
  const maskedNumber = number.replace(/(\d{2})(.*)(\d{2})/, "$1•••••$3")

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "Aadhar":
        return "🆔"
      case "PAN":
        return "💳"
      case "Driving License":
        return "🚗"
      case "Voter ID":
        return "🗳️"
      case "Passport":
        return "🛂"
      case "Certificate":
        return "📜"
      case "Invoice":
        return "📋"
      case "Receipt":
        return "🧾"
      default:
        return "📄"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getDocumentIcon(type)}</span>
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-xs text-muted-foreground">{type}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
              onClick={() => setShowNumber(!showNumber)}
              title={showNumber ? "Hide number" : "Show number"}
            >
              {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Document Number</p>
              <p className="font-medium">{showNumber ? number : maskedNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Uploaded</p>
              <p className="text-xs">{uploadDate}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/documents?view=${id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <a href={filePath} download target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


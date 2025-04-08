"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardNav } from "@/components/dashboard-nav"
import { FileUp, FileText, Trash2, Download, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentViewer } from "@/components/document-viewer"
import { uploadDocument, getDocuments, deleteDocument } from "@/app/actions/document-actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Define document type
interface Document {
  id: string
  documentName: string
  documentType: string
  filePath: string
  fileType: string
  fileSize: number
  uploadDate: string
  isVerified: boolean
}

export default function DocumentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { status } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [viewDocument, setViewDocument] = useState<Document | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Fetch documents
    const fetchDocuments = async () => {
      try {
        setIsLoading(true)
        const result = await getDocuments()

        if (result.success) {
          setDocuments(result.documents)
        } else {
          setError(result.message || "Failed to load documents")
        }
      } catch (error) {
        setError("Failed to load documents. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchDocuments()
    }
  }, [status, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDocument((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setNewDocument((prev) => ({ ...prev, type: value }))
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !newDocument.name || !newDocument.type) {
      setError("Please fill all required fields")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentName", newDocument.name)
      formData.append("documentType", newDocument.type)

      // Upload document
      const result = await uploadDocument(formData)

      if (result.success) {
        // Add the new document to the list
        if (result.document) {
          setDocuments((prev) => [result.document as Document, ...prev])
        }

        // Reset form
        setNewDocument({ name: "", type: "" })
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        toast({
          title: "Document uploaded",
          description: "Your document has been uploaded successfully",
        })
      } else {
        setError(result.message || "Failed to upload document")
      }
    } catch (error) {
      setError("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteDocument(id)

      if (result.success) {
        // Remove the document from the list
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))

        toast({
          title: "Document deleted",
          description: "Your document has been deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete document",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️"
    if (fileType === "application/pdf") return "📄"
    if (fileType.startsWith("video/")) return "🎬"
    if (fileType.startsWith("audio/")) return "🎵"
    if (fileType.startsWith("text/")) return "📝"
    return "📎"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="h-8 w-32">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <div className="w-64 border-r bg-muted/20 hidden md:block">
            <Skeleton className="h-full w-full" />
          </div>

          <main className="flex-1 p-4 md:p-6">
            <div className="container mx-auto max-w-6xl">
              <Skeleton className="h-10 w-64 mb-6" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Skeleton className="h-[500px] w-full" />
                </div>
                <div>
                  <Skeleton className="h-[500px] w-full" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            DigiCard
          </Link>
          <MobileNav />
        </div>
      </header>

      <div className="flex flex-1">
        <DashboardNav />

        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Document Management</h1>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>Manage all your identification documents in one place</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No documents yet</h3>
                        <p className="text-muted-foreground">Upload your first document to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded text-xl">{getFileIcon(doc.fileType)}</div>
                              <div>
                                <p className="font-medium">{doc.documentName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.documentType} • {formatFileSize(doc.fileSize)} • Uploaded on {doc.uploadDate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Document"
                                onClick={() => setViewDocument(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Download Document" asChild>
                                <a href={doc.filePath} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(doc.id)}
                                title="Delete Document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upload New Document</CardTitle>
                    <CardDescription>Add a new identification document to your digital card</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Document Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., My Aadhar Card"
                          value={newDocument.name}
                          onChange={handleInputChange}
                          required
                          disabled={isUploading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Document Type</Label>
                        <Select value={newDocument.type} onValueChange={handleTypeChange} disabled={isUploading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aadhar">Aadhar Card</SelectItem>
                            <SelectItem value="PAN">PAN Card</SelectItem>
                            <SelectItem value="Driving License">Driving License</SelectItem>
                            <SelectItem value="Voter ID">Voter ID</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="Invoice">Invoice</SelectItem>
                            <SelectItem value="Receipt">Receipt</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="file">Upload File</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop your file here, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Supported formats: PDF, Images, Videos, Audio, Text (Max 10MB)
                          </p>
                          <Input
                            id="file"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={isUploading}
                            required
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            Browse Files
                          </Button>
                          {file && (
                            <div className="mt-2 text-sm font-medium">
                              <p>Selected: {file.name}</p>
                              <p className="text-muted-foreground">
                                {file.type || "Unknown type"} • {formatFileSize(file.size)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isUploading || !file || !newDocument.name || !newDocument.type}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Document"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Document Viewer */}
      <DocumentViewer isOpen={!!viewDocument} onClose={() => setViewDocument(null)} document={viewDocument} />
    </div>
  )
}


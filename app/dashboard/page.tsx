"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { DigitalCard } from "@/components/digital-card"
import { MobileNav } from "@/components/mobile-nav"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { LogOut, User, FileText, Upload, Plus } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getDocuments } from "@/app/actions/document-actions"
import { DocumentCard } from "@/components/document-card"

interface Document {
  id: string
  documentName: string
  documentType: string
  filePath: string
  fileType: string
  uploadDate: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Fetch documents
    const fetchData = async () => {
      try {
        const result = await getDocuments()

        if (result.success) {
          setDocuments(result.documents)
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to load documents",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, router, toast])

  // Generate a document number based on the card number and document id
  const generateDocumentNumber = (cardNumber: string, docId: string) => {
    // Extract the numeric part from the card number
    const baseNumber = cardNumber.split("/")[1] || "00000"
    // Use the first 5 characters of the document id
    const docPart = docId.substring(0, 5)
    // Combine them
    return `DOC-${baseNumber}-${docPart}`
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
              <Skeleton className="h-10 w-40 mb-6" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="grid gap-6">
                    <Skeleton className="h-[150px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-[400px] w-full" />
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
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            <MobileNav />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <DashboardNav />

        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.name}</h2>
                      <p className="text-muted-foreground mb-4">
                        Your digital card is ready. You can view and manage your documents from the dashboard.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/documents" className="w-full sm:w-auto">
                          <Button className="w-full gap-2">
                            <FileText className="h-4 w-4" />
                            Manage Documents
                          </Button>
                        </Link>
                        <Link href="/documents" className="w-full sm:w-auto">
                          <Button variant="outline" className="w-full gap-2">
                            <Upload className="h-4 w-4" />
                            Upload New Document
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Your Documents</h2>
                      <Link href="/documents">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Plus className="h-4 w-4" />
                          Add New
                        </Button>
                      </Link>
                    </div>

                    {documents.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg bg-muted/10">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No documents uploaded yet</p>
                        <Link href="/documents" className="mt-4 inline-block">
                          <Button className="mt-4">Upload Your First Document</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.slice(0, 4).map((doc) => (
                          <DocumentCard
                            key={doc.id}
                            id={doc.id}
                            name={doc.documentName}
                            type={doc.documentType}
                            number={generateDocumentNumber(session?.user?.cardNumber || "", doc.id)}
                            uploadDate={doc.uploadDate}
                            filePath={doc.filePath}
                          />
                        ))}

                        {documents.length > 4 && (
                          <Link
                            href="/documents"
                            className="flex items-center justify-center border rounded-lg p-6 hover:bg-muted/10 transition-colors"
                          >
                            <div className="text-center">
                              <p className="font-medium mb-2">View All Documents</p>
                              <p className="text-sm text-muted-foreground">
                                {documents.length - 4} more document{documents.length - 4 > 1 ? "s" : ""}
                              </p>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Your Digital Card</h2>
                  <DigitalCard
                    name={session?.user?.name || ""}
                    cardNumber={session?.user?.cardNumber || ""}
                    documentCount={documents.length}
                    validUntil="09/2025"
                    className="transform transition-all hover:scale-105"
                  />

                  <div className="mt-6 bg-muted/20 rounded-lg p-4 border">
                    <h3 className="font-medium mb-2">Digital Identity Card</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your unified ID number gives you access to all your documents
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Card Number</p>
                        <p className="font-medium">{session?.user?.cardNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p className="font-medium">{documents.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


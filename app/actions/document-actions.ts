"use server"

import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import dbConnect from "@/lib/mongodb"
import Document from "@/lib/models/document"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), "public", "uploads")
  try {
    await mkdir(uploadDir, { recursive: true })
    return uploadDir
  } catch (error) {
    console.error("Error creating upload directory:", error)
    throw new Error("Failed to create upload directory")
  }
}

export async function uploadDocument(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" }
    }

    const file = formData.get("file") as File
    const documentName = formData.get("documentName") as string
    const documentType = formData.get("documentType") as string

    if (!file || !documentName || !documentType) {
      return { success: false, message: "Missing required fields" }
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: "File size exceeds 10MB limit" }
    }

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir()

    // Create file path
    const filePath = join("uploads", fileName)
    const fullPath = join(uploadDir, fileName)

    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to disk
    await writeFile(fullPath, buffer)

    // Connect to database
    await dbConnect()

    // Save document metadata to database
    const document = await Document.create({
      userId: session.user.id,
      documentName,
      documentType,
      filePath: `/${filePath}`,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date(),
      isVerified: true, // All documents are automatically verified
      isEncrypted: false, // No encryption for simplicity
    })

    // Revalidate documents page
    revalidatePath("/documents")

    return {
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: document._id.toString(),
        documentName: document.documentName,
        documentType: document.documentType,
        filePath: document.filePath,
        fileType: document.fileType,
        uploadDate: document.uploadDate,
      },
    }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, message: "Failed to upload document" }
  }
}

export async function getDocuments() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", documents: [] }
    }

    await dbConnect()

    const documents = await Document.find({ userId: session.user.id }).sort({ uploadDate: -1 }).lean()

    return {
      success: true,
      documents: documents.map((doc) => ({
        id: doc._id.toString(),
        documentName: doc.documentName,
        documentType: doc.documentType,
        filePath: doc.filePath,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadDate: new Date(doc.uploadDate).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        isVerified: doc.isVerified,
      })),
    }
  } catch (error) {
    console.error("Error fetching documents:", error)
    return { success: false, message: "Failed to fetch documents", documents: [] }
  }
}

export async function deleteDocument(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" }
    }

    await dbConnect()

    // Find and delete the document
    const document = await Document.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!document) {
      return { success: false, message: "Document not found" }
    }

    // Note: For simplicity, we're not deleting the actual file from the filesystem
    // In a production app, you would also delete the file from storage

    // Revalidate documents page
    revalidatePath("/documents")

    return { success: true, message: "Document deleted successfully" }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, message: "Failed to delete document" }
  }
}


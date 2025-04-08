import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Document from "@/lib/models/document"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    await dbConnect()

    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get documents for the user
    const documents = await Document.find({ userId: user.id }).sort({ uploadDate: -1 }).lean()

    return NextResponse.json({
      success: true,
      documents: documents.map((doc) => ({
        ...doc,
        id: doc._id,
      })),
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ success: false, message: "Error fetching documents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()

    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { documentName, documentType, filePath, fileType, fileSize } = body

    // Validate input
    if (!documentName || !documentType || !filePath || !fileType || !fileSize) {
      return NextResponse.json({ success: false, message: "Please provide all required fields" }, { status: 400 })
    }

    // Create new document
    const document = await Document.create({
      userId: user.id,
      documentName,
      documentType,
      filePath,
      fileType,
      fileSize,
      uploadDate: new Date(),
      isVerified: false,
      isEncrypted: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        document: {
          id: document._id,
          documentName: document.documentName,
          documentType: document.documentType,
          uploadDate: document.uploadDate,
          isVerified: document.isVerified,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ success: false, message: "Error uploading document" }, { status: 500 })
  }
}


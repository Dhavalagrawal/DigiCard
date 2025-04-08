import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Document from "@/lib/models/document"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const id = params.id

    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get document
    const document = await Document.findOne({
      _id: id,
      userId: user.id,
    }).lean()

    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        id: document._id,
      },
    })
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ success: false, message: "Error fetching document" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const id = params.id

    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Delete document
    const document = await Document.findOneAndDelete({
      _id: id,
      userId: user.id,
    })

    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ success: false, message: "Error deleting document" }, { status: 500 })
  }
}


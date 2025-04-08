import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/user"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "aBRzh2fvZdY3JfHVZ0Ugh0PVaE2WvOuRLQM4oOeKL+g="

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Please provide email and password" }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Create token
    const token = sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        cardNumber: user.cardNumber,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    )

    // Set cookie
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cardNumber: user.cardNumber,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Error logging in" }, { status: 500 })
  }
}


"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/user"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// Define the user data type (consistent with your previous definitions)
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cardNumber: string;
  password?: string; // Optional, only for database storage
}

export async function getUserProfile() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" } as const
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select("-password")

    if (!user) {
      return { success: false, message: "User not found" } as const
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        cardNumber: user.cardNumber,
      },
    } as const
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, message: "Failed to fetch user profile" } as const
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" } as const
    }

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string

    if (!name) {
      return { success: false, message: "Name is required" } as const
    }

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return { success: false, message: "User not found" } as const
    }

    user.name = name
    user.phone = phone

    await user.save()

    revalidatePath("/profile")

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        cardNumber: user.cardNumber,
      },
    } as const
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, message: "Failed to update profile" } as const
  }
}

export async function changePassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" } as const
    }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, message: "All fields are required" } as const
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "New passwords do not match" } as const
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return { success: false, message: "Password must be at least 8 characters long" } as const
    }

    // Check if password has at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/
    if (!passwordRegex.test(newPassword)) {
      return { success: false, message: "Password must contain at least one letter and one number" } as const
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select("+password")

    if (!user) {
      return { success: false, message: "User not found" } as const
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return { success: false, message: "Current password is incorrect" } as const
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    await user.save()

    return { success: true, message: "Password changed successfully" } as const
  } catch (error) {
    console.error("Error changing password:", error)
    return { success: false, message: "Failed to change password" } as const
  }
}
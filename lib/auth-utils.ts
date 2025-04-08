import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

export async function getUserFromToken(request: Request) {
  // Get token from cookies
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    // Try to get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const headerToken = authHeader.substring(7)
      return verifyToken(headerToken)
    }
    return null
  }

  return verifyToken(token)
}

function verifyToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET)
    return decoded as { id: string; email: string; name: string; cardNumber: string }
  } catch (error) {
    return null
  }
}


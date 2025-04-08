import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      cardNumber: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    cardNumber: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    cardNumber: string
  }
}


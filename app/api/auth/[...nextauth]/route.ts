import NextAuth, { AuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user"; 
import bcrypt from "bcryptjs";

// Define a type for the user data
interface UserData {
  id: string;
  name: string;
  email: string;
  cardNumber: string;
  password?: string; // Optional, only for database storage
}

// Extend the default JWT and Session interfaces
declare module "next-auth" {
  interface Session {
    user: UserData;
  }

  interface JWT {
    id: string;
    cardNumber: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined, req: any) {
        // Check if credentials exist and extract email and password
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          return null;
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
          return null;
        }

        // Return user data matching UserData interface (exclude password)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          cardNumber: user.cardNumber,
        } as UserData;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: UserData | any }) {
      if (user) {
        token.id = user.id;
        token.cardNumber = user.cardNumber;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.cardNumber = token.cardNumber;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
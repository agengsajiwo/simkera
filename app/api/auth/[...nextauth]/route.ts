import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: "unu-jogja.ac.id",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email || ""
      if (!email.endsWith("@unu-jogja.ac.id")) {
        return false
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Persist user id and role into JWT on first sign-in
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

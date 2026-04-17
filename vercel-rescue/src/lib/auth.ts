import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import AzureAD from "next-auth/providers/azure-ad"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "super-secret-uts-portal-key-2026",
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Consultar en PostgreSQL (tabla User)
          const userData = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!userData) {
            console.warn("Usuario no encontrado en la DB:", credentials.email);
            return null;
          }

          const userId = userData.id;

          if (!userData.password) {
            return null
          }

          const isMatch = await bcrypt.compare(credentials.password as string, userData.password)

          if (!isMatch) {
            return null
          }

          return { 
            id: userId, 
            email: userData.email, 
            name: userData.name, 
            role: userData.role 
          }
        } catch (error) {
          console.error("Error en authorize (Firebase):", error);
          return null;
        }
      }
    }),
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
      ? [
          AzureAD({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
          })
        ]
      : [])
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
  }
})

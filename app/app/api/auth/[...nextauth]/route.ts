import NextAuth from 'next-auth'
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl })
      
      // Don't redirect manifest or static files
      if (url.includes('site.webmanifest') || url.includes('favicon')) {
        return url
      }
      
      // If it's a signin URL with callbackUrl, extract and use the callback
      if (url.includes('/auth/signin?callbackUrl=')) {
        const urlObj = new URL(url)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        if (callbackUrl) {
          const decodedCallback = decodeURIComponent(callbackUrl)
          console.log('Extracted callbackUrl:', decodedCallback)
          return decodedCallback
        }
      }
      
      // If it's already a valid internal URL, use it
      if (url.startsWith(baseUrl) && !url.includes('/auth/signin')) {
        return url
      }
      
      // If it's a relative URL (like /ai-home), make it absolute
      if (url.startsWith('/') && !url.startsWith('/auth/signin')) {
        return `${baseUrl}${url}`
      }
      
      // Default fallback
      return `${baseUrl}/dashboard`
    }
  }
})

export { handler as GET, handler as POST }

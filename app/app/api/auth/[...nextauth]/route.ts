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
      // Handle different redirect scenarios
      console.log('NextAuth redirect:', { url, baseUrl })
      
      // If redirecting from signin page after successful login
      if (url === `${baseUrl}/auth/signin`) {
        return `${baseUrl}/dashboard`
      }
      
      // If URL contains a callbackUrl, decode and use it
      if (url.includes('callbackUrl=')) {
        const urlObj = new URL(url)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        if (callbackUrl) {
          const decodedCallback = decodeURIComponent(callbackUrl)
          // Make sure it's a valid internal URL
          if (decodedCallback.startsWith(baseUrl) || decodedCallback.startsWith('/')) {
            return decodedCallback.startsWith('/') ? `${baseUrl}${decodedCallback}` : decodedCallback
          }
        }
      }
      
      // If URL starts with baseUrl, use it
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Default fallback to dashboard
      return `${baseUrl}/dashboard`
    }
  }
})

export { handler as GET, handler as POST }

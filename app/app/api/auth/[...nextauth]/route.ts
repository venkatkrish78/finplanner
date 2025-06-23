import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

console.log('🔐 NextAuth route handler loaded')
console.log('🔐 DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('🔐 NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
console.log('🔐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

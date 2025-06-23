import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

console.log('🔐 NextAuth route handler loaded')
console.log('🔐 DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('🔐 NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
console.log('🔐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

const handler = NextAuth(authOptions)

export async function GET(request: Request) {
  console.log('🔐 NextAuth GET request:', request.url)
  try {
    return await handler(request)
  } catch (error) {
    console.error('🔐 NextAuth GET error:', error)
    throw error
  }
}

export async function POST(request: Request) {
  console.log('🔐 NextAuth POST request:', request.url)
  try {
    return await handler(request)
  } catch (error) {
    console.error('🔐 NextAuth POST error:', error)
    throw error
  }
}

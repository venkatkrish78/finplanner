const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking all users in database...')
  
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })
  
  console.log('📊 Total users:', allUsers.length)
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Created: ${user.createdAt}`)
    console.log('---')
  })
  
  // Check demo user specifically
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@finplanner.com' }
  })
  
  if (demoUser) {
    console.log('✅ Demo user found:')
    console.log('   ID:', demoUser.id)
    console.log('   Email:', demoUser.email)
  } else {
    console.log('❌ Demo user not found!')
  }
}

checkUsers()
  .finally(() => prisma.$disconnect())

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const defaultCategories = [
  { name: 'Bills & Utilities', color: '#EF4444', isDefault: true },
  { name: 'Food & Dining', color: '#F59E0B', isDefault: true },
  { name: 'Transportation', color: '#10B981', isDefault: true },
  { name: 'Entertainment', color: '#8B5CF6', isDefault: true },
  { name: 'Healthcare', color: '#06B6D4', isDefault: true },
  { name: 'Shopping', color: '#F97316', isDefault: true },
  { name: 'Income', color: '#22C55E', isDefault: true },
  { name: 'Investment', color: '#3B82F6', isDefault: true }
]

async function createDefaultCategories() {
  try {
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users`)
    
    for (const user of users) {
      console.log(`Creating categories for user: ${user.email}`)
      
      for (const category of defaultCategories) {
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: category.name,
            userId: user.id
          }
        })

        if (!existingCategory) {
          await prisma.category.create({
            data: {
              name: category.name,
              color: category.color,
              isDefault: category.isDefault,
              userId: user.id
            }
          })
          console.log(`  Created category: ${category.name}`)
        } else {
          console.log(`  Category already exists: ${category.name}`)
        }
      }
    }
    
    console.log('Default categories created for all users')
  } catch (error) {
    console.error('Error creating default categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultCategories()

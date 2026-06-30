import { prisma } from '../lib/db'

async function getUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'michael.dabrock@gmail.com' },
      select: { id: true, email: true, name: true }
    })

    if (user) {
      console.log('✅ User found:')
      console.log('ID:', user.id)
      console.log('Email:', user.email)
      console.log('Name:', user.name)
    } else {
      console.log('❌ User not found with email: michael.dabrock@gmail.com')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

getUserId()

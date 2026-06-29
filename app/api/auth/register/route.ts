import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = registerSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data

    // Test database connection first
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 503 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true } // Only select fields that exist in Railway DB
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password with lower rounds for faster processing
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    // Provide more detailed error messages
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Cannot reach database server. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: `Failed to create account: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

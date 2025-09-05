import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail, verifyPassword } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 })
    }

    // Find user by email
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 })
    }

    // In a real application, you would generate a session token or JWT here
    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json({ 
      message: "Login successful!", 
      user: userWithoutPassword 
    }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}

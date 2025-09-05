import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { queries } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 })
    }

    // Check if user exists
    const user = queries.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 })
    }

    // For simplicity, return user data (excluding password hash)
    const { password_hash, ...userData } = user
    return NextResponse.json({ message: "Login successful.", user: userData }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}

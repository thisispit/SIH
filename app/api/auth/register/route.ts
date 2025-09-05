import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { queries } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = queries.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Default role to 'student'
    const newUser = queries.createUser({
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: "student",
    })

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}

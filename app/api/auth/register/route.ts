import { NextResponse } from "next/server"

export async function POST(request: Request) {
  return NextResponse.json({ message: "Registration is not available in this demo version." }, { status: 403 })
}

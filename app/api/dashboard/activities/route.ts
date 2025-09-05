import { NextResponse } from "next/server"
import { queries } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') || '10'
    
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const userIdNum = parseInt(userId)
    const limitNum = parseInt(limit)
    
    if (isNaN(userIdNum)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Get user activities
    const activities = queries.getActivitiesByStudent(userIdNum)
    
    // Sort by date (most recent first) and limit
    const sortedActivities = activities
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limitNum)

    return NextResponse.json(sortedActivities)
  } catch (error) {
    console.error("Dashboard activities error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

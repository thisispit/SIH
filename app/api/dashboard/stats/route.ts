import { NextResponse } from "next/server"
import { queries } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    const userIdNum = parseInt(userId)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    // Get user info
    const user = queries.getUserById(userIdNum)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get user stats (using existing query)
    const stats = queries.getStudentStats(userIdNum)
    
    // Get user activities for additional stats
    const activities = queries.getActivitiesByStudent(userIdNum)
    
    // Calculate performance score based on approved vs total activities
    const approvedActivities = activities.filter((a: any) => a.status === 'approved').length
    const totalActivities = activities.length
    const performanceScore = totalActivities > 0 ? Math.round((approvedActivities / totalActivities) * 100) : 0

    // Format response
    const response = {
      totalCredits: stats?.total_credits || 0,
      totalActivities: stats?.total_activities || 0,
      approvedActivities: stats?.approved_activities || 0,
      pendingActivities: stats?.pending_activities || 0,
      performanceScore: performanceScore,
      user: {
        name: `${user.first_name} ${user.last_name}`,
        studentId: user.student_id,
        department: user.department
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

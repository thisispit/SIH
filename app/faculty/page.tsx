import { FacultyHeader } from "@/components/faculty/faculty-header"
import { ApprovalQueue } from "@/components/faculty/approval-queue"
import { FacultyStats } from "@/components/faculty/faculty-stats"
import { DelegationPanel } from "@/components/faculty/delegation-panel"
import { RecentApprovals } from "@/components/faculty/recent-approvals"

export default function FacultyDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <FacultyHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
            <p className="text-muted-foreground mt-2">Review and approve student activity submissions.</p>
          </div>

          {/* Stats Overview */}
          <FacultyStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Approval Queue */}
            <div className="lg:col-span-3">
              <ApprovalQueue />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <DelegationPanel />
              <RecentApprovals />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

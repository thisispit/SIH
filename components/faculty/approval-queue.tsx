"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Eye, FileText, Search, Filter } from "lucide-react"

const pendingActivities = [
  {
    id: 1,
    student: "Alice Cooper",
    studentId: "STU001",
    title: "AI Ethics Research Paper",
    category: "Academic",
    submittedDate: "2024-01-15",
    credits: 8.5,
    priority: "high",
    documents: 3,
    description: "Comprehensive research on ethical implications of AI in healthcare systems.",
  },
  {
    id: 2,
    student: "Bob Wilson",
    studentId: "STU002",
    title: "Hackathon Participation",
    category: "Technical",
    submittedDate: "2024-01-14",
    credits: 5.0,
    priority: "medium",
    documents: 2,
    description: "48-hour coding competition focusing on sustainable technology solutions.",
  },
  {
    id: 3,
    student: "Carol Davis",
    studentId: "STU003",
    title: "Community Volunteer Work",
    category: "Volunteer",
    submittedDate: "2024-01-13",
    credits: 4.0,
    priority: "low",
    documents: 1,
    description: "Teaching coding to underprivileged children at local community center.",
  },
]

export function ApprovalQueue() {
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedActivity, setSelectedActivity] = useState<any>(null)

  const handleSelectAll = () => {
    if (selectedItems.length === pendingActivities.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(pendingActivities.map((activity) => activity.id))
    }
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>Review and approve student activity submissions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && (
              <>
                <Button size="sm" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve ({selectedItems.length})
                </Button>
                <Button size="sm" variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject ({selectedItems.length})
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center gap-3 pb-2 border-b">
            <Checkbox checked={selectedItems.length === pendingActivities.length} onCheckedChange={handleSelectAll} />
            <span className="text-sm font-medium">Select All</span>
          </div>

          {/* Activity List */}
          {pendingActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
              <Checkbox
                checked={selectedItems.includes(activity.id)}
                onCheckedChange={() => handleSelectItem(activity.id)}
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.student} ({activity.studentId}) • {activity.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(activity.priority)}>{activity.priority}</Badge>
                    <span className="text-sm font-medium">{activity.credits} credits</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{activity.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Submitted: {activity.submittedDate}</span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {activity.documents} documents
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{activity.title}</DialogTitle>
                          <DialogDescription>
                            Submitted by {activity.student} ({activity.studentId})
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Activity Details</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium">Category:</span>
                              <p className="text-sm text-muted-foreground">{activity.category}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Credits Requested:</span>
                              <p className="text-sm text-muted-foreground">{activity.credits}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Feedback (Optional)</h4>
                            <Textarea placeholder="Provide feedback to the student..." />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline" className="bg-transparent">
                            Request Changes
                          </Button>
                          <Button variant="destructive">Reject</Button>
                          <Button>Approve</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { useState, useEffect } from "react"

interface PortfolioPreviewProps {
  userId: number
}

export function PortfolioPreview({ userId }: PortfolioPreviewProps) {
  const [portfolioData, setPortfolioData] = useState({
    totalActivities: 0,
    totalCredits: 0,
    lastUpdated: new Date().toLocaleDateString()
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setPortfolioData({
            totalActivities: data.totalActivities,
            totalCredits: data.totalCredits,
            lastUpdated: new Date().toLocaleDateString()
          })
        }
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchPortfolioData()
    }
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Preview</CardTitle>
          <CardDescription>Your comprehensive activity portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center animate-pulse">
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Preview</CardTitle>
        <CardDescription>Your comprehensive activity portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">Portfolio</div>
              <div className="text-sm text-muted-foreground">
                {portfolioData.totalActivities} Activities • {portfolioData.totalCredits} Credits
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Last updated: {portfolioData.lastUpdated}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

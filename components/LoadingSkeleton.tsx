import { Card, CardContent } from "@/components/ui/card"

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="animate-pulse flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

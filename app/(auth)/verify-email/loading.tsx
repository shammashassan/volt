import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function VerifyEmailLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center text-center">
        <Skeleton className="h-12 w-12 mb-4" />
        <Skeleton className="h-6 w-44 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardContent>
    </Card>
  )
}

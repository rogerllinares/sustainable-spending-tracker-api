import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EsgBadgeProps {
  score: number   // 0-100
  className?: string
}

export function EsgBadge({ score, className }: EsgBadgeProps) {
  const tone =
    score >= 70 ? "bg-green-100 text-green-800 border-green-200"
    : score >= 40 ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-red-100 text-red-800 border-red-200"
  return (
    <Badge variant="outline" className={cn("font-medium", tone, className)}>
      {score.toFixed(0)}
    </Badge>
  )
}

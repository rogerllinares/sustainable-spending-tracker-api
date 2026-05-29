import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EsgBadgeProps {
  score: number   // 0-100
  className?: string
}

export function EsgBadge({ score, className }: EsgBadgeProps) {
  // DESIGN.md sec.2 ESG Scale: Good >=70 / Mid 40-69 / Bad <40, fg/bg/border triad from tokens.
  const tone =
    score >= 70 ? "bg-esg-good text-esg-good-foreground border-esg-good-border"
    : score >= 40 ? "bg-esg-mid text-esg-mid-foreground border-esg-mid-border"
    : "bg-esg-bad text-esg-bad-foreground border-esg-bad-border"
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[0.72rem] font-medium tabular-nums", tone, className)}
    >
      {score.toFixed(0)}
    </Badge>
  )
}

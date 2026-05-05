import { Card, CardContent } from "@workspace/ui/components/card"
import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

export function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <span className="text-sm font-medium font-display text-muted-foreground">{label}</span>
          </div>
          <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
        </div>
        
        <div className="flex items-baseline gap-3">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                trend.isPositive 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "bg-rose-50 text-rose-600"
              )}
            >
              {trend.value}%
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

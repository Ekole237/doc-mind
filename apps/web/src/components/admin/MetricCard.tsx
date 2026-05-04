import { Card, CardContent } from "@workspace/ui/components/card"

interface MetricCardProps {
  label: string
  value: number
  description?: string
  variant?: "default" | "warning" | "danger" | "info"
}

export function MetricCard({ label, value, description, variant = "default" }: MetricCardProps) {
  const valueColor =
    variant === "danger" && value > 0
      ? "text-destructive"
      : variant === "warning" && value > 0
        ? "text-orange-500"
        : variant === "info"
          ? "text-blue-500"
          : "text-primary"

  return (
    <Card className={"border-2 border-gray-400 font-sans"}>
      <CardContent>
        <p className="text-sm text-medium text-gray-600">{label}</p>
        <p className={`mt-2 text-4xl font-bold ${valueColor}`}>{value}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

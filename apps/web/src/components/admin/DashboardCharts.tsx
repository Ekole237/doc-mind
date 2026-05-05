import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ChartContainer, ChartTooltipContent } from "@workspace/ui/components/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { DailyStat, DocumentDistribution } from "@/types"

// --- Sales Overview Chart (Repurposed as Query Trends) ---

const salesConfig = {
  queries: { label: "Queries", color: "#7c3aed" },
}

export function QueryVolumeChart({ data }: { data: DailyStat[] }) {
  return (
    <Card className="border-none shadow-sm flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Activity Overview</CardTitle>
          <div className="mt-1">
            <span className="text-2xl font-bold">{data.reduce((acc, curr) => acc + curr.count, 0)}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground">Total queries in period</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={salesConfig} className="h-62.5 w-full">
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              dy={10}
              tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { weekday: "short" })}
            />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-queries)" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// --- Total Subscriber Chart (Repurposed as Daily Activity) ---

export function DailyActivityChart({ data }: { data: DailyStat[] }) {
  const latestCount = data[data.length - 1]?.count ?? 0
  const previousCount = data[data.length - 2]?.count ?? 0
  const diff = latestCount - previousCount
  const isPositive = diff >= 0

  return (
    <Card className="border-none shadow-sm w-87.5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Daily Queries</CardTitle>
        <Select defaultValue="weekly">
          <SelectTrigger className="w-22.5 h-8 text-xs border-none bg-muted/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-2xl font-bold">{latestCount}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold ${isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"} px-1.5 py-0.5 rounded-full`}>
              {Math.abs(diff)} {isPositive ? "↑" : "↓"}
            </span>
            <span className="text-[10px] text-muted-foreground">vs yesterday</span>
          </div>
        </div>
        <ChartContainer config={{}} className="h-45 w-full">
          <BarChart data={data}>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              dy={5}
              tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR", { weekday: "narrow" })}
            />
            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={25}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? "#7c3aed" : "#f1f5f9"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// --- Sales Distribution Chart (Repurposed as Document Distribution) ---

const COLORS = ["#7c3aed", "#22d3ee", "#f1f5f9", "#e2e8f0"]

export function DocumentStatusDistributionChart({ data }: { data: DocumentDistribution[] }) {
  return (
    <Card className="border-none shadow-sm flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Documents Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          {data.slice(0, 3).map((item, index) => (
            <div key={item.name}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-0.5 h-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-lg font-bold">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="h-45 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

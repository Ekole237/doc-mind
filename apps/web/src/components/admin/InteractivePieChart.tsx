import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

export interface InteractivePieChartItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface InteractivePieChartProps {
  title: string;
  description?: string;
  valueLabel?: string;
  items: InteractivePieChartItem[];
  className?: string;
}

export function InteractivePieChart({
  title,
  description,
  valueLabel = "Valeur",
  items,
  className,
}: InteractivePieChartProps) {
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? "");

  const chartConfig = useMemo<ChartConfig>(
    () =>
      items.reduce<ChartConfig>((acc, item) => {
        acc[item.key] = {
          label: item.label,
          color: item.color,
        };
        return acc;
      }, {}),
    [items]
  );

  const activeIndex = useMemo(
    () => items.findIndex((item) => item.key === activeKey),
    [activeKey, items]
  );
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeItem = items[safeActiveIndex];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>

        <select
          value={activeKey}
          onChange={(event) => setActiveKey(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          aria-label="Sélectionner une catégorie"
        >
          {items.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </CardHeader>

      <CardContent className="pb-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[320px]"
            initialDimension={{ width: 320, height: 320 }}
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="key"
                    formatter={(value) => (
                      <span className="font-medium tabular-nums">
                        {Number(value).toLocaleString("fr-FR")}
                      </span>
                    )}
                  />
                }
              />
              <Pie
                data={items}
                dataKey="value"
                nameKey="key"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                strokeWidth={4}
              >
                {items.map((entry) => (
                  <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                ))}
              </Pie>
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-3xl font-bold"
              >
                {activeItem?.value.toLocaleString("fr-FR") ?? "0"}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs"
              >
                {valueLabel}
              </text>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

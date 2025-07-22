import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { FaExternalLinkAlt } from 'react-icons/fa';

export const description = 'A radial chart with stacked sections';

// const chartData = [{ internal: 96, external: 7 }];

const chartConfig = {
  internal: {
    label: 'Internal',
    color: '#ad12a5',
  },
  external: {
    label: 'External',
    color: '#660451',
  },
} satisfies ChartConfig;

interface Props {
  chartData: {
    internal: number;
    external: number;
  }[];
}

export function InternalVsExternalLinksChart({ chartData }: Props) {
  const totalLinks = chartData[0].internal + chartData[0].external;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Internal VS External Links</CardTitle>
        <CardDescription>Difference in numbers of links</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalLinks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Links
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="internal"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-internal)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="external"
              fill="var(--color-external)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm  items-start">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total of {totalLinks} working links{' '}
          <FaExternalLinkAlt className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total links that appear on the page
        </div>
      </CardFooter>
    </Card>
  );
}

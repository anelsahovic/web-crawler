import { Pie, PieChart } from 'recharts';

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
import { TbUnlink } from 'react-icons/tb';

export const description = 'A pie chart with a label';

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'var(--chart-1)',
  },
  safari: {
    label: 'Safari',
    color: 'var(--chart-2)',
  },
  firefox: {
    label: 'Firefox',
    color: 'var(--chart-3)',
  },
  edge: {
    label: 'Edge',
    color: 'var(--chart-4)',
  },
  other: {
    label: 'Other',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

const colors = ['#2563eb', '#60a5fa', '#93c5fd', '#3b82f6', '#1d4ed8'];

interface Props {
  statusCodesArray: number[];
}

export function BrokenLinksChartPie({ statusCodesArray }: Props) {
  const frequencyMap = new Map<number, number>();

  for (const code of statusCodesArray) {
    frequencyMap.set(code, (frequencyMap.get(code) ?? 0) + 1);
  }

  const pieData = Array.from(frequencyMap.entries()).map(
    ([code, count], index) => ({
      name: code,
      value: count,
      fill: colors[index % colors.length],
    })
  );

  return (
    <Card className="flex flex-col h-full rounded-md bg-slate-100">
      <CardHeader className="items-center pb-0">
        <CardTitle>Broken Link Status Codes</CardTitle>
        <CardDescription>
          Frequency of HTTP status codes from broken links
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={pieData} dataKey="value" label nameKey="name" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm justify-start items-start">
        <div className="flex items-start gap-2 leading-none font-medium">
          Total of {statusCodesArray.length} broken links{' '}
          <TbUnlink className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing frequency of broken link status codes
        </div>
      </CardFooter>
    </Card>
  );
}

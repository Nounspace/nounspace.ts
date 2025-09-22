"use client";
import { useScreenSize } from "@nouns/hooks/useScreenSize";
import { useMemo } from "react";
import { Area, CartesianGrid, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatNumber } from "@nouns/utils/format";

const NUM_X_AXIS_TICKS_LG = 5;
const NUM_X_AXIS_TICKS_SM = 3;

type BaseDataEntry = { timestamp: number };

interface LineConfig<DataEntry extends BaseDataEntry> {
  dataKey: keyof DataEntry;
  style: {
    lineColor: string;
    areaGradient: boolean;
  };
  name: string;
}

export interface TimeSeriesChartProps<DataEntry extends BaseDataEntry> {
  data: DataEntry[];
  lineConfigs: LineConfig<DataEntry>[];
  unit?: string;
  showLegend?: boolean;
  // showAverage?: boolean;
}

export default function TimeSeriesChart<DataEntry extends BaseDataEntry>({
  data,
  lineConfigs,
  unit,
  showLegend,
}: TimeSeriesChartProps<DataEntry>) {
  const screenSize = useScreenSize();

  const numXAxisTicks = useMemo(() => {
    return screenSize == "lg" ? NUM_X_AXIS_TICKS_LG : NUM_X_AXIS_TICKS_SM;
  }, [screenSize]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ right: 5, top: 12 }}>
        <defs>
          {lineConfigs.map((config, i) => (
            <linearGradient id={`color-${config.style.lineColor}`} x1="0" y1="0" x2="0" y2="1" key={i}>
              <stop offset="5%" stopColor={config.style.lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={config.style.lineColor} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray={4} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(t) => formatTimestamp(t as number)}
          domain={["dataMin", "dataMax"]}
          ticks={getXTicks(data, numXAxisTicks, data[0].timestamp)}
          type="number"
          tickLine={false}
          tickMargin={10}
          allowDataOverflow={true}
          className="paragraph-sm"
          padding={{ right: 1 }} // Makes last point show on longer range graphs (for some reason)
          // stroke={tailwindFullTheme.theme.colors.content.secondary}
        />
        <YAxis
          orientation="right"
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
          allowDataOverflow={true}
          tickMargin={4}
          tickFormatter={(v) =>
            formatNumber({ input: v, unit: unit, compact: true, maxFractionDigits: 1, maxSignificantDigits: 3 })
          }
          tickCount={4}
          className="paragraph-sm"
          // stroke={tailwindFullTheme.theme.colors.content.secondary}
        />
        {lineConfigs.map((config, i) => (
          <Area
            type="monotone"
            dataKey={config.dataKey as string}
            stroke={config.style.lineColor == "white" ? "transparent" : config.style.lineColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={config.style.areaGradient ? `url(#color-${config.style.lineColor})` : "#00000000"}
            name={config.name}
            key={i}
            // baseValue={yAxisDomainMin}
          />
        ))}
        {showLegend && (
          <Legend
            iconType="circle"
            align="left"
            offset="2px"
            formatter={(value: string) => {
              return <span className="text-content-primary label-sm h-full pr-2">{value}</span>;
            }}
            wrapperStyle={{ bottom: -8 }}
          />
        )}
        <Tooltip
          position={{ y: 0 }} // Set to the top of chart
          cursor={{
            // stroke: tailwindFullTheme.theme.colors.content.primary,
            strokeWidth: 2,
            strokeDasharray: 4,
          }}
          formatter={(value, name) => [formatNumber({ input: value as number, unit: unit })]}
          labelFormatter={(label) => formatTimestamp(label as number, true)}
          contentStyle={{
            borderRadius: 8,
            // border: `1px solid ${tailwindFullTheme.theme.colors.border.primary}`,
            // boxShadow: tailwindFullTheme.theme.boxShadow[1],
          }}
        />

        {/* {showAverage && (
          <ReferenceLine
            y={average}
            // stroke={tailwindFullTheme.theme.colors.content.secondary}
            strokeWidth={1}
            className="bg-red-500"
            label={(props: any) => {
              const lineY = props["viewBox"]["y"] as number;
              return (
                <foreignObject x={10} y={lineY > 50 ? lineY - 40 : lineY + 10} width={1} height={1} overflow="visible">
                  <div className="text-content-primary bg-background-surface shadow-2 flex h-fit w-fit flex-row items-center justify-center whitespace-nowrap rounded-md px-2 py-1 font-semibold">
                    AVG {formatNumber(average, unit, 2)}
                  </div>
                </foreignObject>
              );
            }}
          />
        )} */}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function getXTicks<DataEntry extends { timestamp: number }>(
  data: DataEntry[],
  numTicks: number,
  xAxisDomainStartS: number
) {
  const filteredData = data.filter((d) => d.timestamp > xAxisDomainStartS);
  const gap = filteredData.length / numTicks;
  return Array(numTicks)
    .fill(0)
    .map((_, i) => {
      const index = Math.floor(gap / 2 + gap * i);
      return filteredData[index]["timestamp"];
    });
}

function formatTimestamp(timestamp: number, full?: boolean): string {
  const date = new Date(timestamp * 1000);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(full
      ? ({
          year: "numeric",
        } as Intl.DateTimeFormatOptions)
      : {}),
  }).format(date);
}

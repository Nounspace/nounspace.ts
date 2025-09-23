"use client";
import Card from "@nouns/components/ui/card";
import TimeSeriesChart from "@nouns/components/Chart/TimeSeriesChart";
import { getDailyFinancialSnapshots } from "@nouns/data/ponder/financial/getDailyFinancialSnapshots";
import { computePercentDifference } from "@nouns/utils/postProcessing";
import { useCurrencySelector } from "@nouns/components/selectors/CurrencySelector";
import {
  DATA_FOR_TIME_SELECTOR,
  useTimeSelector,
} from "@nouns/components/selectors/TimeSelector";
import TitlePopover from "@nouns/components/TitlePopover";
import StatCard from "@nouns/components/StatCard";
import { formatNumber } from "@nouns/utils/format";
import clsx from "clsx";
import { palette } from "@nouns/theme/tailwind.config";

interface StatsProps {
  data: Awaited<ReturnType<typeof getDailyFinancialSnapshots>>;
}

export default function TreasuryStats({ data }: StatsProps) {
  const currencySelector = useCurrencySelector();
  const timeSelector = useTimeSelector();

  const timeSelectorData = DATA_FOR_TIME_SELECTOR[timeSelector];

  const minTimestamp = data[0]?.timestamp;
  const timeCutoff = timeSelectorData.rangeS
    ? Math.max(
        Math.floor(Date.now() / 1000) - timeSelectorData.rangeS,
        minTimestamp,
      )
    : minTimestamp;

  // When useMemo, it breaks animation for some reason
  const treasuryBalance: Array<{ timestamp: number; value: number }> = data
    .map((d) => ({
      timestamp: d.timestamp,
      value:
        currencySelector == "USD"
          ? d.treasuryBalanceInUsd
          : d.treasuryBalanceInEth,
    }))
    .filter((d) => d.timestamp >= timeCutoff);

  const revenueVsCostData = data
    .map((d) => ({
      timestamp: d.timestamp,
      revenue:
        currencySelector == "USD"
          ? d.auctionRevenueInUsd
          : d.auctionRevenueInEth,
      cost: currencySelector == "USD" ? d.propSpendInUsd : d.propSpendInEth,
    }))
    .filter((d) => d.timestamp >= timeCutoff);

  const cumulativeRevenueVsCostData = [revenueVsCostData[0]];
  for (let i = 1; i < revenueVsCostData.length; i++) {
    cumulativeRevenueVsCostData.push({
      timestamp: revenueVsCostData[i].timestamp,
      revenue:
        cumulativeRevenueVsCostData[i - 1].revenue +
        revenueVsCostData[i].revenue,
      cost: cumulativeRevenueVsCostData[i - 1].cost + revenueVsCostData[i].cost,
    });
  }

  const cumulativeCost =
    cumulativeRevenueVsCostData[cumulativeRevenueVsCostData.length - 1].cost;
  const cumulativeRevenue =
    cumulativeRevenueVsCostData[cumulativeRevenueVsCostData.length - 1].revenue;
  const cumulativeProfit = cumulativeRevenue - cumulativeCost;

  const avgDailyProfit = cumulativeProfit / cumulativeRevenueVsCostData.length;
  const runway =
    avgDailyProfit > 0
      ? Infinity
      : Math.ceil(
          treasuryBalance[treasuryBalance.length - 1].value / -avgDailyProfit,
        );

  const descriptionSuffix = `${timeSelectorData.rangeS != undefined ? "the" : ""} ${timeSelectorData.name.toLowerCase()}`;

  const balanceChange =
    treasuryBalance[treasuryBalance.length - 1].value -
    treasuryBalance[0].value;
  const balancePercentDiff = computePercentDifference(
    treasuryBalance[0].value,
    treasuryBalance[treasuryBalance.length - 1].value,
  );

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        <StatCard
          title={`Auction Revenue (${timeSelectorData.shortName})`}
          popoverDescription={`The total revenue generated from auctions over ${descriptionSuffix}.`}
          value={formatNumber({
            input: cumulativeRevenue,
            unit: currencySelector,
            maxFractionDigits: 0,
          })}
          className="flex-1"
        />
        <StatCard
          title={`Prop Spending (${timeSelectorData.shortName})`}
          popoverDescription={`The total proposal expenditure over ${descriptionSuffix}.`}
          value={formatNumber({
            input: cumulativeCost,
            unit: currencySelector,
            maxFractionDigits: 0,
          })}
          className="flex-1"
        />
        <StatCard
          title={`DAO Runway (${timeSelectorData.shortName})`}
          popoverDescription={`An estimate of the number of days the DAO can continue operating before going broke based on the revenue and spending over ${descriptionSuffix}. This will be finite when spending exceeds revenue.`}
          value={formatNumber({ input: runway, unit: "days" })}
          className="flex-1"
        />
      </div>

      <Card className="flex flex-col">
        <TitlePopover title="Treasury Balance">
          The current balance of the Nouns Treasury. This tracks changes over
          time, including deposits, withdrawals, and any adjustments from
          treasury activities.
        </TitlePopover>
        <div className="label-lg">
          {formatNumber({
            input: treasuryBalance[treasuryBalance.length - 1].value,
            unit: currencySelector,
            maxFractionDigits: currencySelector == "USD" ? 0 : 2,
          })}
        </div>
        <div
          className={clsx(
            "pb-3 pt-2 paragraph-sm",
            balancePercentDiff < 0
              ? "text-semantic-negative"
              : "text-semantic-positive",
          )}
        >
          {formatNumber({
            input: balancePercentDiff,
            percent: true,
            forceSign: true,
          })}{" "}
          (
          {formatNumber({
            input: balanceChange,
            unit: currencySelector,
            maxFractionDigits: 0,
          })}
          )
        </div>
        <div className="h-[200px] w-full py-4">
          <TimeSeriesChart
            data={treasuryBalance}
            lineConfigs={[
              {
                dataKey: "value",
                style: { lineColor: palette.blue[500], areaGradient: false },
                name: "Treasury Balance",
              },
            ]}
            unit={currencySelector == "ETH" ? "Ξ" : currencySelector} // Condensed ETH version
          />
        </div>
      </Card>

      <Card>
        <TitlePopover title="Auction Revenue & Prop Spending">
          Cumulative auction revenue and proposal spending, indicating whether
          the inflows were positive or negative over time.
        </TitlePopover>
        <div className="label-lg">
          {formatNumber({
            input: cumulativeProfit,
            unit: currencySelector,
            maxFractionDigits: currencySelector == "USD" ? 0 : 2,
          })}
        </div>
        <div className="h-[200px] w-full py-4">
          <TimeSeriesChart
            data={cumulativeRevenueVsCostData}
            lineConfigs={[
              {
                dataKey: "revenue",
                style: { lineColor: palette.green[600], areaGradient: false },
                name: "Auction Revenue",
              },
              {
                dataKey: "cost",
                style: { lineColor: palette.red[500], areaGradient: false },
                name: "Prop Spending",
              },
            ]}
            unit={currencySelector == "ETH" ? "Ξ" : currencySelector} // Condensed ETH version
            showLegend={true}
          />
        </div>
      </Card>
    </>
  );
}

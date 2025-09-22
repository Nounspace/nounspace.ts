"use client";
import DataMetric from "@nouns/components/DataMetric";
import { useInView } from "framer-motion";
import { useMemo, useRef } from "react";

interface ByTheNumbersDataProps {
  nounsCreated: number;
  nounOwners: number;
  ideasFunded: number;
  treasuryDeployedUsd: number;
}

export default function ByTheNumbersData({
  nounsCreated,
  nounOwners,
  ideasFunded,
  treasuryDeployedUsd,
}: ByTheNumbersDataProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [
    nounsCreatedInternal,
    nounOwnersInternal,
    ideasFundedInternal,
    treasuryDeployedUsdInternal,
  ] = useMemo(() => {
    return isInView
      ? [nounsCreated, nounOwners, ideasFunded, treasuryDeployedUsd]
      : [0, 0, 0, 0];
  }, [nounsCreated, nounOwners, ideasFunded, treasuryDeployedUsd, isInView]);

  return (
    <div
      className="grid grid-cols-2 grid-rows-2 gap-12 md:grid-cols-4 md:grid-rows-1 md:gap-[160px]"
      ref={ref}
    >
      <DataMetric label="Nouns Created" value={nounsCreatedInternal} />
      <DataMetric label="Noun Owners" value={nounOwnersInternal} />
      <DataMetric label="Ideas Funded" value={ideasFundedInternal} />
      <DataMetric
        label="Funded (USD)"
        value={treasuryDeployedUsdInternal}
        unit="$"
      />
    </div>
  );
}

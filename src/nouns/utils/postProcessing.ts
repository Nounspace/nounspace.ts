export function computePercentDifference(initial: number, final: number): number {
  return (final - initial) / Math.abs(initial);
}

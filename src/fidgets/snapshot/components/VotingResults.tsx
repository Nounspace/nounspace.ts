import React, { memo } from "react";

interface QuorumInfo {
  hasQuorum: boolean;
  quorumThreshold?: number;
  quorumType?: string;
  minScore?: number;
}

interface VotingResultsProps {
  choices: string[];
  scores: number[];
  scores_total?: number;
  bodyFont: string;
  quorumInfo?: QuorumInfo;
}

const VotingResults: React.FC<VotingResultsProps> = memo(
  ({ choices, scores, scores_total, bodyFont, quorumInfo }) => {
    const totalScores =
      scores_total ||
      scores.reduce((acc: number, score: number) => acc + score, 0);

    const maxScore = Math.max(...scores);
    const winningIndex = scores.indexOf(maxScore);

    // Calculate quorum status
    const quorumMet = quorumInfo?.hasQuorum
      ? (() => {
          if (quorumInfo.quorumThreshold) {
            return totalScores >= quorumInfo.quorumThreshold;
          }
          if (quorumInfo.minScore) {
            return maxScore >= quorumInfo.minScore;
          }
          return true;
        })()
      : true;

    return (
      <div style={{ fontFamily: bodyFont }}>
        {/* Quorum Information */}
        {quorumInfo?.hasQuorum && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-semibold mb-2 text-gray-800">
              Quorum Information
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${quorumMet ? "text-green-600" : "text-red-600"}`}
                >
                  {quorumMet ? "✓ Quorum Met" : "✗ Quorum Not Met"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Votes:</span>
                <span className="font-medium">{totalScores.toFixed(2)}</span>
              </div>
              {quorumInfo.quorumThreshold !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Required Threshold:</span>
                  <span className="font-medium">
                    {quorumInfo.quorumThreshold}
                  </span>
                </div>
              )}
              {quorumInfo.minScore !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Score Required:</span>
                  <span className="font-medium">{quorumInfo.minScore}</span>
                </div>
              )}
              {quorumInfo.quorumType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quorum Type:</span>
                  <span className="font-medium capitalize">
                    {quorumInfo.quorumType}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Results */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          {choices.map((choice: string, index: number) => {
            const score = scores[index];
            const percentage =
              totalScores > 0 ? (score / totalScores) * 100 : 0;
            const isWinning = index === winningIndex && score > 0;

            return (
              <React.Fragment key={index}>
                <div
                  className={`text-xs font-medium ${isWinning ? "text-green-600" : ""}`}
                >
                  {isWinning && "👑 "}
                  {choice}
                </div>
                <div className="h-2 w-full bg-gray-300 rounded">
                  <div
                    className={`h-full rounded ${
                      isWinning ? "bg-green-500" : "bg-blue-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div
                  className={`text-xs font-medium ${isWinning ? "text-green-600" : ""}`}
                >
                  {score.toFixed(2)} ({percentage.toFixed(1)}%)
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total Votes Cast:</span>
            <span className="font-medium">{totalScores.toFixed(2)}</span>
          </div>
          {choices[winningIndex] && maxScore > 0 && (
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Leading Choice:</span>
              <span className="font-medium text-green-600">
                {choices[winningIndex]} ({maxScore.toFixed(2)} votes)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

VotingResults.displayName = "VotingResults";

export default VotingResults;

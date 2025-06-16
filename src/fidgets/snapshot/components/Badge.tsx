import React, { memo } from "react";
import { ProposalStatus } from "../hooks/useProposalStatus";

interface BadgeProps {
  status: ProposalStatus;
}

const getStatusBadgeColor = (status: ProposalStatus): string => {
  switch (status) {
    case "Pending":
      return "bg-yellow-500 w-16";
    case "Active":
      return "bg-blue-400 w-16";
    case "Passed":
      return "bg-green-500 w-16";
    case "Failed":
      return "bg-red-500 w-16";
    case "Closed":
      return "bg-gray-500 w-16";
    default:
      return "bg-gray-500 w-16";
  }
};

const Badge: React.FC<BadgeProps> = memo(({ status }) => {
  const colorClasses = getStatusBadgeColor(status);

  return (
    <div
      className={`inline-block text-white py-1 px-3 rounded-full text-xs ${colorClasses}`}
    >
      {status}
    </div>
  );
});

Badge.displayName = "Badge";

export default Badge;

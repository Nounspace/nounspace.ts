import React from "react";
import { isEmpty } from "lodash";

type CastListProps = {
  data: any[];
  renderRow: (item: any, idx: number) => React.ReactNode;
};

export const CastList = ({ data, renderRow }: CastListProps) => {
  if (isEmpty(data)) {
    return null;
  }

  return (
    <ul>
      {data.map((cast: any, idx: number) =>
        cast ? renderRow(cast, idx) : null,
      )}
    </ul>
  );
};

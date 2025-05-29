// components/CastLengthIndicator.tsx
import React from 'react';

const MAX_LENGTH = 320;

export const CastLengthIndicator = ({ length }: { length: number }) => {
  const color = length > MAX_LENGTH ? 'text-red-600' : 'text-gray-500';

  return (
    <div className={`text-sm ml-2 ${color}`}>
      {length} / {MAX_LENGTH}
    </div>
  );
};

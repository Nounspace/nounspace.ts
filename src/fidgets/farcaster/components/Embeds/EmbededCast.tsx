import React from "react";
import { CastRow } from "@/fidgets/farcaster/components/CastRow";
import { isEmpty } from "lodash";
import type { CastEmbed } from ".";
import { useCastById } from "@/common/lib/hooks/useCastById";
import Loading from "@/common/components/molecules/Loading";

const EmbededCast = ({ url, castId }: CastEmbed) => {
  // We use the custom hook that implements automatic caching
  const { data: cast, isLoading, isError } = useCastById(url, castId);

  // Show a loading indicator while fetching data
  if (isLoading) return <div className="p-4 flex justify-center"><Loading /></div>;
  
  // Show an error message if there was a problem fetching the data
  if (isError) return <div className="p-4 text-red-500">Failed to load this cast</div>;

  // Don’t render anything if there’s no data to show
  if ((!url && !castId) || isEmpty(cast)) return null;

  return (
    <div key={`cast-embed-${url}`} className=" flex-1 overflow-hidden">
      <CastRow cast={cast} showChannel isEmbed hideReactions />
    </div>
  );
};

export default EmbededCast;

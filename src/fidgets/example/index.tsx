import TextInput from "@/common/ui/molecules/TextInput";
import { useGetChannelCasts } from "@/hooks/useGetChannelCasts";
import { useLookupChannel } from "@/hooks/useGetChannelInfo";
import React, { useMemo } from "react";
import { FidgetEditConfig, makeFidget } from "../../common/fidgets/makeFidget";

export type ChannelFidgetSettings = {
  channel: string;
  title: string;
};

const channelFidgetConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "Channel Feed",
      default: "A channel Feed!",
      required: true,
      inputSelector: TextInput,
    },
  ],
};

const isImageUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return url.match(/\.(jpeg|jpg|gif|png)$/) != null || url.includes("imagedelivery");
};

const isWebUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return url.match(/^(http|https):\/\//) != null;
};

const Channel: React.FC<ChannelFidgetSettings> = ({ channel, title }: ChannelFidgetSettings) => {
  const { data: channelCasts, isLoading: castsLoading } = useGetChannelCasts(channel);
  const { data: channelInfo, isLoading: channelInfoLoading } = useLookupChannel(channel);

  const isLoading = useMemo(() => {
    return castsLoading || channelInfoLoading;
  }, [castsLoading, channelInfoLoading]);

  if (isLoading) {
    return (
      <div className="bg-black w-full h-full flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!channelInfo || !channelCasts) {
    return (
      <div className="bg-black w-full h-full flex items-center justify-center">
        <p className="text-white">No channel data found</p>
      </div>
    );
  }

  return (
    <div className="bg-black w-full h-full">
      <div className="flex w-full items-center h-1/6 gap-2 p-4">
        <img src={channelInfo.channel.image_url} className="h-[50px] w-[50px]" />
        <div className="flex flex-col items-start justify-center">
          <p className="text-white text-base">/{channelInfo.channel.id}</p>
          <p className="text-white text-sm">{channelInfo.channel.description}</p>
        </div>
      </div>
      <div className="flex flex-col items-start overflow-scroll w-full h-5/6 p-4">
        {channelCasts.casts
          .filter((cast) => !isWebUrl(cast.text))
          .filter((item) => item.text !== "")
          .map((item) => {
            const hasImages = item.embeds.some((x) => isImageUrl(x.url));

            return (
              <div className="flex gap-2 w-full justify-between items-center py-2" key={item.hash}>
                {hasImages && (
                  <div className="flex flex-col gap-2 justify-start basis-1/6 shrink w-1/6">
                    {item.embeds
                      .filter((x) => isImageUrl(x.url))

                      .map((embed) => {
                        return <img src={embed.url} alt={embed.url} key={embed} className="h-full w-auto" />;
                      })}
                  </div>
                )}
                <div className="flex flex-col basis-5/6 grow ">
                  <p className="text-white text-base">@{item.author.username}</p>
                  <p className="text-white text-sm">{item.text}</p>
                  <div className="flex w-full justify-start gap-2">
                    <p className="text-white text-xs">{item.reactions.likes.length} likes</p>
                    <p className="text-white text-xs">{item.reactions.recasts.length} recasts</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const ChannelFidget = makeFidget<ChannelFidgetSettings>(Channel, channelFidgetConfig);

export default ChannelFidget;

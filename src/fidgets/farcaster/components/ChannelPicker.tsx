import * as React from "react";
import { Button } from "@/common/components/atoms/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/common/components/atoms/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/atoms/popover";
import { take } from "lodash";
import { useEffect } from "react";
import { uniqBy } from "lodash";
import { Channel } from "@neynar/nodejs-sdk/build/neynar-api/v2";

type Props = {
  getChannels: (query: string) => Promise<Channel[]>;
  getAllChannels: () => Promise<Channel[]>;
  onSelect: (value: Channel) => void;
  value: Channel;
  initialChannels?: Channel[];
  disabled?: boolean;
};

export function ChannelPicker(props: Props) {
  const { getChannels, getAllChannels, onSelect } = props;
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const [channels, setChannels] = React.useState<Channel[]>(
    props.initialChannels ?? [],
  );

  const setChannelResults = (newChannels: Channel[]) => {
    setChannels(uniqBy(newChannels, "parent_url"));
  };

  useEffect(() => {
    async function getChannelResults() {
      if (query.length < 2) return;
      setChannelResults(await getChannels(query));
    }

    getChannelResults();
  }, [query, setChannels, getChannels]);

  useEffect(() => {
    async function getChannelResults() {
      const channels = await getAllChannels();
      setChannelResults(channels);
    }

    getChannelResults();
  }, [setChannels, getAllChannels]);

  const handleSelect = React.useCallback(
    (channel: Channel) => {
      setOpen(false);
      onSelect(channel);
    },
    [onSelect, setOpen],
  );

  const filteredChannels =
    query === ""
      ? take(channels, 15)
      : take(
          channels.filter((channel) => {
            return (
              channel.name &&
              channel.name.toLowerCase().includes(query.toLowerCase())
            );
          }),
          10,
        );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="h-10 px-4"
          disabled={props.disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          type="button"
        >
          <img
            src={props.value.image_url ?? ""}
            alt={props.value.name}
            width={24}
            height={24}
            className="h-4 w-4 mr-2 -ml-2"
          />
          {props.value.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search Channels"
            value={query}
            onValueChange={(e) => setQuery(e)}
          />
          <CommandEmpty>No channels found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {(channels.length === 0 ? [props.value] : filteredChannels).map(
              (channel) => (
                <CommandItem
                  key={channel.parent_url || "home"}
                  value={channel.name || "home"}
                  className="cursor-pointer"
                  onSelect={() => handleSelect(channel)}
                >
                  <img
                    src={channel.image_url ?? ""}
                    alt={channel.name}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  {channel.name}
                </CommandItem>
              ),
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

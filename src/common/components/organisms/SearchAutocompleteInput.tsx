import React, {
  useState,
  useCallback,
  Suspense,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import useSearchUsers from "@/common/lib/hooks/useSearchUsers";
import useSearchTokens, { TokenResult } from "@/common/lib/hooks/useSearchTokens";
import useSearchChannels from "@/common/lib/hooks/useSearchChannels";
import { User, Channel } from "@neynar/nodejs-sdk/build/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/atoms/avatar";
import {
  Command,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/common/components/atoms/command";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

type SearchAutocompleteInputProps = {
  onSelect: () => void;
};

const SearchAutocompleteInput: React.FC<SearchAutocompleteInputProps> = ({
  onSelect,
}) => {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchAutocompleteInputContent onSelect={onSelect} />
    </Suspense>
  );
};

const SearchAutocompleteInputContent: React.FC<SearchAutocompleteInputProps> = ({
  onSelect,
}) => {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const { users, loading: loadingUsers } = useSearchUsers(query);
  const { tokens, loading: loadingTokens } = useSearchTokens(query);
  const { channels, loading: loadingChannels } = useSearchChannels(query);
  const loading = loadingUsers || loadingTokens || loadingChannels;

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const handleFocus = useCallback(() => {
    clearBlurTimeout();
    setIsFocused(true);
  }, [clearBlurTimeout]);

  const handleBlur = useCallback(() => {
    clearBlurTimeout();
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      blurTimeoutRef.current = null;
    }, 150);
  }, [clearBlurTimeout]);

  useEffect(() => {
    return () => {
      clearBlurTimeout();
    };
  }, [clearBlurTimeout]);

  const onSelectQuery = useCallback(() => {
    router.push(`/search?q=${query}`);
    onSelect && onSelect();
  }, []);

  const onSelectUser = useCallback((user: User) => {
    router.push(`/s/${user.username}`);
    onSelect && onSelect();
  }, []);

  const onSelectToken = useCallback(
    (token: TokenResult) => {
      router.push(`/t/${token.network}/${token.contractAddress}`);
      onSelect?.();
    },
    [router, onSelect],
  );

  const onSelectChannel = useCallback(
    (channel: Channel) => {
      router.push(`/c/${channel.id}`);
      onSelect?.();
    },
    [router, onSelect],
  );
  return (
    <Command className="rounded-md border" shouldFilter={false} loop={true}>
      <div className={loading ? "animated-loading-bar" : ""}>
        <CommandInput
          placeholder="Search users, channels, or tokens"
          onValueChange={setQuery}
          value={query || ""}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="h-11"
        />
      </div>
      {isFocused && (
        <CommandList className="max-h-[500px]">
          {false && (
            <CommandItem
              onSelect={onSelectQuery}
              className="rounded-none cursor-pointer border-b"
              value="Search"
            >
              <div className="flex items-center py-1 px-1">
                <MagnifyingGlassIcon className="mr-2 h-7 w-7 shrink-0 opacity-50" />
                <div className="leading-[1.3] tracking-tight font-bold opacity-80">{`Search for "${query}"`}</div>
              </div>
            </CommandItem>
          )}
          {users?.length > 0 && (
            <CommandGroup heading="Users">
              {users.map((user: any, i: number) => (
                <CommandItem
                  key={i}
                  onSelect={() => onSelectUser(user)}
                  value={user.username}
                  className="gap-x-2 cursor-pointer"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.pfp_url} alt={user.display_name} />
                  </Avatar>
                  <div className="leading-[1.3]">
                    <p className="font-bold opacity-80">{user.display_name}</p>
                    <p className="font-normal opacity-80">@{user.username}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {channels?.length > 0 && (
            <CommandGroup heading="Channels">
              {channels.map((channel: Channel, i: number) => (
                <CommandItem
                  key={`c-${channel.id}-${i}`}
                  onSelect={() => onSelectChannel(channel)}
                  value={channel.id}
                  className="gap-x-2 cursor-pointer"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={channel.image_url || ""} alt={channel.name || channel.id} />
                    <AvatarFallback>
                      {(channel.name || channel.id || "").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-[1.3]">
                    <p className="font-bold opacity-80">{channel.name || channel.id}</p>
                    <p className="font-normal opacity-80">/{channel.id}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {tokens?.length > 0 && (
            <CommandGroup heading="Tokens">
              {tokens.map((token: TokenResult, i: number) => (
                <CommandItem
                  key={`t-${i}`}
                  onSelect={() => onSelectToken(token)}
                  value={token.name}
                  className="gap-x-2 cursor-pointer"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={token.image || ""} alt={token.name} />
                  </Avatar>
                  <div className="leading-[1.3]">
                    <p className="font-bold opacity-80">{token.name}</p>
                    <p className="font-normal opacity-80">
                      {token.symbol} • {token.contractAddress}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {query && !loading && <CommandEmpty>No results found</CommandEmpty>}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchAutocompleteInput;

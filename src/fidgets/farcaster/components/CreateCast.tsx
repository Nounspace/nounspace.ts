import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CastAddBody,
  CastType,
  Embed,
  FarcasterNetwork,
  makeCastAdd,
  Signer,
} from "@farcaster/core";
import { Address, formatUnits, zeroAddress } from "viem";
import { base } from "viem/chains";
import { useBalance } from "wagmi";
import { debounce, isUndefined, map } from "lodash";
import { GoSmiley } from "react-icons/go";
import { HiOutlineSparkles } from "react-icons/hi2";
import { PhotoIcon } from "@heroicons/react/20/solid";
import EmojiPicker, {
  EmojiClickData,
  Theme,
} from "emoji-picker-react";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { Button } from "@/common/components/atoms/button";
import Spinner from "@/common/components/atoms/spinner";
import { useAppStore } from "@/common/data/stores/app";
import { useBannerStore } from "@/common/stores/bannerStore";
import { usePrivy } from "@privy-io/react-auth";
import { useFarcasterSigner } from "..";
import {
  fetchChannelsByName,
  fetchChannelsForUser,
  isFarcasterUrlEmbed,
  submitCast,
} from "../utils";
import { ChannelPicker } from "./channelPicker";
import { renderEmbedForUrl } from "./Embeds";
import {
  Channel,
  FarcasterEmbed,
  FarcasterMention,
} from "../types";
import { hexToBytes } from "@noble/ciphers/utils";

const SPACE_CONTRACT_ADDR = "0x48c6740bcf807d6c47c864faeea15ed4da3910ab";
const SPARKLES_BANNER_KEY = "sparkles-banner-v1";
const MAX_CAST_CHARS = 320;

const mentionFidCache = new Map<string, string>();

const defaultChannel: Channel = {
  id: "home",
  name: "Home",
  parent_url: null,
  description: null,
  image_url: null,
};

type ParentCastIdType = {
  fid: number;
  hash: Uint8Array;
};

export enum DraftStatus {
  writing = "writing",
  publishing = "publishing",
  published = "published",
  removed = "removed",
}

export type DraftType = {
  text: string;
  status: DraftStatus;
  mentionsToFids?: { [key: string]: string };
  embeds?: FarcasterEmbed[];
  parentUrl?: string;
  parentCastId?: ParentCastIdType;
  mentionsPositions?: number[];
};

type CreateCastProps = {
  initialDraft?: Partial<DraftType>;
  afterSubmit?: () => void;
};

const fetchNeynarMentions = async (
  query: string,
): Promise<FarcasterMention[]> => {
  try {
    if (query === "") return [];
    const res = await fetch(
      `/api/search/users?q=${encodeURIComponent(query)}&limit=10`,
    );
    const data = await res.json();
    const users = data?.value?.users || [];
    return users.map((user: any) => ({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.pfp_url,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const useMentionSuggestions = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FarcasterMention[]>([]);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) {
          setSuggestions([]);
          return;
        }
        const results = await fetchNeynarMentions(value);
        setSuggestions(results);
      }, 200),
    [],
  );

  useEffect(() => {
    debouncedFetch(query);
    return () => {
      debouncedFetch.cancel();
    };
  }, [query, debouncedFetch]);

  return {
    suggestions,
    setQuery,
    clear: () => {
      setSuggestions([]);
      setQuery("");
    },
  };
};

const CastLengthIndicator: React.FC<{ text: string }> = ({ text }) => {
  const remaining = MAX_CAST_CHARS - text.length;
  const isOver = remaining < 0;
  return (
    <div
      className={`text-sm ${isOver ? "text-red-500" : "text-muted-foreground"}`}
    >
      {remaining}
    </div>
  );
};

const CreateCast: React.FC<CreateCastProps> = ({
  initialDraft,
  afterSubmit = () => {},
}) => {
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState<DraftType>({
    text: initialDraft?.text ?? "",
    status: DraftStatus.writing,
    embeds: initialDraft?.embeds ?? [],
    ...initialDraft,
  });
  const [textValue, setTextValue] = useState(initialDraft?.text ?? "");
  const [embeds, setEmbeds] = useState<FarcasterEmbed[]>(
    initialDraft?.embeds ?? [],
  );
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const hasEmbeds = (draft.embeds?.length ?? 0) > 0;
  const isReply = draft?.parentCastId !== undefined;
  const { signer, isLoadingSigner, fid } = useFarcasterSigner("create-cast");
  const [initialChannels, setInitialChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    initialDraft?.parentUrl
      ? {
          ...defaultChannel,
          parent_url: initialDraft.parentUrl,
        }
      : null,
  );
  const [isPickingEmoji, setIsPickingEmoji] = useState<boolean>(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const mentionSuggestions = useMentionSuggestions();
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);

  const { isBannerClosed, closeBanner } = useBannerStore();
  const sparklesBannerClosed = isBannerClosed(SPARKLES_BANNER_KEY);

  const { user } = usePrivy();
  const result = useBalance({
    address: (user?.wallet?.address as Address) || zeroAddress,
    token: SPACE_CONTRACT_ADDR,
    chainId: base.id,
  });
  const spaceHoldAmount = result?.data
    ? parseInt(formatUnits(result.data.value, result.data.decimals))
    : 0;
  const userHoldEnoughSpace = spaceHoldAmount >= 1111;
  const { hasNogs } = useAppStore((state) => ({
    hasNogs: state.account.hasNogs,
  }));
  const [showEnhanceBanner, setShowEnhanceBanner] = useState(false);

  useEffect(() => {
    const fetchInitialChannels = async () => {
      if (!fid) return;
      const fetchedChannels = await fetchChannelsForUser(fid);
      setInitialChannels(fetchedChannels);
      if (!selectedChannel && fetchedChannels.length) {
        setSelectedChannel(fetchedChannels[0]);
      }
    };
    fetchInitialChannels();
  }, [fid]);

  const addEmbed = useCallback((embed: FarcasterEmbed) => {
    setEmbeds((prev) => [...prev, embed]);
  }, []);

  const debouncedGetChannels = useMemo(
    () =>
      debounce(
        async (query: string) => {
          return fetchChannelsByName(query);
        },
        200,
        { leading: true, trailing: false },
      ),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedGetChannels.cancel();
    };
  }, [debouncedGetChannels]);

  const debouncedPasteUpload = useMemo(
    () =>
      debounce(async (file: File) => {
        setIsUploadingImage(true);
        try {
          const url = await uploadImageToImgBB(file);
          addEmbed({ url });
        } catch (err) {
          alert("Error uploading image: " + (err as Error).message);
        } finally {
          setIsUploadingImage(false);
        }
      }, 300, { leading: true, trailing: false }),
    [addEmbed],
  );

  useEffect(() => {
    return () => {
      debouncedPasteUpload.cancel();
    };
  }, [debouncedPasteUpload]);

  const updateMentionQuery = useCallback(
    (value: string, cursorPosition: number | null) => {
      if (cursorPosition === null) {
        mentionSuggestions.clear();
        setShowMentionSuggestions(false);
        setMentionStartIndex(null);
        return;
      }

      const textUntilCursor = value.slice(0, cursorPosition);
      const atIndex = textUntilCursor.lastIndexOf("@");

      if (atIndex === -1) {
        mentionSuggestions.clear();
        setShowMentionSuggestions(false);
        setMentionStartIndex(null);
        return;
      }

      const charBefore = textUntilCursor[atIndex - 1];
      if (charBefore && !/[\s(]/.test(charBefore)) {
        mentionSuggestions.clear();
        setShowMentionSuggestions(false);
        setMentionStartIndex(null);
        return;
      }

      const fragment = textUntilCursor.slice(atIndex + 1);
      if (fragment.includes(" ") || fragment.includes("\n")) {
        mentionSuggestions.clear();
        setShowMentionSuggestions(false);
        setMentionStartIndex(null);
        return;
      }

      setMentionStartIndex(atIndex);
      setShowMentionSuggestions(true);
      mentionSuggestions.setQuery(fragment);
    },
    [mentionSuggestions],
  );

  const handleTextChange = useCallback(
    (value: string, cursorPosition: number | null) => {
      setTextValue(value);
      setSubmitStatus("idle");
      updateMentionQuery(value, cursorPosition);
    },
    [updateMentionQuery],
  );

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { value, selectionStart } = event.target;
    setSelectionStart(selectionStart ?? null);
    handleTextChange(value, selectionStart ?? null);
  };

  const handleTextareaSelect = (
    event: React.SyntheticEvent<HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLTextAreaElement;
    const position = target.selectionStart ?? null;
    setSelectionStart(position);
    updateMentionQuery(target.value, position);
  };

  const handleTextareaKeyUp = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const target = event.currentTarget;
    const position = target.selectionStart ?? null;
    setSelectionStart(position);
    updateMentionQuery(target.value, position);

    if (event.key === "Escape") {
      setShowMentionSuggestions(false);
      mentionSuggestions.clear();
      setMentionStartIndex(null);
    }
  };

  const handleMentionSelect = (mention: FarcasterMention) => {
    if (selectionStart === null || mentionStartIndex === null) return;
    const before = textValue.slice(0, mentionStartIndex);
    const after = textValue.slice(selectionStart);
    const mentionText = `@${mention.username}`;
    const newText = `${before}${mentionText} ${after}`;
    mentionFidCache.set(mention.username, mention.fid.toString());
    setShowMentionSuggestions(false);
    mentionSuggestions.clear();
    setMentionStartIndex(null);
    setTextValue(newText);

    requestAnimationFrame(() => {
      const cursor = before.length + mentionText.length + 1;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(cursor, cursor);
      setSelectionStart(cursor);
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith("image/")) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadImageToImgBB(file);
      addEmbed({ url });
    } catch (err) {
      alert("Error uploading image: " + (err as Error).message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadImageToImgBB(file);
      addEmbed({ url });
    } catch (err) {
      alert("Error uploading image: " + (err as Error).message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) throw new Error("imgBB API key not found");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await res.json();
    if (!data.success)
      throw new Error(data.error?.message || "Failed to upload to ImgBB");

    return data.data.display_url || data.data.url;
  };

  useEffect(() => {
    if (draft?.text && initialDraft?.text && !textValue) {
      setTextValue(initialDraft.text);
    }
  }, [draft?.text, initialDraft?.text, textValue]);

  const isPublishing = draft?.status === DraftStatus.publishing;
  const isPublished = draft?.status === DraftStatus.published;
  const submissionError = submitStatus === "error";

  useEffect(() => {
    if (isPublishing) return;

    let active = true;

    const computeDraft = async () => {
      const newEmbeds = embeds;
      const usernamePattern =
        /(?:^|[\s(])@([a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?)(?=[\s.,!?;:)]|$)/g;
      const workingText = textValue;
      const usernamesWithPositions = [
        ...workingText.matchAll(usernamePattern),
      ].map((match) => ({
        username: match[1],
        position: match.index! + match[0].indexOf("@"),
      }));

      const uniqueUsernames = Array.from(
        new Set(usernamesWithPositions.map((u) => u.username)),
      );

      const mentionsToFids: { [key: string]: string } = {};
      const mentionsPositions: number[] = [];
      let mentionsText = textValue;

      if (uniqueUsernames.length > 0) {
        const uncachedUsernames = uniqueUsernames.filter(
          (username) =>
            !mentionFidCache.has(username) || !mentionFidCache.get(username),
        );

        uniqueUsernames.forEach((username) => {
          const cachedFid = mentionFidCache.get(username);
          if (cachedFid) {
            mentionsToFids[username] = cachedFid;
          }
        });

        if (uncachedUsernames.length > 0) {
          try {
            const query = encodeURIComponent(uncachedUsernames.join(","));
            const res = await fetch(
              `/api/farcaster/neynar/getFids?usernames=${query}`,
            );
            const fetchedMentions = await res.json();

            if (Array.isArray(fetchedMentions)) {
              fetchedMentions.forEach((mention: any) => {
                if (mention && mention.username && mention.fid) {
                  const fidString = mention.fid.toString();
                  mentionsToFids[mention.username] = fidString;
                  mentionFidCache.set(mention.username, fidString);
                }
              });
            }
          } catch (err) {
            console.error("Failed to fetch FIDs in batch:", err);
          }
        }

        let cumulativeOffset = 0;
        const mentionMatches = [...textValue.matchAll(usernamePattern)];

        for (const match of mentionMatches) {
          const fullMatch = match[0];
          const username = match[1];
          const atIndex = match.index! + fullMatch.indexOf("@");
          const adjustedPosition = atIndex - cumulativeOffset;

          if (mentionsToFids[username]) {
            mentionsPositions.push(adjustedPosition);
            mentionsText =
              mentionsText.slice(0, adjustedPosition) +
              mentionsText.slice(adjustedPosition + username.length + 1);
            cumulativeOffset += username.length + 1;
          }
        }

        if (
          Object.keys(mentionsToFids).length !== mentionsPositions.length &&
          mentionsPositions.length > 0
        ) {
          console.error(
            "Mismatch between mentions and their positions:",
            mentionsToFids,
            mentionsPositions,
          );
        }
      }

      if (!active) return;

      setDraft((prevDraft) => ({
        ...prevDraft,
        text: mentionsText,
        embeds: newEmbeds,
        parentUrl: selectedChannel?.parent_url || undefined,
        mentionsToFids,
        mentionsPositions,
      }));
    };

    computeDraft();

    return () => {
      active = false;
    };
  }, [textValue, embeds, selectedChannel, isPublishing]);

  const formatEmbedsForCast = (items: FarcasterEmbed[] = []): Embed[] => {
    return items.map((embed) => {
      if (embed.castId) {
        const hashValue =
          typeof embed.castId.hash === "string"
            ? hexToBytes(
                embed.castId.hash.startsWith("0x")
                  ? embed.castId.hash.slice(2)
                  : embed.castId.hash,
              )
            : embed.castId.hash;

        return {
          castId: {
            fid: embed.castId.fid,
            hash: hashValue,
          },
        };
      }

      return { url: embed.url } as Embed;
    });
  };

  const publishPost = async (
    currentDraft: DraftType,
    currentFid: number,
    currentSigner: Signer,
  ): Promise<{ success: boolean; message?: string }> => {
    if (currentDraft.parentCastId) {
      const { hash } = currentDraft.parentCastId;
      if (hash.length !== 20) {
        return {
          success: false,
          message: "Invalid parent cast ID hash length.",
        };
      }
    }

    const mentions = currentDraft.mentionsToFids
      ? Object.values(currentDraft.mentionsToFids).map(Number)
      : [];
    const mentionsPositions = currentDraft.mentionsPositions || [];

    const formattedEmbeds = formatEmbedsForCast(currentDraft.embeds);

    const castBody: CastAddBody = {
      type: CastType.CAST,
      text: currentDraft.text,
      embeds: formattedEmbeds,
      embedsDeprecated: [],
      parentUrl: currentDraft.parentUrl || undefined,
      parentCastId: currentDraft.parentCastId,
      mentions,
      mentionsPositions,
    };

    const castAddMessageResp = await makeCastAdd(
      castBody,
      { fid: currentFid, network: FarcasterNetwork.MAINNET },
      currentSigner,
    );

    if (!castAddMessageResp.isOk()) {
      return {
        success: false,
        message: "Invalid cast data: " + castAddMessageResp.error.message,
      };
    }

    try {
      const result = await submitCast(
        castAddMessageResp.value,
        currentFid,
        currentSigner,
      );
      if (result) {
        return { success: true };
      } else {
        return { success: false, message: "Failed to submit cast." };
      }
    } catch (e) {
      return {
        success: false,
        message: "An error occurred while submitting the cast.",
      };
    }
  };

  const onSubmitPost = async (): Promise<boolean> => {
    if (
      (!draft?.text && !draft?.embeds?.length) ||
      isUndefined(signer) ||
      !fid
    ) {
      console.error("Submission failed: Missing data or signer.", {
        draftText: draft?.text,
        draftEmbedsLength: draft?.embeds?.length,
        signerUndefined: isUndefined(signer),
        fid,
      });
      return false;
    }

    if (
      (draft.mentionsPositions?.length || 0) > 0 &&
      Object.keys(draft.mentionsToFids || {}).length === 0
    ) {
      console.error("Mentions not fully resolved yet.", {
        mentionsPositions: draft.mentionsPositions,
        mentionsToFids: draft.mentionsToFids,
      });
      return false;
    }

    try {
      const result = await publishPost(draft, fid, signer);

      if (result.success) {
        setSubmitStatus("success");
        setDraft((prev) => ({ ...prev, status: DraftStatus.published }));
        setTimeout(() => {
          afterSubmit();
        }, 3000);
      } else {
        console.error(`Failed to publish post: ${result.message || "Unknown"}`);
        setSubmitStatus("error");
        setDraft((prev) => ({ ...prev, status: DraftStatus.writing }));
      }

      return result.success;
    } catch (error) {
      console.error(
        "An unexpected error occurred during post submission:",
        error,
      );
      setSubmitStatus("error");
      setDraft((prev) => ({ ...prev, status: DraftStatus.writing }));
      return false;
    }
  };

  const getButtonText = () => {
    if (isLoadingSigner) return "Not signed into Farcaster";
    if (isPublishing) return "Publishing...";
    if (submissionError) return "Retry";
    if (isPublished) return "Published!";
    return "Cast";
  };

  const handleEmojiClick = (
    emojiObject: EmojiClickData,
    event: MouseEvent,
  ) => {
    event.stopPropagation();
    const emoji = emojiObject.emoji;
    const target = textareaRef.current;
    if (!target) return;

    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? start;

    const newValue =
      textValue.slice(0, start) + emoji + textValue.slice(end);
    const newCursor = start + emoji.length;

    setTextValue(newValue);
    requestAnimationFrame(() => {
      target.focus();
      target.setSelectionRange(newCursor, newCursor);
      setSelectionStart(newCursor);
      updateMentionQuery(newValue, newCursor);
    });

    setIsPickingEmoji(false);
  };

  const handleEnhanceCast = async (text: string) => {
    if (isEnhancing) return;

    if (!sparklesBannerClosed) {
      closeBanner(SPARKLES_BANNER_KEY);
    }

    if (!userHoldEnoughSpace && !hasNogs) {
      setShowEnhanceBanner(true);
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/venice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, fid }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to enhance text:", errorText);
        throw new Error("Failed to enhance text");
      }

      const result = await response.json();
      setTextValue(result.response);
      requestAnimationFrame(() => {
        const cursor = result.response.length;
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(cursor, cursor);
        updateMentionQuery(result.response, cursor);
      });
    } catch (error) {
      console.error("Error enhancing text:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPublishing) return;
    setDraft((prev) => ({ ...prev, status: DraftStatus.publishing }));
    const success = await onSubmitPost();
    if (!success) {
      setDraft((prev) => ({ ...prev, status: DraftStatus.writing }));
    }
  };

  return (
    <div className="flex flex-col items-start min-w-full w-full h-full" tabIndex={-1}>
      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {isPublishing ? (
          <div className="w-full h-full min-h-[150px]">{draft.text}</div>
        ) : (
          <div
            className={`p-2 border-slate-200 rounded-lg border relative ${
              isDragging ? "ring-2 ring-blue-400 bg-blue-50" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragging && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-100/80 pointer-events-none rounded-lg">
                <span className="text-blue-700 font-semibold text-lg">
                  Drop the image here…
                </span>
              </div>
            )}
            {isUploadingImage && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 pointer-events-none rounded-lg">
                <Spinner style={{ width: "40px", height: "40px" }} />
                <span className="ml-2 text-gray-700 font-medium">
                  Uploading image…
                </span>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextareaChange}
              onSelect={handleTextareaSelect}
              onKeyUp={handleTextareaKeyUp}
              onPaste={(e) => {
                if (!e.clipboardData || !e.clipboardData.items) return;
                for (let i = 0; i < e.clipboardData.items.length; i++) {
                  const item = e.clipboardData.items[i];
                  const file = item.getAsFile();
                  if (file && file.type.startsWith("image/")) {
                    e.preventDefault();
                    debouncedPasteUpload(file);
                  }
                }
              }}
              className="w-full h-full min-h-[150px] resize-none bg-transparent focus:outline-none"
              placeholder="What's happening?"
            />
            {showMentionSuggestions && mentionSuggestions.suggestions.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg">
                {mentionSuggestions.suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.username}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleMentionSelect(item)}
                  >
                    <div
                      className="h-12 w-12 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.avatar_url})` }}
                    />
                    <div>
                      <div className="text-sm font-bold">{item.display_name}</div>
                      <div className="text-sm font-bold text-muted-foreground">
                        @{item.username}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mt-2 rounded bg-red-100 p-2 text-red-800">
            An error occurred while submitting the cast.
          </div>
        )}

        <div
          className={
            isMobile ? "flex flex-col gap-2 pt-2" : "flex flex-row gap-1 pt-2"
          }
        >
          <div
            className={
              isMobile
                ? "flex w-full flex-row justify-between"
                : "flex flex-row gap-1 md:justify-start"
            }
          >
            <div className={isMobile ? "flex flex-row gap-1" : ""}>
              {!isReply && (
                <div className="opacity-80">
                  {isPublishing || isLoadingSigner ? (
                    selectedChannel?.name || ""
                  ) : (
                    <ChannelPicker
                      getChannels={debouncedGetChannels}
                      onSelect={(channel) => {
                        setSelectedChannel(channel);
                      }}
                      value={selectedChannel || initialChannels[0] || defaultChannel}
                      initialChannels={initialChannels}
                    />
                  )}
                </div>
              )}

              {isMobile && (
                <Button
                  className="h-10"
                  type="button"
                  variant="outline"
                  disabled={isPublishing}
                  onClick={handleFileButtonClick}
                >
                  <PhotoIcon className="mr-1 h-5 w-5" />
                  Add
                </Button>
              )}
            </div>

            <div className={isMobile ? "flex flex-row gap-1" : ""}>
              {!isMobile && (
                <Button
                  className="h-10"
                  type="button"
                  variant="outline"
                  disabled={isPublishing}
                  onClick={handleFileButtonClick}
                >
                  <PhotoIcon className="mr-1 h-5 w-5" />
                  Add
                </Button>
              )}

              <Button
                className="h-10"
                type="button"
                variant="ghost"
                disabled={isPublishing}
                onClick={() => handleEnhanceCast(textValue)}
              >
                {isEnhancing ? (
                  <Spinner style={{ width: "30px", height: "30px" }} />
                ) : (
                  <HiOutlineSparkles size={20} />
                )}
              </Button>

              <Button
                className="h-10"
                type="button"
                variant="ghost"
                disabled={isPublishing}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPickingEmoji(!isPickingEmoji);
                }}
              >
                <GoSmiley size={20} />
              </Button>
            </div>
          </div>

          {isMobile && (
            <div className="flex w-full flex-row justify-center pt-2">
              <Button
                size="lg"
                type="submit"
                className="line-clamp-1 w-full"
                disabled={isPublishing || isLoadingSigner}
              >
                {getButtonText()}
              </Button>
            </div>
          )}
        </div>

        {!isMobile && (
          <div className="mt-2 flex flex-row items-center gap-2">
            <CastLengthIndicator text={textValue} />
            <div className="grow" />
            <div className="flex flex-row justify-end pt-0">
              <Button
                size="lg"
                variant="primary"
                type="submit"
                className="min-w-40 max-w-xs truncate bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                disabled={isPublishing || isLoadingSigner}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        )}
      </form>

      {isPickingEmoji && (
        <div
          ref={parentRef}
          className="z-50"
          style={{
            opacity: isPickingEmoji ? 1 : 0,
            pointerEvents: isPickingEmoji ? "auto" : "none",
            marginTop: 50,
            transition: "opacity 1s ease",
            position: "absolute",
          }}
        >
          <EmojiPicker
            theme={"light" as Theme}
            onEmojiClick={handleEmojiClick}
            open={isPickingEmoji}
          />
        </div>
      )}

      {!sparklesBannerClosed && !showEnhanceBanner && (
        <div className="mt-2 -mb-4 flex w-full items-center justify-center gap-1 rounded-md bg-orange-100 p-2 text-sm font-medium text-orange-600">
          <p>
            Click the <b>sparkles</b> to enhance a draft cast or generate one
            from scratch.
          </p>
        </div>
      )}

      {showEnhanceBanner && (
        <div className="mt-2 -mb-4 flex w-full items-center justify-center gap-1 rounded-md bg-red-100 p-2 text-sm font-medium text-red-600">
          <p>
            Hold at least 1,111{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.nounspace.com/t/base/0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab"
              className="font-bold underline"
            >
              $SPACE
            </a>{" "}
            or 1{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://highlight.xyz/mint/base:0xD094D5D45c06c1581f5f429462eE7cCe72215616"
              className="font-bold underline"
            >
              nOGs
            </a>{" "}
            to unlock generation
          </p>
        </div>
      )}

      {hasEmbeds && (
        <div className="mt-8 w-full break-all rounded-md bg-muted p-2">
          {map(draft.embeds, (embed, index) => (
            <div
              key={`cast-embed-${
                isFarcasterUrlEmbed(embed)
                  ? embed.url
                  : typeof embed.castId?.hash === "string"
                  ? embed.castId.hash
                  : Array.from(embed.castId?.hash || []).join("-")
              }-${index}`}
            >
              {renderEmbedForUrl(embed, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateCast;

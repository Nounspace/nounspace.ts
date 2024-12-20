import React, { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@mod-protocol/react-editor";
import { EmbedsEditor } from "@mod-protocol/react-ui-shadcn/dist/lib/embeds";
import {
  ModManifest,
  fetchUrlMetadata,
  handleAddEmbed,
  handleOpenFile,
  handleSetInput,
} from "@mod-protocol/core";
import {
  getFarcasterMentions,
  formatPlaintextToHubCastMessage,
  getMentionFidsByUsernames,
} from "@mod-protocol/farcaster";
import { createRenderMentionsSuggestionConfig } from "@mod-protocol/react-ui-shadcn/dist/lib/mentions";
import { CastLengthUIIndicator } from "@mod-protocol/react-ui-shadcn/dist/components/cast-length-ui-indicator";
import { debounce, map, isEmpty, isUndefined } from "lodash";
import { Button } from "@/common/components/atoms/button";
import { MentionList } from "./mentionList";
import { ChannelList } from "@mod-protocol/react-ui-shadcn/dist/components/channel-list";
import { ChannelPicker } from "./channelPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/atoms/popover";
import { CreationMod } from "@mod-protocol/react";
import { creationMods } from "@mod-protocol/mod-registry";
import { renderers } from "@mod-protocol/react-ui-shadcn/dist/renderers";
import { renderEmbedForUrl } from "./Embeds";
import { PhotoIcon } from "@heroicons/react/20/solid";
import { FarcasterEmbed, isFarcasterUrlEmbed } from "@mod-protocol/farcaster";
import { CastType, Signer } from "@farcaster/core";
import { useFarcasterSigner } from "..";
import {
  fetchChannelsByName,
  fetchChannelsForUser,
  submitCast,
} from "../utils";

// Fixed missing imports and incorrect object types
const API_URL = process.env.NEXT_PUBLIC_MOD_PROTOCOL_API_URL!;
const getMentions = getFarcasterMentions(API_URL);

const debouncedGetMentions = debounce(getMentions, 200, {
  leading: true,
  trailing: false,
});
const getUrlMetadata = fetchUrlMetadata(API_URL);

const onError = (err) => {
  console.error(err);
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "development") {
    window.alert(err.message);
  }
};

export type ParentCastIdType = {
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
  mentionsPositions?: number[]; // <-- Add this property
};

type CreateCastProps = {
  initialDraft?: Partial<DraftType>;
  afterSubmit?: () => void;
};

export type ModProtocolCastAddBody = Exclude<
  Awaited<ReturnType<typeof formatPlaintextToHubCastMessage>>,
  false
> & {
  type: CastType;
};

const CreateCast: React.FC<CreateCastProps> = ({
  initialDraft,
  afterSubmit = () => {},
}) => {
  const [currentMod, setCurrentMod] = useState<ModManifest | null>(null);
  const [initialEmbeds, setInitialEmbeds] = useState<FarcasterEmbed[]>();
  const [draft, setDraft] = useState<DraftType>({
    text: "",
    status: DraftStatus.writing,
    ...initialDraft,
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const hasEmbeds = draft?.embeds && !!draft.embeds.length;
  const isReply = draft?.parentCastId !== undefined;
  const { signer, isLoadingSigner, fid } = useFarcasterSigner("create-cast");
  const [initialChannels, setInitialChannels] = useState() as any;

  useEffect(() => {
    const fetchInitialChannels = async () => {
      const initial_channels = await fetchChannelsForUser(fid);
      setInitialChannels(initial_channels);
    };
    fetchInitialChannels();
  }, [fid]);

  const debouncedGetChannels = useCallback(
    debounce(
      async (query: string) => {
        return await fetchChannelsByName(query);
      },
      200,
      { leading: true, trailing: false },
    ),
    [],
  );

  const onSubmitPost = async (): Promise<boolean> => {
    if ((!draft?.text && !draft?.embeds?.length) || isUndefined(signer)) {
      console.error(
        "Submission failed: Missing text or embeds, or signer is undefined.",
        {
          draftText: draft?.text,
          draftEmbedsLength: draft?.embeds?.length,
          signerUndefined: isUndefined(signer),
        },
      );
      return false;
    }

    // Delay submission only if there are mentions and they are not resolved
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
        console.error(
          `Failed to publish post: ${result.message || "Unknown error"}`,
        );
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

  const isPublishing = draft?.status === DraftStatus.publishing;
  const isPublished = draft?.status === DraftStatus.published;
  const submissionError = submitStatus === "error";

  const {
    editor,
    getText,
    addEmbed,
    getEmbeds,
    setEmbeds,
    setChannel,
    getChannel,
    handleSubmit,
    setText,
  } = useEditor({
    fetchUrlMetadata: getUrlMetadata,
    onError,
    onSubmit: onSubmitPost,
    linkClassName: "text-blue-300",
    renderChannelsSuggestionConfig: createRenderMentionsSuggestionConfig({
      getResults: debouncedGetChannels,
      RenderList: ChannelList,
    }),
    renderMentionsSuggestionConfig: createRenderMentionsSuggestionConfig({
      getResults: debouncedGetMentions,
      RenderList: MentionList,
    }),
    editorOptions: {
      parseOptions: {
        preserveWhitespace: "full",
      },
    },
  });

  useEffect(() => {
    if (!text && draft?.text && isEmpty(draft.mentionsToFids)) {
      editor?.commands.setContent(
        `<p>${draft.text.replace(/\n/g, "<br>")}</p>`,
        true,
        {
          preserveWhitespace: "full",
        },
      );
    }

    if (draft?.embeds) {
      setInitialEmbeds(draft.embeds);
    }
  }, [editor]);

  const text = getText();
  const embeds = getEmbeds();
  const channel = getChannel();
  useEffect(() => {
    if (!editor) return;
    if (isPublishing) return;

    const fetchMentionsAndSetDraft = async () => {
      const newEmbeds = initialEmbeds ? [...embeds, ...initialEmbeds] : embeds;

      // Regex to match pure @username mentions, ensuring it's not part of a URL
      const usernamePattern = /(?:^|\s|^)@([a-zA-Z0-9_.]+)(?=\s|$)/g;

      // The working copy of the text for position calculation
      const workingText = text;

      // Extract mentions and their positions from the original text
      const usernamesWithPositions = [
        ...workingText.matchAll(usernamePattern),
      ].map((match) => ({
        username: match[1],
        position: match.index! + match[0].indexOf("@"), // Adjust position to '@'
      }));

      const uniqueUsernames = Array.from(
        new Set(usernamesWithPositions.map((u) => u.username)),
      );

      let mentionsToFids: { [key: string]: string } = {};
      let mentionsPositions: number[] = [];
      let mentionsText = text; // Initialize mentionsText with current text

      if (uniqueUsernames.length > 0) {
        try {
          // Fetch the FIDs for the mentioned users
          const fetchedMentions =
            await getMentionFidsByUsernames(API_URL)(uniqueUsernames);

          mentionsToFids = fetchedMentions.reduce(
            (acc, mention) => {
              if (mention && mention.username && mention.fid) {
                acc[mention.username] = mention.fid.toString(); // Convert fid to string
              }
              return acc;
            },
            {} as { [key: string]: string },
          );

          mentionsPositions = [];
          // const currentTextIndex = 0;
          // const finalText = text;
          const mentions = [];
          mentionsText = text;

          for (let i = 0; i < mentionsText.length; i++) {
            if (
              mentionsText[i] === "@" &&
              ((mentionsText[i - 1] !== "/" &&
                !/^[a-zA-Z0-9]+$/.test(mentionsText[i - 1])) ||
                mentionsText[i - 1] === undefined)
            ) {
              let mentionIndex = i + 1;
              while (
                mentionIndex < mentionsText.length &&
                mentionsText[mentionIndex] !== " " &&
                mentionsText[mentionIndex] !== "\n"
              )
                mentionIndex++;
              const mention = mentionsText.substring(i + 1, mentionIndex);
              const position = i;
              mentionsPositions.push(position);
              mentionsText = mentionsText.replace(`@${mention}`, "");
            }
          }

          console.log(mentions);
          console.log("mentionsText.length" + mentionsText.length);
          if (mentions.length > 10)
            console.log("only up to 10 mentions. " + mentions.length);
          if (Object.keys(mentionsToFids).length !== mentionsPositions.length) {
            console.error(
              "Mismatch between mentions and their positions:",
              mentionsToFids,
              mentionsPositions,
            );
          }
        } catch (error) {
          console.error("Error fetching FIDs:", error);
        }
      }

      // Update the draft regardless of mentions
      setDraft((prevDraft) => {
        const updatedDraft = {
          ...prevDraft,
          text: mentionsText,
          embeds: newEmbeds,
          parentUrl: channel?.parent_url || undefined,
          mentionsToFids,
          mentionsPositions,
        };
        console.log("Updated Draft before posting:", updatedDraft);
        return updatedDraft;
      });
    };

    fetchMentionsAndSetDraft();
  }, [text, embeds, initialEmbeds, channel, isPublishing, editor]);

  async function publishPost(
    draft: DraftType,
    fid: number,
    signer: Signer,
  ): Promise<{ success: boolean; message?: string }> {
    if (draft.parentCastId) {
      const { fid, hash } = draft.parentCastId;
      if (hash.length !== 20) {
        return {
          success: false,
          message: "Invalid parent cast ID hash length.",
        };
      }
    }

    // Prepare the mentions and their positions
    const mentions = draft.mentionsToFids
      ? Object.values(draft.mentionsToFids).map(Number)
      : [];
    const mentionsPositions = draft.mentionsPositions || []; // Use the correct positions

    const unsignedCastBody: ModProtocolCastAddBody = {
      type: CastType.CAST,
      text: draft.text,
      embeds: draft.embeds || [],
      parentUrl: draft.parentUrl || undefined,
      parentCastId: draft.parentCastId
        ? {
            fid: draft.parentCastId.fid,
            hash: draft.parentCastId.hash,
          }
        : undefined,
      mentions, // Pass mentions (FIDs)
      mentionsPositions, // Pass positions here
      embedsDeprecated: [],
    };

    if (!unsignedCastBody)
      return { success: false, message: "Invalid cast data." };

    try {
      const result = await submitCast(
        { ...unsignedCastBody, type: CastType.CAST },
        fid,
        signer,
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
  }

  const getButtonText = () => {
    if (isLoadingSigner) return "Not signed into Farcaster";
    if (isPublishing) return "Publishing...";
    if (submissionError) return "Retry";
    if (isPublished) return "Published!";
    return "Cast";
  };

  return (
    <div
      className="flex flex-col items-start min-w-full w-full h-full"
      tabIndex={-1}
    >
      <form onSubmit={handleSubmit} className="w-full">
        {isPublishing ? (
          <div className="w-full h-full min-h-[150px]">{draft.text}</div>
        ) : (
          <div className="p-2 border-slate-200 rounded-lg border">
            <EditorContent
              editor={editor}
              autoFocus
              className="w-full h-full min-h-[150px] opacity-80"
            />
            <div className="z-50">
              <EmbedsEditor
                embeds={embeds}
                setEmbeds={setEmbeds}
                RichEmbed={() => <div />}
              />
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            An error occurred while submitting the cast.
          </div>
        )}

        <div className="flex flex-row pt-2 gap-1">
          {!isReply && (
            <div className="opacity-80">
              {isPublishing || isLoadingSigner ? (
                channel?.name
              ) : (
                <ChannelPicker
                  getChannels={debouncedGetChannels}
                  onSelect={(selectedChannel) => {
                    setChannel(selectedChannel);
                  }}
                  value={channel}
                  initialChannels={initialChannels}
                />
              )}
            </div>
          )}
          <Button
            className="h-10"
            type="button"
            variant="outline"
            disabled={isPublishing}
            onClick={() => setCurrentMod(creationMods[0])}
          >
            <PhotoIcon className="mr-1 w-5 h-5" />
            Add
          </Button>
          <Popover
            open={!!currentMod}
            onOpenChange={(op: boolean) => {
              if (!op) setCurrentMod(null);
            }}
          >
            <PopoverTrigger></PopoverTrigger>
            <PopoverContent className="w-[300px]">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">{currentMod?.name}</h4>
                <hr />
                <CreationMod
                  input={text}
                  embeds={embeds}
                  api={API_URL}
                  variant="creation"
                  manifest={currentMod!}
                  renderers={renderers}
                  onOpenFileAction={handleOpenFile}
                  onExitAction={() => setCurrentMod(null)}
                  onSetInputAction={handleSetInput(setText)}
                  onAddEmbedAction={handleAddEmbed(addEmbed)}
                />
              </div>
            </PopoverContent>
          </Popover>
          <CastLengthUIIndicator getText={getText} />
          <div className="grow"></div>
          <div className="flex flex-row pt-0 justify-end">
            <Button
              size="lg"
              type="submit"
              className="line-clamp-1 min-w-40 max-w-xs truncate"
              disabled={isPublishing || isLoadingSigner}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </form>
      {hasEmbeds && (
        <div className="mt-8 rounded-md bg-muted p-2 w-full break-all">
          {map(draft.embeds, (embed) => (
            <div
              key={`cast-embed-${isFarcasterUrlEmbed(embed) ? embed.url : embed.castId.hash}`}
            >
              {renderEmbedForUrl(embed)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateCast;

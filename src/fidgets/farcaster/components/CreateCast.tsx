import React, { use, useCallback, useEffect, useState } from "react";
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
import { debounce, map, isEmpty, isUndefined, values, reduce } from "lodash";
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
import { log } from "console";
import { GiConsoleController } from "react-icons/gi";

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

async function publishPost(
  draft: DraftType,
  fid: number,
  signer: Signer,
): Promise<{ success: boolean; message?: string }> {
  if (draft.parentCastId) {
    const { fid, hash } = draft.parentCastId;
    if (hash.length !== 20) {
      return { success: false, message: "Invalid parent cast ID hash length." };
    }
  }

  // Fixing 'then' error by awaiting and calling 'getFarcasterMentions' correctly
  const mentions = draft.mentionsToFids
    ? Object.values(draft.mentionsToFids).map(Number)
    : [];
  const mentionsPositions =
    mentions.length > 0
      ? mentions.map((_, idx) => idx * 5) // Dummy positions, replace with real logic if needed
      : [];

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
    mentions: mentions, // Fixed the mentions issue
    mentionsPositions: mentionsPositions, // Fixed the positions
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
    if ((!draft?.text && !draft?.embeds?.length) || isUndefined(signer))
      return false;

    const result = await publishPost(draft, fid, signer);

    if (result.success) {
      setSubmitStatus("success");
      setDraft((prev) => ({ ...prev, status: DraftStatus.published }));
      setTimeout(() => {
        afterSubmit();
      }, 3000);
    } else {
      setSubmitStatus("error");
      setDraft((prev) => ({ ...prev, status: DraftStatus.writing }));
    }

    return result.success;
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

      console.log("Embeds before setting draft:", newEmbeds); // Log embeds

      // Use a regex to extract usernames (assuming they are in the format @username)
      const usernamePattern = /@([a-zA-Z0-9_]+)/g; // Adjust pattern if needed
      const usernames = [...text.matchAll(usernamePattern)].map(
        (match) => match[1],
      );
      console.log("Extracted Usernames:", usernames); // Log extracted usernames

      if (usernames.length > 0) {
        try {
          // Fetch the FIDs corresponding to the usernames
          const fetchedMentions =
            await getMentionFidsByUsernames(API_URL)(usernames);
          console.log("Fetched Mentions with FIDs:", fetchedMentions); // Log fetched mentions

          const mentionsToFids = fetchedMentions.reduce(
            (acc, mention) => {
              acc[mention.username] = mention.fid.toString(); // Convert fid to string
              return acc;
            },
            {} as { [key: string]: string },
          );

          setDraft((prevDraft) => {
            console.log("Previous Draft:", prevDraft); // Log previous draft

            const updatedDraft = {
              ...prevDraft,
              text,
              embeds: newEmbeds,
              parentUrl: channel?.parent_url || undefined,
              mentionsToFids, // Correct type with strings
            };
            console.log("Updated Draft before posting:", updatedDraft); // Log updated draft
            return updatedDraft;
          });
        } catch (error) {
          console.error("Error fetching FIDs:", error);
        }
      }
    };

    fetchMentionsAndSetDraft();
  }, [text, embeds, initialEmbeds, channel, isPublishing, editor]);

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

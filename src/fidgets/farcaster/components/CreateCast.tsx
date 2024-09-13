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
  // getFarcasterChannels,
  formatPlaintextToHubCastMessage,
  getMentionFidsByUsernames,
} from "@mod-protocol/farcaster";
import { createRenderMentionsSuggestionConfig } from "@mod-protocol/react-ui-shadcn/dist/lib/mentions";
import { CastLengthUIIndicator } from "@mod-protocol/react-ui-shadcn/dist/components/cast-length-ui-indicator";
import { debounce, map, isEmpty, isUndefined } from "lodash";
import { Button } from "@/common/components/atoms/button";
import { MentionList } from "@mod-protocol/react-ui-shadcn/dist/components/mention-list";
import { ChannelList } from "@mod-protocol/react-ui-shadcn/dist/components/channel-list";
import { ChannelPicker } from "@mod-protocol/react-ui-shadcn/dist/components/channel-picker";
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
import { bytesToHex } from "@noble/ciphers/utils";

const API_URL = process.env.NEXT_PUBLIC_MOD_PROTOCOL_API_URL!;
const getMentions = getFarcasterMentions(API_URL);

const debouncedGetMentions = debounce(getMentions, 200, {
  leading: true,
  trailing: false,
});
const getUrlMetadata = fetchUrlMetadata(API_URL);
const getMentionFids = getMentionFidsByUsernames(API_URL);

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

async function publishPost(draft: DraftType, fid: number, signer: Signer) {
  console.log("publishPost", draft, fid, signer);
  const unsignedCastBody = await formatPlaintextToHubCastMessage({
    text: draft.text,
    embeds: draft.embeds || [],
    parentUrl: draft.parentUrl,
    parentCastFid: draft.parentCastId?.fid || undefined,
    parentCastHash: !isUndefined(draft.parentCastId?.hash)
      ? bytesToHex(draft.parentCastId.hash)
      : undefined,
    getMentionFidsByUsernames: getMentionFids,
  });

  if (!unsignedCastBody) return false;

  try {
    const result = await submitCast(
      { ...unsignedCastBody, type: CastType.CAST },
      fid,
      signer,
    );
    console.log("API submission response:", result); // Log full response

    if (result) {
      alert("Cast submitted successfully!");
    } else {
      console.error("Cast submission failed. API response:", result);
      alert("Failed to submit cast.");
    }
    return result;
  } catch (e) {
    console.error("Error during cast submission:", e); // Log error details
    alert("An error occurred while submitting the cast.");
    return false;
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

  const hasEmbeds = draft?.embeds && !!draft.embeds.length;
  const isReply = draft?.parentCastId !== undefined;
  console.log(draft?.parentCastId);
  const { signer, isLoadingSigner, fid } = useFarcasterSigner("create-cast");

  const debouncedGetChannels = useCallback(
    debounce(
      async (query: string) => {
        if (query && query !== "") {
          return await fetchChannelsByName(query);
        } else {
          return await fetchChannelsForUser(fid);
        }
      },
      200,
      { leading: true, trailing: false },
    ),
    [fid],
  );

  const onSubmitPost = async (): Promise<boolean> => {
    if ((!draft?.text && !draft?.embeds?.length) || isUndefined(signer))
      return false;
    await publishPost(draft, fid, signer);
    afterSubmit();
    return true;
  };

  const isPublishing = draft?.status === DraftStatus.publishing;
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
    if (!editor) return; // no updates before editor is initialized
    if (isPublishing) return;
    if (draft?.parentUrl === channel?.parent_url) return;

    const newEmbeds = initialEmbeds ? [...embeds, ...initialEmbeds] : embeds;
    setDraft({
      ...draft,
      text,
      embeds: newEmbeds,
      parentUrl: channel?.parent_url || undefined,
    });
  }, [text, embeds, initialEmbeds, channel, isPublishing, editor]);

  const getButtonText = () => {
    if (isLoadingSigner) return "Not signed into Farcaster";
    if (isPublishing) return "Publishing...";
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
              className="w-full h-full min-h-[150px] text-foreground/80"
            />
            <div className="z-50">
              <EmbedsEditor
                embeds={[]}
                setEmbeds={setEmbeds}
                RichEmbed={() => <div />}
              />
            </div>
          </div>
        )}

        <div className="flex flex-row pt-2 gap-1">
          {!isReply && (
            <div className="text-foreground/80">
              {isPublishing || isLoadingSigner ? (
                channel.name
              ) : (
                <ChannelPicker
                  getChannels={debouncedGetChannels}
                  onSelect={setChannel}
                  value={channel}
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
        </div>
        <div className="flex flex-row pt-2 justify-end">
          <Button
            size="lg"
            type="submit"
            className="line-clamp-1 min-w-40 max-w-xs truncate"
            disabled={isPublishing || isLoadingSigner}
          >
            {getButtonText()}
          </Button>
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

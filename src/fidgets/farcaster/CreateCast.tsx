import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import React, { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@mod-protocol/react-editor";
import { EmbedsEditor } from "@mod-protocol/react-ui-shadcn/dist/lib/embeds";
import {
  ModManifest,
  fetchUrlMetadata,
  handleAddEmbed,
  handleOpenFile,
  handleSetInput,
} from "@mod-protocol/core";
import { getFarcasterMentions } from "@mod-protocol/farcaster";
import { createRenderMentionsSuggestionConfig } from "@mod-protocol/react-ui-shadcn/dist/lib/mentions";
import { CastLengthUIIndicator } from "@mod-protocol/react-ui-shadcn/dist/components/cast-length-ui-indicator";
import { debounce, take, map, isEmpty, findIndex } from "lodash";
import { Button } from "@/common/components/atoms/button";
import { MentionList } from "@mod-protocol/react-ui-shadcn/dist/components/mention-list";
import { ChannelPicker } from "./components/ChannelPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/atoms/popover";
import { CreationMod } from "@mod-protocol/react";
import { creationMods } from "@mod-protocol/mod-registry";
import { renderers } from "@mod-protocol/react-ui-shadcn/dist/renderers";
import { renderEmbedForUrl } from "./components/Embeds";
import { PhotoIcon } from "@heroicons/react/20/solid";
import { ChannelList } from "./components/ChannelList";
import { Skeleton } from "@/common/components/atoms//skeleton";
import { FarcasterEmbed, isFarcasterUrlEmbed } from "@mod-protocol/farcaster";
import { Channel } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { Signer } from "@farcaster/core";
import { createFarcasterSignerFromAuthenticatorManager } from ".";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { FARCASTER_AUTHENTICATOR_NAME } from ".";

const createCastProperties: FidgetProperties = {
  fidgetName: "Frame",
  fields: [],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
};

// TO DO: Make these use tanstack query
const getChannels = async (query: string): Promise<Channel[]> => {
  let channels: Channel[] = [];
  if (query.length < 2) return [];
  channels = (await neynarClient.searchChannels(query))?.channels ?? [];
  return take(channels, 10);
};

const getAllChannels = async (): Promise<Channel[]> => {
  try {
    return (await neynarClient.fetchAllChannels())?.channels ?? [];
  } catch (e) {
    console.error(`Error fetching all channels: ${e}`);
    return [];
  }
};

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

async function publishPost(draft: DraftType, signer: Signer) {}

async function CreateCast() {
  const [currentMod, setCurrentMod] = useState<ModManifest | null>(null);
  const [initialEmbeds, setInitialEmbeds] = useState<FarcasterEmbed[]>();
  const [draft, setDraft] = useState<DraftType>({
    text: "",
    status: DraftStatus.writing,
  });

  const hasEmbeds = draft?.embeds && !!draft.embeds.length;
  const isReply = draft?.parentCastId !== undefined;

  const authenticatorManager = useAuthenticatorManager();
  const isLoadingSigner = await useMemo(
    async () =>
      findIndex(
        await authenticatorManager.getInitializedAuthenticators(),
        FARCASTER_AUTHENTICATOR_NAME,
      ) === -1,
    [authenticatorManager],
  );
  const signer = await useMemo(
    async () =>
      await createFarcasterSignerFromAuthenticatorManager(
        authenticatorManager,
        "frame",
      ),
    [authenticatorManager],
  );

  const onSubmitPost = async (): Promise<boolean> => {
    if (!draft?.text && !draft?.embeds?.length) return false;
    await publishPost(draft, signer);
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
      getResults: getChannels,
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
    if (isPublishing) return "Publishing...";
    return "Cast";
  };

  if (!draft) return null;

  return (
    <div
      className="flex flex-col items-start min-w-full w-full h-full"
      tabIndex={-1}
    >
      <form onSubmit={handleSubmit} className="w-full">
        {isPublishing ? (
          <div className="w-full h-full min-h-[150px]">
            <Skeleton className="px-2 py-1 w-full h-full min-h-[150px] text-foreground/80">
              {draft.text}
            </Skeleton>
          </div>
        ) : (
          <div className="p-2 border-slate-200 rounded-lg border">
            <EditorContent
              editor={editor}
              autoFocus
              className="w-full h-full min-h-[150px] text-foreground/80"
            />
            <EmbedsEditor
              embeds={[]}
              setEmbeds={setEmbeds}
              RichEmbed={() => <div />}
            />
          </div>
        )}

        <div className="flex flex-row pt-2 gap-1">
          {!isReply && (
            <div className="text-foreground/80">
              <ChannelPicker
                disabled={isPublishing}
                getChannels={getChannels}
                getAllChannels={getAllChannels}
                // @ts-expect-error - mod protocol channel type mismatch
                onSelect={setChannel}
                // @ts-expect-error - mod protocol channel type mismatch
                value={getChannel()}
              />
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
                  input={getText()}
                  embeds={getEmbeds()}
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
            disabled={isPublishing}
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
}

const exp: FidgetModule<FidgetArgs> = {
  fidget: CreateCast,
  properties: createCastProperties,
};

export default exp;

import React, { useEffect, useState } from "react";

import { FilterType, NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";
import { GetStaticPaths } from "next/types";
import {
  AvatarImage,
  AvatarFallback,
  Avatar,
} from "@/common/ui/atoms/avatar";
import { CardHeader, Card } from "@/common/ui/atoms/card";
import { SelectableListWithHotkeys } from "@/common/ui/components/SelectableListWithHotkeys";
import { CastRow } from "@/common/ui/components/CastRow";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2/openapi-farcaster/models/cast-with-interactions";
import { Tabs, TabsList, TabsTrigger } from "@/common/ui/atoms/tabs";
import { uniqBy } from "lodash";
import { useHotkeys } from "react-hotkeys-hook";
import FollowButton from "@/common/ui/components/FollowButton";
import { useAccountStore } from "@/common/data/stores/useAccountStore";
import { useDataStore } from "@/common/data/stores/useDataStore";
import { APP_FID } from "@/constants/app";
import FrameFidget from "@/fidgets/frame";
import { RiPencilFill } from "react-icons/ri";
import Space from "@/common/ui/templates/Space";

export async function getStaticProps({ params: { slug } }) {
  const client = new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!);
  let user: any = {};
  try {
    if (slug.startsWith("fid:")) {
      const fid = slug.split(":")[1];
      user = await client.lookupUserByFid(fid);
    } else {
      user = await client.lookupUserByUsername(slug);
    }
  } catch (error) {
    // isApiErrorResponse can be used to check for Neynar API errors
    if (isApiErrorResponse(error)) {
      console.log("API Error", error, error.response.data);
    } else {
      console.log("Generic Error", error);
    }

    return {
      notFound: true,
    }
    }

  return {
    props: {
      profile: user.result.user,
    },

    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 60 seconds
    revalidate: 60,
  };
}

export const getStaticPaths = (async () => {
  const client = new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!);

  const globalFeed = await client.fetchFeed("filter", {
    filterType: FilterType.GlobalTrending,
    limit: 100,
  });

  const paths = uniqBy(
    globalFeed.casts.map(({ author }) => ({
      params: {
        slug: author.username,
      },
    })),
    "params.slug"
  );

  return {
    paths,
    fallback: 'blocking',
  };
}) satisfies GetStaticPaths;

enum FeedTypeEnum {
  "casts" = "Casts",
  "likes" = "Likes",
}

export default function Profile({ profile }) {
  const [selectedFeedIdx, setSelectedFeedIdx] = useState(0);
  const [casts, setCasts] = useState<CastWithInteractions[]>([]);
  const [feedType, setFeedType] = useState<FeedTypeEnum>(FeedTypeEnum.casts);

  const { addUserProfile } = useDataStore();
  const { accounts, selectedAccountIdx } = useAccountStore();

  const selectedAccount = accounts[selectedAccountIdx];
  const userFid = Number(selectedAccount?.platformAccountId) || APP_FID;

  const onSelectCast = (idx: number) => {
    setSelectedFeedIdx(idx);
  };

  useEffect(() => {
    if (!profile) return;

    const getData = async () => {
      const neynarClient = new NeynarAPIClient(
        process.env.NEXT_PUBLIC_NEYNAR_API_KEY!
      );
      const resp = await neynarClient.fetchBulkUsers(
        [profile.fid],
        { viewerFid: userFid! as number},
      )
      if (resp?.users && resp.users.length === 1) {
        addUserProfile({ username: profile.username, data: resp.users[0] });
      }
    };

    getData();
  }, [profile, userFid]);

  useHotkeys(
    ["tab", "shift+tab"],
    () => {
      setFeedType(
        feedType === FeedTypeEnum.casts
          ? FeedTypeEnum.likes
          : FeedTypeEnum.casts
      );
      setSelectedFeedIdx(0);
      window.scrollTo(0, 0);
    },
    [feedType],
    {
      preventDefault: true,
    }
  );

  useEffect(() => {
    if (!profile) return;

    const loadFeed = async () => {
      const client = new NeynarAPIClient(
        process.env.NEXT_PUBLIC_NEYNAR_API_KEY!
      );

      if (feedType === FeedTypeEnum.casts) {
        client
          .fetchFeed("filter", {
            filterType: "fids",
            fids: [profile.fid],
            withRecasts: true,
            limit: 25,
          })
          .then(({ casts }) => {
            setCasts(casts);
          })
          .catch((err) => console.log(`failed to fetch ${err}`));
      } else if (feedType === FeedTypeEnum.likes) {
        client
          .fetchUserReactions(profile.fid, "likes", {
            limit: 25,
          })
          .then(({ reactions }) => {
            setCasts(reactions.map(({ cast }) => cast));
          });
      }
    };

    loadFeed();
  }, [profile, feedType]);

  const renderEmptyState = () => (
    <div className="max-w-7xl px-6 pb-24 sm:pb-32 lg:flex lg:px-8">
      <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl">
        <div className="mt-2">
          <h2>Loading...</h2>
        </div>
      </div>
    </div>
  );

  const renderRow = (item: CastWithInteractions, idx: number) => (
    <li
      key={item?.hash}
      className="border-b border-gray-700/40 relative flex items-center space-x-4 max-w-full md:max-w-2xl"
    >
      <CastRow
        cast={item}
        showChannel
        isSelected={selectedFeedIdx === idx}
        onSelect={() => onSelectCast(idx)}
      />
    </li>
  );

  const renderFeed = () => (
    <div className="border-2 max-h-full overflow-scroll rounded-md bg-white pr-4 pl-4">
      <Tabs value={feedType} className="pt-2 pb-2 w-full max-w-full">
        <TabsList className="grid w-full grid-cols-2">
          {Object.keys(FeedTypeEnum).map((key) => {
            return (
              <TabsTrigger
                key={key}
                value={FeedTypeEnum[key]}
                className="text-foreground/80 text-center"
                onClick={() => setFeedType(FeedTypeEnum[key])}
              >
                {FeedTypeEnum[key]}
                {feedType !== FeedTypeEnum[key] && (
                  <div className="ml-4 text-foreground/80 hidden md:block">
                    Switch with &nbsp;
                    <kbd className="px-1.5 py-1 text-xs border rounded-lg bg-foreground/80 text-background/80">
                      Tab
                    </kbd>
                  </div>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      <SelectableListWithHotkeys
        data={casts}
        selectedIdx={selectedFeedIdx}
        setSelectedIdx={setSelectedFeedIdx}
        renderRow={(item: any, idx: number) => renderRow(item, idx)}
        onExpand={() => null}
        onSelect={() => null}
        isActive
      />
    </div>
  );

  function ProfileHeader(){
    return(
      <Card className="max-w-2xl mx-auto bg-transparent border-none shadow-none">
          <CardHeader className="flex space-y-0">
            <div className="flex space-x-4 grid grid-cols-2 lg:grid-cols-3">
              <div className="col-span-1 lg:col-span-2">
                <Avatar className="h-14 w-14">
                  <AvatarImage alt="User avatar" src={profile.pfp.url} />
                  <AvatarFallback>{profile.username}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-foreground">
                    {profile.displayName}
                  </h2>
                  <span className="text-sm text-foreground/80">
                    @{profile.username}
                  </span>
                </div>
              </div>
              {userFid !== profile.fid && (
                <FollowButton username={profile.username} />
              )}
            </div>
            <div className="flex pt-4 text-sm text-foreground/80">
              <span className="mr-4">
                <strong>{profile.followingCount}</strong> Following
              </span>
              <span>
                <strong>{profile.followerCount}</strong> Followers
              </span>
            </div>
            <span className="text-foreground">{profile.profile.bio.text}</span>
          </CardHeader>
        </Card>
      )
  }

  ////

    const [editMode, setMode] = useState(false);

    //const { getCurrentUser } = useAccountStore();
    const user = useAccountStore.getState().accounts[0];
    
    const availableHandles = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];

    const [fidgetConfigs, setFidgetConfigs] = useState([
        {   f: <></>,
            resizeHandles: availableHandles,
            x: 0,
            y: 3,
            w: 6,
            minW: 4,
            maxW: 8,
            h: 7,
            minH: 6,
            maxH: 12
        },
        {
          f: <ProfileHeader />,
          resizeHandles: availableHandles,
            x: 0,
            y: 0,
            w: 6,
            minW: 4,
            maxW: 8,
            h: 3,
            minH: 2,
            maxH: 6
        }, 
        {   f: <FrameFidget url = {"https://paragraph.xyz/@nounspace/the-third-space?referrer=0x51603C7059f369aB04B16AddFB7BB6c4e34b8523"}/>,
            resizeHandles: availableHandles,
            x: 10,
            y: 0,
            w: 3,
            minW: 1,
            h: 6,
            minH: 1
        },
        {   f: <FrameFidget url = {"https://far.cards/api/trade/user/4888"}/>,
            resizeHandles: availableHandles,
            x: 6,
            y: 0,
            w: 3,
            minW: 2,
            maxW: 4,
            h: 6,
            minH: 3,
            maxH: 12
        },
        {   f: <FrameFidget url = {"https://altumbase.com/degen/4888/dIVWKaIQZR"}/>,
            resizeHandles: availableHandles,
            x: 6,
            y: 6,
            w: 3,
            minW: 2,
            maxW: 4,
            h: 4,
            minH: 3,
            maxH: 12
        },
        {   f: <FrameFidget url = {"https://yoink.alfafrens.com/inviteCode/rollingInvites"}/>,
            resizeHandles: availableHandles,
            x: 10,
            y: 6,
            w: 3,
            minW: 2,
            maxW: 4,
            h: 3,
            minH: 3,
            maxH: 12
        }
    ]);

    function switchMode() {
        setMode(!editMode);
    }  

    function retrieveConfig(user, space){
        const layoutConfig = {
            isDraggable: editMode,
            isResizable: editMode,
            items: 6  ,
            cols: 12,
            rowHeight: 70,
            onLayoutChange: function(){},
            // This turns off compaction so you can place items wherever.
            compactType: null,
            // This turns off rearrangement so items will not be pushed arround.
            preventCollision: true
        };
        const layoutID = "";
    
        return ({fidgetConfigs, layoutConfig, layoutID})
    }

  ////

  const renderProfile = () => (
    <div>
      <div className={editMode ? "edit-grid absolute inset-0 z-0" : "no-edit-grid  absolute inset-0 z-0"} />
      <button onClick={switchMode} 
              className = {editMode ? "rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex opacity-90 hover:opacity-100 duration-500" : "rounded-full bg-white size-12 absolute top-6 right-4 z-10 flex opacity-50 hover:opacity-100 duration-500"}>
          <RiPencilFill className={editMode ? "text-slate-900 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" : "x  text-gray-700 font-semibold text-2xl absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"}/>
      </button>
      {/* <Space config={retrieveConfig(user, 0)} isEditable={editMode}> */}
        {renderFeed()}
      {/* </Space> */}
    </div>
  );

  return !profile ? renderEmptyState() : renderProfile();
}

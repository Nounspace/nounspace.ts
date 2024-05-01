import React, { useEffect, useState } from "react";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { User } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import FollowButton from "./FollowButton";
import { useDataStore } from "@/common/data/stores/useDataStore";

const defaultProfiles: User[] = [
  {
    username: "nounspace",
    fid: 456830,
    display_name: "nounspace",
    pfp_url: "https://i.imgur.com/AHE0m9Y.jpg",
    profile: {
      bio: {
        text: "you are using Nounspace right now 👋🏻",
      },
    },
  },
] as User[];

const RecommendedProfilesCard = () => {
  const [profiles, setProfiles] = useState<User[]>(defaultProfiles);

  const { addUserProfile } = useDataStore();

  useEffect(() => {
    const getProfiles = async () => {
      const client = new NeynarAPIClient(
        process.env.NEXT_PUBLIC_NEYNAR_API_KEY!
      );

      const relevantFollowers = await client.fetchActiveUsers({
        limit: 14,
      });

      if (!relevantFollowers || !relevantFollowers.users) {
        return;
      }

      setProfiles([...defaultProfiles, ...relevantFollowers.users]);
    };

    getProfiles();
  }, []);

  useEffect(() => {
    profiles.forEach((profile) => {
      addUserProfile({ username: profile.username, data: profile });
    });
  }, [profiles]);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Follow more profiles to see more content
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The more profiles you follow, the more content you will see in your
          feed.
        </p>
      </div>
      <ul
        role="list"
        className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none"
      >
        {profiles.map((person) => (
          <li key={person.username}>
            <img
              className="mx-auto h-24 w-24 rounded-full"
              src={person.pfp_url}
              alt=""
            />
            <h3 className="my-2 text-base font-semibold leading-7 tracking-tight text-foreground">
              {person.display_name}
            </h3>
            <FollowButton username={person.username} />
            <p className="mt-2 line-clamp-2 h-18 text-sm leading-6 text-muted-foreground">
              {person?.profile?.bio?.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendedProfilesCard;

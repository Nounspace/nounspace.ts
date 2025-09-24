"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { ProposalVote } from "@nouns/data/ponder/governance/getProposal";

interface CreateVoteContextInterface {
  replies: ProposalVote[];
  revotes: ProposalVote[];

  addReply: (reply: ProposalVote) => void;
  removeReply: (reply: ProposalVote) => void;
  addRevote: (revote: ProposalVote) => void;
  removeRevote: (revote: ProposalVote) => void;
  clearReplies: () => void;
  clearRevotes: () => void;
}

const CreateVoteContext = createContext<CreateVoteContextInterface | undefined>(
  undefined,
);

export function useCreateVoteContext() {
  const context = useContext(CreateVoteContext);
  if (!context) {
    throw new Error(
      "useCreateVoteContext must be used within a CreateVoteProvider",
    );
  }
  return context;
}

export default function CreateVoteProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [replies, setReplies] = useState<ProposalVote[]>([]);
  const [revotes, setRevotes] = useState<ProposalVote[]>([]);

  const addReply = useCallback(
    (reply: ProposalVote) => {
      setReplies((replies) => {
        if (replies.some((r) => r.id === reply.id)) {
          return replies;
        }
        return [...replies, reply];
      });
    },
    [setReplies],
  );

  const removeReply = useCallback(
    (reply: ProposalVote) => {
      setReplies((replies) => {
        return [...replies.filter((r) => r.id !== reply.id)];
      });
    },
    [setReplies],
  );

  const addRevote = useCallback(
    (revote: ProposalVote) => {
      setRevotes((revotes) => {
        if (revotes.some((r) => r.id === revote.id)) {
          return revotes;
        }
        return [...revotes, revote];
      });
    },
    [setRevotes],
  );

  const removeRevote = useCallback(
    (revote: ProposalVote) => {
      setRevotes((revotes) => {
        return [...revotes.filter((r) => r.id !== revote.id)];
      });
    },
    [setRevotes],
  );

  const clearReplies = useCallback(() => {
    setReplies([]);
  }, [setReplies]);

  const clearRevotes = useCallback(() => {
    setRevotes([]);
  }, [setRevotes]);

  return (
    <CreateVoteContext.Provider
      value={{
        replies,
        revotes,
        addReply,
        removeReply,
        addRevote,
        removeRevote,
        clearReplies,
        clearRevotes,
      }}
    >
      {children}
    </CreateVoteContext.Provider>
  );
}

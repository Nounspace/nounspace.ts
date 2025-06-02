import { useMemo } from 'react';

export type ProposalStatus = 'Pending' | 'Active' | 'Passed' | 'Failed' | 'Closed';

interface UseProposalStatusProps {
  proposal: {
    id?: string;
    start: number;
    end: number;
    state: string;
    type: string;
    scores: number[];
    scores_total?: number;
    scores_by_strategy?: any[];
    space?: {
      id: string;
      name?: string;
    };
  };
  spaceQuorum?: {
    hasQuorum: boolean;
    quorumThreshold?: number;
    quorumType?: string;
    minScore?: number;
  };
}

export const useProposalStatus = ({ proposal, spaceQuorum }: UseProposalStatusProps): ProposalStatus => {
  return useMemo(() => {
    const now = Date.now() / 1000;
    
    // Debug logging to understand the proposal data structure
    if (process.env.NODE_ENV === 'development') {
      console.log('Proposal Debug Data:', {
        id: proposal.id || 'N/A',
        type: proposal.type,
        state: proposal.state,
        start: proposal.start,
        end: proposal.end,
        scores: proposal.scores,
        scores_total: proposal.scores_total,
        space: proposal.space,
        spaceQuorum,
        now: now,
        timeStatus: {
          isPending: now < proposal.start,
          isActive: now >= proposal.start && now <= proposal.end,
          isEnded: now > proposal.end
        }
      });
    }
    
    // Check time-based status first
    if (now < proposal.start) {
      return "Pending";
    }
    
    if (now <= proposal.end) {
      return "Active";
    }
    
    // Proposal has ended - determine final status
    if (proposal.state === "closed") {
      return calculateFinalStatus(proposal, spaceQuorum);
    }
    
    // Fallback to server-provided state if available
    const serverState = proposal.state as ProposalStatus;
    if (['Passed', 'Failed', 'Closed'].includes(serverState)) {
      return serverState;
    }
    
    // Default calculation for ended proposals
    return calculateFinalStatus(proposal, spaceQuorum);
  }, [proposal, spaceQuorum]);
};

// Helper function to calculate final status based on voting results
function calculateFinalStatus(
  proposal: UseProposalStatusProps['proposal'], 
  spaceQuorum?: UseProposalStatusProps['spaceQuorum']
): ProposalStatus {
  const { type, scores, scores_total } = proposal;
  
  // Handle special voting types
  if (type === "ranked-choice" || type === "weighted") {
    return "Closed";
  }
  
  // Ensure we have scores to work with
  if (!scores || scores.length === 0) {
    return "Failed";
  }
  
  // Calculate basic voting metrics
  const totalVotes = scores_total || scores.reduce((sum, score) => sum + score, 0);
  const maxScore = Math.max(...scores);
  const winningChoice = scores.indexOf(maxScore);
  const winningVotes = scores[winningChoice];
  
  // Check quorum requirements if available
  let meetsQuorum = true;
  if (spaceQuorum?.hasQuorum) {
    if (spaceQuorum.quorumThreshold) {
      // Check if total votes meet the quorum threshold
      meetsQuorum = totalVotes >= spaceQuorum.quorumThreshold;
    } else if (spaceQuorum.minScore) {
      // Check if winning choice meets minimum score requirement
      meetsQuorum = winningVotes >= spaceQuorum.minScore;
    }
  }
  
  // For single-choice and basic voting, typically:
  // - Choice 0 is "Yes/For" 
  // - Choice 1 is "No/Against"
  // - Choice 2+ might be "Abstain" or other options
  
  if (type === "single-choice" || type === "basic") {
    // Simple majority - highest score wins
    const isPassed = winningChoice === 0; // Assuming index 0 is "Yes/For"
    
    // Additional check: ensure winning choice has meaningful support
    const hasMinimumSupport = totalVotes > 0 && winningVotes > 0;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Final Status Calculation:', {
        type,
        scores,
        totalVotes,
        winningChoice,
        winningVotes,
        hasMinimumSupport,
        meetsQuorum,
        spaceQuorum,
        isPassed: isPassed && hasMinimumSupport && meetsQuorum
      });
    }
    
    return (isPassed && hasMinimumSupport && meetsQuorum) ? "Passed" : "Failed";
  }
  
  if (type === "approval") {
    // For approval voting, check if any option has meaningful support
    const hasApproval = maxScore > 0 && totalVotes > 0;
    return (hasApproval && meetsQuorum) ? "Passed" : "Failed";
  }
  
  // Default fallback
  const isPassed = winningChoice === 0 && winningVotes > 0;
  return (isPassed && meetsQuorum) ? "Passed" : "Failed";
}

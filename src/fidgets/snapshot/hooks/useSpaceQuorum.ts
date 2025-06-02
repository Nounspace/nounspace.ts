import { useMemo } from 'react';
import { useSnapShotInfo } from '@/common/lib/hooks/useSnapshotInfo';

interface QuorumSettings {
  hasQuorum: boolean;
  quorumThreshold?: number;
  quorumType?: string;
  minScore?: number;
}

export const useSpaceQuorum = (spaceEns: string): QuorumSettings => {
  const { snapShotInfo, error } = useSnapShotInfo({ ens: spaceEns });
  
  return useMemo(() => {
    if (error || !snapShotInfo || !snapShotInfo.spaces?.[0]) {
      return { hasQuorum: false };
    }
    
    const space = snapShotInfo.spaces[0];
    
    // Check for quorum in voting settings
    const votingQuorum = space.voting?.quorum;
    const filtersMinScore = space.filters?.minScore;
    
    const result: QuorumSettings = {
      hasQuorum: !!(votingQuorum || filtersMinScore),
      quorumThreshold: votingQuorum,
      minScore: filtersMinScore,
      quorumType: votingQuorum ? 'voting' : filtersMinScore ? 'filters' : undefined
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Space Quorum Settings:', {
        space: spaceEns,
        snapShotInfo,
        voting: space.voting,
        filters: space.filters,
        calculated: result
      });
    }
    
    return result;
  }, [snapShotInfo, error, spaceEns]);
};

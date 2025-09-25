import { NextApiRequest, NextApiResponse } from 'next';
import { loadProposalData } from '@/app/(spaces)/p/[proposalId]/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { proposalId } = req.query;

  if (!proposalId || typeof proposalId !== 'string') {
    return res.status(400).json({ error: 'Invalid proposal ID' });
  }

  try {
    const proposalData = await loadProposalData(proposalId);
    
    if (!proposalData) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    return res.status(200).json(proposalData);
  } catch (error) {
    console.error('Error fetching proposal data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

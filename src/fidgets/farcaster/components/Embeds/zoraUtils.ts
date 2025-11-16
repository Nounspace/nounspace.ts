export const parseZoraUrl = (input: string): { pageUrl: string; contract?: string; tokenId?: string } | null => {
  try {
    // Handle zoraCoin scheme: zoraCoin://<contract>[/<tokenId>]
    if (input.startsWith("zoraCoin:")) {
      const after = input.replace(/^zoraCoin:\/\//, "");
      const parts = after.split("/").filter(Boolean);
      const contract = parts[0];
      const tokenId = parts[1];
      // Normalize all zoraCoin scheme URLs to use the /coin/ namespace.
      const contractNormalized = contract ? (contract.includes(":") ? contract : contract) : undefined;
      const pageUrl = contractNormalized
        ? tokenId
          ? `https://zora.co/coin/${contractNormalized}/${tokenId}`
          : `https://zora.co/coin/${contractNormalized}`
        : input;
      return { pageUrl, contract: contractNormalized, tokenId };
    }

    const u = new URL(input);
    const hostname = u.hostname.toLowerCase();

    // Accept zora.co host variants
    if (hostname.includes("zora.co")) {
      const decodedPath = decodeURIComponent(u.pathname || "");

      // coin pattern
      const coinMatch = decodedPath.match(/\/?coin\/((?:[a-zA-Z0-9_-]+:)?0x[a-fA-F0-9]{40})(?:\/(\d+))?/);
      if (coinMatch) {
        const contract = coinMatch[1];
        const tokenId = coinMatch[2];
        const pageUrl = tokenId ? `https://zora.co/coin/${contract}/${tokenId}` : `https://zora.co/coin/${contract}`;
        return { pageUrl, contract, tokenId };
      }

      // tokens pattern (leave as tokens)
      const tokensMatch = decodedPath.match(/\/?tokens\/(0x[a-fA-F0-9]{40})(?:\/(\d+))?/);
      if (tokensMatch) {
        const contract = tokensMatch[1];
        const tokenId = tokensMatch[2];
        const pageUrl = tokenId ? `https://zora.co/tokens/${contract}/${tokenId}` : `https://zora.co/tokens/${contract}`;
        return { pageUrl, contract, tokenId };
      }

      // collect patterns
      const collectPattern1 = /\/?collect\/(?:([^/]+):)?(0x[a-fA-F0-9]{40})(?:\/(\d+))?/;
      const collectPattern2 = /\/?collect\/(0x[a-fA-F0-9]{40})(?:\/(\d+))?/;
      const collectMatch = decodedPath.match(collectPattern1) || decodedPath.match(collectPattern2);
      if (collectMatch) {
        let contract: string | undefined;
        let tokenId: string | undefined;
        if (collectMatch[2] && collectMatch[2].startsWith("0x")) {
          contract = collectMatch[2];
          tokenId = collectMatch[3];
        } else if (collectMatch[1] && collectMatch[1].startsWith("0x")) {
          contract = collectMatch[1];
          tokenId = collectMatch[2];
        }
        // Normalize to coin/<contract>. If the collect path used a namespace (e.g. base:0x...)
        const contractNormalized = contract ? (contract.includes(":") ? contract : contract) : undefined;
        const pageUrl = contractNormalized
          ? tokenId
            ? `https://zora.co/coin/${contractNormalized}/${tokenId}`
            : `https://zora.co/coin/${contractNormalized}`
          : input;
        return { pageUrl, contract: contractNormalized, tokenId };
      }

      return { pageUrl: input };
    }

    return null;
  } catch (e) {
    return null;
  }
};

export default parseZoraUrl;

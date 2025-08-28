import { SpaceConfig } from "@/app/(spaces)/Space";
import { contractOwnerFromContractAddress } from "@/common/data/api/etherscan";
import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { loadOwnedItentitiesForWalletAddress } from "@/common/data/database/supabase/serverHelpers";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";
import { isSignable, validateSignable } from "@/common/lib/signedFiles";
import {
  findIndex,
  first,
  includes,
  isArray,
  isNil,
} from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import { Address } from "viem";

interface SpaceRegistrationBase {
  spaceName: string;
  identityPublicKey: string;
  signature: string;
  timestamp: string;
}

export interface SpaceRegistrationContract extends SpaceRegistrationBase {
  contractAddress: string;
  tokenOwnerFid?: number;
  initialConfig?: Omit<SpaceConfig, "isEditable">;
  network?: string;
}

export interface SpaceRegistrationFid extends SpaceRegistrationBase {
  fid: number;
}

export interface SpaceRegistrationProposer extends SpaceRegistrationBase {
  proposalId: string;
}

export type SpaceRegistration =
  | SpaceRegistrationContract
  | SpaceRegistrationFid
  | SpaceRegistrationProposer;

type SpaceInfo = SpaceRegistrationBase & {
  spaceId: string;
  fid: number | null;
  contractAddress: string | null;
  network: string | null;
  proposalId?: string | null;
};

function isSpaceRegistration(maybe: unknown): maybe is SpaceRegistration {
  if (!isSignable(maybe, "identityPublicKey")) {
    return false;
  }
  const isValid =
    typeof maybe["spaceName"] === "string" &&
    typeof maybe["timestamp"] === "string";

  return isValid;
}

function isSpaceRegistrationFid(maybe: unknown): maybe is SpaceRegistrationFid {
  const isValid =
    isSpaceRegistration(maybe) &&
    (typeof maybe["fid"] == "string" || typeof maybe["fid"] == "number");

  return isValid;
}

// Update the type guard to handle SpaceRegistrationContract
function isSpaceRegistrationContract(maybe: unknown): maybe is SpaceRegistrationContract {
  return (
    isSpaceRegistration(maybe) &&
    typeof maybe["contractAddress"] === "string"
  );
}

// Update the type guard to handle SpaceRegistrationProposer
function isSpaceRegistrationProposer(maybe: unknown): maybe is SpaceRegistrationProposer {
  return (
    isSpaceRegistration(maybe) &&
    typeof maybe["proposalId"] === "string"
  );
}

export type RegisterNewSpaceResponse = NounspaceResponse<SpaceInfo>;

export type ModifiableSpacesResponse = NounspaceResponse<{
  identity: string;
  spaces: SpaceInfo[];
}>;

async function identityCanRegisterForFid(identity: string, fid: number) {
  const { data } = await createSupabaseServerClient()
    .from("fidRegistrations")
    .select("fid, identityPublicKey")
    .eq("fid", fid);
  return (
    data !== null &&
    findIndex(data, (i) => i.identityPublicKey === identity) !== -1
  );
}

// Create a validation for fid on clanker
export async function fidCanRegisterClanker(
  contractAddress?: string,
  fid?: number,
  network?: string,
) {
  if (isNil(contractAddress) || isNil(fid)) return false;

  const clankerData = await fetchClankerByAddress(contractAddress as Address);
  return clankerData && clankerData.requestor_fid === fid;
}

async function identityCanRegisterForContract(
  identity: string,
  contractAddress: string,
  tokenOwnerFid?: number,
  network?: string,
) {
  const canRegisterClanker = await fidCanRegisterClanker(
    contractAddress,
    tokenOwnerFid,
    network,
  );
  if (canRegisterClanker) {
    return true;
  }
  const { ownerId, ownerIdType } = await contractOwnerFromContractAddress(
    contractAddress,
    network,
  );

  if (isNil(ownerId)) {
    return false;
  } else if (ownerIdType === "fid") {
    const canRegister = await identityCanRegisterForFid(
      identity,
      parseInt(ownerId),
    );
    return canRegister;
  }
  const ownedIdentities = await loadOwnedItentitiesForWalletAddress(ownerId);
  return includes(ownedIdentities, identity);
}

// Handles the registration of a new space name to requesting identity
// Checks that the identity is allowed to register more than one name
async function registerNewSpace(
  req: NextApiRequest,
  res: NextApiResponse<RegisterNewSpaceResponse>,
) {
  const registration = req.body;

  if (!isSpaceRegistration(registration)) {
    console.error("Invalid space registration:", registration);
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Registration of a new space requires spaceName, fid, timestamp, identityPublicKey, and signature",
      },
    });
    return;
  }
  if (!validateSignable(registration, "identityPublicKey")) {
    console.error("Invalid signature:", registration);
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }
  if (isSpaceRegistrationFid(registration)) {
    if (
      !(await identityCanRegisterForFid(
        registration.identityPublicKey,
        registration.fid,
      ))
    ) {
      console.error(
        `Identity ${registration.identityPublicKey} cannot manage spaces for fid ${registration.fid}`,
      );
      res.status(400).json({
        result: "error",
        error: {
          message: `Identity ${registration.identityPublicKey} cannot manage spaces for fid ${registration.fid}`,
        },
      });
      return;
    }
  } else if (isSpaceRegistrationContract(registration)) {
    if (
      !(await identityCanRegisterForContract(
        registration.identityPublicKey,
        registration.contractAddress,
        registration.tokenOwnerFid,
        registration.network,
      ))
    ) {
      console.error(
        `Identity ${registration.identityPublicKey} cannot manage spaces for contract ${registration.contractAddress}`,
      );
      res.status(400).json({
        result: "error",
        error: {
          message: `Identity ${registration.identityPublicKey} cannot manage spaces for contract ${registration.contractAddress}`,
        },
      });
      return;
    }
  } else if (isSpaceRegistrationProposer(registration)) {
    // Handle proposer-specific logic if needed
  }

  if ("tokenOwnerFid" in registration && registration.tokenOwnerFid) {
    delete registration.tokenOwnerFid;
  }

  const { data: result, error } = await createSupabaseServerClient()
    .from("spaceRegistrations")
    .insert([registration])
    .select();

  if (error) {
    console.error("Error registering new space:", error.message);
    res.status(500).json({
      result: "error",
      error: {
        message: error.message,
      },
    });
    return;
  }

  res.status(200).json({
    result: "success",
    value: first(result),
  });
}

// Handles both contract lookup and listing modifiable spaces
async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    contractAddress: contractAddressQuery,
    network: networkQuery,
    identityPublicKey,
    proposalId: proposalIdQuery,
  } = req.query;

  // Handle contract lookup case
  if (contractAddressQuery && networkQuery) {
    const contractAddress = Array.isArray(contractAddressQuery)
      ? contractAddressQuery[0]
      : contractAddressQuery;
    const network = Array.isArray(networkQuery) ? networkQuery[0] : networkQuery;

    if (!contractAddress || !network) {
      return res
        .status(400)
        .json({ result: "error", error: { message: "Missing contractAddress or network params" } });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("spaceRegistrations")
      .select("spaceId")
      .eq("contractAddress", contractAddress)
      .eq("network", network);

    if (error) {
      return res
        .status(500)
        .json({ result: "error", error: { message: error.message } });
    }

    const space = first(data);

    if (space) {
      return res.status(200).json({ result: "success", value: space });
    } else {
      return res.status(404).json({ result: "error", error: { message: "Space not found" } });
    }
  }

  // Handle proposal lookup case
  if (proposalIdQuery) {
    const proposalId = Array.isArray(proposalIdQuery)
      ? proposalIdQuery[0]
      : proposalIdQuery;

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("spaceRegistrations")
      .select("spaceId")
      .eq("proposalId", proposalId)
      .order("timestamp", { ascending: true })
      .limit(1);

    if (error) {
      return res
        .status(500)
        .json({ result: "error", error: { message: error.message } });
    }

    const space = first(data);

    if (space) {
      return res.status(200).json({ result: "success", value: space });
    } else {
      return res.status(404).json({ result: "error", error: { message: "Space not found" } });
    }
  }

  // Handle modifiable spaces list case - requires identityPublicKey
  if (!identityPublicKey) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "Either (contractAddress and network) or identityPublicKey must be provided",
      },
    });
  }

  const identity = identityPublicKey;

  if (isArray(identity)) {
    console.error("Invalid identityPublicKey query parameter:", identity);
    res.status(400).json({
      result: "error",
      error: {
        message:
          "identityPublicKey must be provided as a query parameter with a single value",
      },
    });
    return;
  }
  const { data, error } = await createSupabaseServerClient()
    .from("spaceRegistrations")
    .select("*, fidRegistrations!inner (fid, identityPublicKey)")
    .filter("fidRegistrations.identityPublicKey", "eq", identity);

  if (error) {
    console.error("Error fetching modifiable spaces:", error.message);
    res.status(500).json({
      result: "error",
      error: {
        message: error.message,
      },
    });
    return;
  }

  res.status(200).json({
    result: "success",
    value: {
      identity,
      spaces: data,
    },
  });
}

export default requestHandler({
  get: handleGetRequest,
  post: registerNewSpace,
});

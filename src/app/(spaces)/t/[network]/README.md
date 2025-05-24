# Token Page Registration in Nounspace

## What is a Token Page?
A **Token Page** in Nounspace is a customizable space associated with a specific token (such as an ERC20 contract). Each token page is uniquely identified by a `spaceId` and is linked to a token's contract address and network. Token pages allow token creators or owners to claim, customize, and manage a dedicated space for their token within the Nounspace platform.

---

## How Does Token Page Registration Work?

### 1. User Visits a Token Page
- When a user navigates to a token page, the app loads the page using the `PublicSpace` component, passing in token-specific props like `contractAddress`, `tokenData`, and `spaceOwnerAddress`.
- The `PublicSpace` component determines the page type, loads the current config, and manages editability and ownership.

### 2. Claiming the Space
- If the user is not yet registered as the owner, a **Claim this Space** button is shown (see `ClaimButtonWithModal`).
- The user must log in with their Farcaster account or connect their wallet to prove ownership of the token contract.
- The claim button opens a modal (`ClaimModal`) that guides the user through the authentication and claiming process.

### 3. Registration Process (Frontend)
- When the user claims the space, the frontend prepares a registration request containing:
  - The contract address
  - The user's Farcaster FID (or wallet address)
  - The initial configuration for the space/tab
  - The network (e.g., Ethereum, Base)
- The frontend calls a function like `registerSpaceContract` (in `spaceStore.ts`), which makes an API call to `/api/space/registry/[spaceId]/tabs` to register the tab.

### 4. Backend Validation and Storage
- The backend API route `/api/space/registry/[spaceId]/tabs/index.ts` validates the request:
  - Checks the signature and required fields.
  - Uses `identityCanModifySpace` to ensure the user is authorized to claim the space (i.e., is the token owner).
  - If valid, stores the tab configuration in Supabase storage under `spaces/{spaceId}/tabs/{tabName}`.
  - Responds with success or error.

### 5. State Update and Management (Frontend)
- On success, the frontend updates its local state (`localSpaces`, `remoteSpaces`) to reflect the new tab/ownership.
- The owner can now customize the token page, add or edit tabs, and save changes.
- Changes are managed locally and can be committed to the database using functions like `saveLocalSpaceTab` and `commitSpaceTabToDatabase`.

---

## Key Components and Functions

- **PublicSpace.tsx**: Main component for rendering and managing token pages. Handles loading, editability, and ownership logic.
- **ClaimButtonWithModal.tsx**: UI for claiming ownership of a token space. Shows the claim button and modal, and guides the user through the process.
- **spaceStore.ts**: Contains logic for registering, saving, and committing space/tab data. Key functions include:
  - `registerSpaceContract`: Registers a new space for a token contract, associating the contract address and owner FID with the space. Prepares the registration request and sends it to the backend.
  - `commitSpaceTabToDatabase`: Persists a tab's config to the database (Supabase) after local edits.
  - `saveLocalSpaceTab`: Saves changes to a tab's config locally (before committing to the database).
- **API: /api/space/registry/[spaceId]/tabs**: Handles backend registration and validation. Validates the user's claim and stores the configuration in Supabase.
  - `registerNewSpaceTab`: Handles the backend logic for registering a new tab, including validation and storage.
  - `identityCanModifySpace`: Checks if the current identity (user) is allowed to modify the space (i.e., is the owner).

---

## Database Schema: Registered Space

When a token page is registered, its configuration and metadata are stored in Supabase storage and/or the database. The typical schema for a registered space (as inferred from the codebase) is as follows:

### Registered Space (Supabase Storage JSON)
This is the **configuration data** for a space, stored as a JSON blob in Supabase Storage (not in the `spaceRegistrations` table). It contains all the UI/layout/tab data for the space, and is referenced by the registration record.

- **spaceId**: `string` — Unique identifier for the space (often derived from the contract address or proposal ID).
- **tabs**: `object` — A mapping of tab names to their configuration objects. Each tab contains:
  - **fidgetInstanceDatums**: `object` — Fidget instance data for the tab (excluding sensitive config data).
  - **layoutID**: `string` — Layout identifier for the tab.
  - **layoutDetails**: `object` — Layout details for the tab.
  - **isEditable**: `boolean` — Whether the current user can edit this tab (not stored in DB, but present in config).
  - **fidgetTrayContents**: `object` — Contents of the fidget tray for the tab.
  - **theme**: `string` — Theme for the tab.
  - **other tab-specific config fields**
- **order**: `string[]` — The order of the tabs.
- **orderUpdatedAt**: `string` (optional) — Timestamp of the last order update.
- **contractAddress**: `string|null` — The contract address associated with the space (for token pages).
- **network**: `string|null` — The network (e.g., Ethereum, Base) associated with the space.
- **updatedAt**: `string` — Last update timestamp.
- **fid**: `number|null` (optional) — Farcaster ID of the owner (if applicable).

#### Example (JSON):
```json
{
  "id": "0x123...abc",
  "updatedAt": "2025-05-24T12:34:56Z",
  "tabs": {
    "Profile": {
      "fidgetInstanceDatums": {},
      "layoutID": "default",
      "layoutDetails": {},
      "isEditable": true,
      "fidgetTrayContents": {},
      "theme": "light"
    }
  },
  "order": ["Profile", "Activity"],
  "orderUpdatedAt": "2025-05-24T12:34:56Z",
  "contractAddress": "0x123...abc",
  "network": "base",
  "fid": 123456
}
```

### Database Table: `spaceRegistrations` (Ownership/Metadata)
This table stores **ownership and registration metadata** for each space. It does NOT store the full configuration data (which is in Supabase Storage as above).

| Column            | Type      | Nullable | Description                                      |
|-------------------|-----------|----------|--------------------------------------------------|
| spaceId           | uuid      | No       | Unique space ID (primary key)                    |
| fid               | bigint    | Yes      | Farcaster ID of the owner (nullable)             |
| spaceName         | varchar   | No       | Name of the space/tab                            |
| signature         | varchar   | No       | Signature for registration                       |
| identityPublicKey | varchar   | No       | Public key of the registering identity           |
| timestamp         | timestamptz | No     | Registration timestamp                           |
| contractAddress   | text      | Yes      | Token contract address (added by migration)      |
| network           | text      | Yes      | Network name (added by migration)                |

**Constraints:**
- Primary key: `spaceId`
- Unique: (`fid`, `spaceName`)
- Foreign key: `fid` references `fidRegistrations(fid)`

#### TypeScript Type (from `database.d.ts`)
```typescript
spaceRegistrations: {
  Row: {
    contractAddress: string | null;
    fid: number | null;
    identityPublicKey: string;
    signature: string;
    spaceId: string;
    spaceName: string;
    timestamp: string;
    network: string | null;
  };
  // ...Insert/Update omitted for brevity
}
```

**Note:**
- The `spaceRegistrations` table is for registration/ownership only. The actual space/tab configuration is stored as a JSON blob in Supabase Storage, referenced by `spaceId`.
- The JSON example above is for the storage blob, not the table row.

---

## Example Flow: Registering a Token Page
1. User visits a token page and sees the "Claim this Space" button.
2. User logs in with Farcaster or connects their wallet.
3. User clicks the claim button and completes the modal flow.
4. The frontend sends a registration request to the backend using `registerSpaceContract`.
5. The backend validates the request with `registerNewSpaceTab` and `identityCanModifySpace`, then stores the tab config.
6. The user is now the owner and can customize the token page, with changes managed by `saveLocalSpaceTab` and `commitSpaceTabToDatabase`.

---

## Summary
Token page registration in Nounspace is a coordinated process between frontend (React state, user actions) and backend (API validation, Supabase storage), ensuring that only the rightful owner (by contract address or FID) can register and manage the space for a given token. This enables a robust and user-owned experience for token communities, with secure authentication and flexible customization.
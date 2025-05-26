# Proposal Page Registration in Nounspace

## What is a Proposal Page?

A **Proposal Page** in Nounspace is a customizable space associated with a specific proposal (such as a governance or DAO proposal). Each proposal page is uniquely identified by a `spaceId` (derived from the proposal ID) and is linked to a proposal's metadata and network. Proposal pages allow proposal creators or owners to claim, customize, and manage a dedicated space for their proposal within the Nounspace platform.

---

## How Does Proposal Page Registration Work?

### 1. User Visits a Proposal Page

- When a user navigates to a proposal page, the app loads the page using the `PublicSpace` component, passing in proposal-specific props like `proposalId`, `proposalData`, and `spaceOwnerFid`.
- The `PublicSpace` component determines the page type, loads the current config, and manages editability and ownership.

### 2. Claiming the Space

- If the user is not yet registered as the owner, a **Claim this Space** button is shown (see `ClaimButtonWithModal`).
- The user must log in with their Farcaster account to prove ownership of the proposal.
- The claim button opens a modal (`ClaimModal`) that guides the user through the authentication and claiming process.

### 3. Registration Process (Frontend)

- When the user claims the space, the frontend prepares a registration request containing:
  - The proposal ID
  - The user's Farcaster FID
  - The initial configuration for the space/tab
  - The network (e.g., Ethereum, Base)
- The frontend calls a function like `registerProposalSpace` (to be implemented in `spaceStore.ts`), which makes an API call to `/api/space/registry/[spaceId]/tabs` to register the tab.

### 4. Backend Validation and Storage

- The backend API route `/api/space/registry/[spaceId]/tabs/index.ts` will be adapted to validate proposal registrations:
  - Checks the signature and required fields.
  - Uses a function like `identityCanModifyProposalSpace` to ensure the user is authorized to claim the space (i.e., is the proposal creator).
  - If valid, stores the tab configuration in Supabase storage under `spaces/{spaceId}/tabs/{tabName}`.
  - Responds with success or error.

### 5. State Update and Management (Frontend)

- On success, the frontend updates its local state to reflect the new tab/ownership.
- The owner can now customize the proposal page, add or edit tabs, and save changes.
- Changes are managed locally and can be committed to the database using functions like `saveLocalSpaceTab` and `commitSpaceTabToDatabase`.

---

## Key Components and Functions

- **PublicSpace.tsx**: Main component for rendering and managing proposal pages. Handles loading, editability, and ownership logic.
- **ClaimButtonWithModal.tsx**: UI for claiming ownership of a proposal space. Will be adapted to support proposal context.
- **spaceStore.ts**: Will include a new function `registerProposalSpace` for registering proposal pages.
- **API: /api/space/registry/[spaceId]/tabs**: Backend registration and validation, adapted for proposals.
  - `registerNewSpaceTab`: Will be adapted to handle proposal IDs.
  - `identityCanModifyProposalSpace`: New/modified function to check proposal ownership.

---

## Database Schema: Registered Proposal Space

- The schema will be similar to token pages, but will use `proposalId` instead of `contractAddress`.
- Ownership and configuration will be stored in the same way, with the registration table and Supabase Storage JSON.

---

## Example Flow: Registering a Proposal Page

1. User visits a proposal page and sees the "Claim this Space" button.
2. User logs in with Farcaster.
3. User clicks the claim button and completes the modal flow.
4. The frontend sends a registration request to the backend using `registerProposalSpace`.
5. The backend validates the request and stores the tab config.
6. The user is now the owner and can customize the proposal page.

---

## Summary

Proposal page registration in Nounspace will closely mirror token page registration, but will use proposal IDs for identification and ownership. This ensures a consistent, secure, and user-owned experience for proposal communities.

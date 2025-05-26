# Proposal Page Registration Implementation Plan

## Objective

Implement proposal page registration in Nounspace, mirroring the token page registration flow but using `proposalId` in the `spaceName` field in the format: `Proposal - {proposalId}`

## Data Requirements & Backend Trigger Values

To ensure the backend functions for proposal registration work correctly, the following values must be clearly defined and passed through the registration flow:

- **spaceId**: A unique identifier for the proposal space.
- **proposalId**: The unique identifier for the proposal. Must be present in all registration and claim requests.
- **fid**: The Farcaster FID of the proposal creator. This is used to verify and enforce editability and claim rights. Must be available in the proposal data and included in registration requests.

### Implementation Plan Updates

- [x] Ensure `spaceId` is generated and passed consistently from frontend to backend for all proposal registration actions.
- [x] Require `proposalId` in all registration and claim API requests and database records.
- [x] Extract and pass `fid` (formerly `proposerFID`) from proposal metadata to both frontend and backend, and use it in editability and claim logic. (Frontend and backend completed)
- [x] Update backend validation (e.g., `identityCanModifyProposalSpace`) to check that the user matches the `proposalOwner` or `fid`.
- [x] Document these requirements in both frontend and backend code to ensure future maintainability.

## Steps

### 1. Frontend

- [ ] Adapt `ClaimButtonWithModal` and `ClaimModal` to support proposal context (use `proposalId` and proposal data).
- [ ] Add/implement `registerProposalSpace` in `spaceStore.ts` to handle proposal registration requests.
- [ ] Update `PublicSpace.tsx` to support proposal page type and pass correct props.
- [ ] Ensure editability logic checks proposal ownership (by FID).

### 2. Backend

- [ ] Adapt `/api/space/registry/[spaceId]/tabs/index.ts` to handle proposal registrations:
  - [ ] Accept and validate `proposalId` in registration requests. (partially done)
  - [ ] Implement or adapt `identityCanModifyProposalSpace` to check if the user is the proposal creator.
  - [ ] Store proposal page config in Supabase Storage as with token pages.

### 3. Database

- [ ] Ensure `spaceRegistrations` table can store proposal registrations (may use `proposalId` in place of `contractAddress`).

### 4. Testing

- [ ] Test the full registration flow for proposal pages (claim, validate, store, edit).
- [ ] Ensure error handling and user feedback are clear.

## Notes

- The `fid` field is now used consistently across both token and proposal pages, replacing `proposerFID` to simplify the schema and logic.
- Backend and frontend logic have been updated to ensure `fid` is correctly passed, validated, and stored in the database.
- Shared components have been adapted to support proposal-specific logic without impacting token pages.
- DONT MESS UP TOKEN PAGES CODES, THERE WILL BE SHARED COMPONENTS THAT SHOULD BE ADAPTED AND NOT OVERWRITTEN

---

## Deliverables

- Updated/created components and backend logic for proposal page registration.
- Documentation (README and implementation plan).
- Tests for the new flow.

# Farcaster Mini App SDK Provider Implementation Tasks

## Provider & Hook Implementation
- [x] Create a new provider: `MiniAppSdkProvider` in `/src/common/providers/MiniAppSdkProvider.tsx` following the pattern of `TokenProvider` and `ClankerProvider`.
  - [x] Reference: See provider patterns in `/src/common/providers/TokenProvider.tsx` and `/src/common/providers/Clanker.tsx`.
  - [x] Reference: [Manual Setup](docs/miniapp-llm-full.md#manual-setup) for SDK installation instructions.
- [x] Install the Farcaster Mini App SDK (`@farcaster/frame-sdk`) as described in [Manual Setup](docs/miniapp-llm-full.md#manual-setup).
- [x] Ensure the provider initializes the Mini App/Frame SDK on mount (client-side only), manages its state, and exposes it via React context.
  - [x] Reference: [SDK](docs/miniapp-llm-full.md#sdk) and [API](docs/miniapp-llm-full.md#api) sections for initialization and available actions.
- [x] Manage and expose the following state in the context:
  - [x] SDK instance (if needed)
  - [x] Loading state (`isInitializing`, `isReady`)
  - [x] Error state (initialization/runtime errors)
  - [x] Farcaster context (user, fid, signer, etc.)
    - [x] Reference: [Authenticating users](docs/miniapp-llm-full.md#authenticating-users)
  - [x] Mini app context (frame context, actions, events, etc.)
    - [x] Reference: [context](docs/miniapp-llm-full.md#context)
- [x] Add the provider to the global provider tree in `/src/common/providers/index.tsx` so it wraps the app.
  - [x] Reference: See how other providers are added in `/src/common/providers/index.tsx`.

## Hook Implementation
- [x] Create a single hook: `useMiniAppSdk` in `/src/common/lib/hooks/useMiniAppSdk.ts`.
  - [x] Reference: [Hook Pattern](docs/miniapp-llm-full.md#sdk) and `/src/common/lib/hooks/` for examples.
- [x] The hook should consume the context and return all relevant state, context, actions, and event helpers.
- [x] Expose a single, comprehensive interface for all mini-app/Frame SDK needs, including:
  - [x] `isReady`, `isLoading`, `error`
  - [x] `context` (Farcaster user info, frame context, etc.)
  - [x] `actions` (all SDK actions: `ready`, `composeCast`, `addFrame`, `close`, `signin`, `openUrl`, `viewProfile`, etc.)
    - [x] Reference: [Actions](docs/miniapp-llm-full.md#actions)
  - [x] `events` (event subscription/unsubscription helpers)
    - [x] Reference: [Events](docs/miniapp-llm-full.md#events)

## Integration & Refactor
- [ ] Refactor any direct SDK usage (e.g. in `FrameEmbed.tsx`) to use the new hook.
  - [ ] Reference: [Calling ready](docs/miniapp-llm-full.md#calling-ready) and [SDK](docs/miniapp-llm-full.md#sdk) for correct usage.
- [x] Ensure the hook can be used anywhere in the app and provides all necessary information for mini-app/Frame integration (auth, context, actions, etc.).
- [ ] Support all required Mini App surfaces:
  - [ ] Splash screen handling ([Splash Screen](docs/miniapp-llm-full.md#splash-screen))
  - [ ] Header rendering ([Header](docs/miniapp-llm-full.md#header))
  - [ ] Modal sizing ([Size & Orientation](docs/miniapp-llm-full.md#size--orientation))

## Error Handling & Loading States
- [x] Handle initialization errors and expose them via context.
- [x] Expose loading and error states for consumers to handle UI feedback.
- [x] Use try/catch for async SDK calls, log errors, and provide user-friendly error messages.
- [x] Reference: [Error Handling](docs/miniapp-llm-full.md#user-experience) and [Loading your app](docs/miniapp-llm-full.md#loading-your-app).

## Documentation
- [x] Document the context shape, hook usage, and integration steps in the codebase.
  - [x] Reference: [Building with AI](docs/miniapp-llm-full.md#building-with-ai) for LLM-friendly documentation.
- [x] Define strong TypeScript types for all context values, actions, and events.
  - [x] Reference: [API](docs/miniapp-llm-full.md#api) and [Manifest](docs/miniapp-llm-full.md#manifest) for type inspiration.
- [x] Ensure the provider and hook follow the established code patterns and best practices in the codebase.

## Advanced/Optional
- [ ] Support notification event handling and webhook integration ([Sending Notifications](docs/miniapp-llm-full.md#sending-notifications), [Receiving webhooks](docs/miniapp-llm-full.md#receiving-webhooks)).
- [ ] Support Mini App embed meta tag parsing and rendering ([Mini App Embed](docs/miniapp-llm-full.md#mini-app-embed), [Sharing your app](docs/miniapp-llm-full.md#sharing-your-app)).
- [ ] Support manifest file validation and usage ([Manifest](docs/miniapp-llm-full.md#manifest), [Publishing your app](docs/miniapp-llm-full.md#publishing-your-app)).

## Implementation Status Summary (Added April 28, 2025)
- ✅ **Provider Implementation**: Created and integrated `MiniAppSdkProvider` in the app provider tree
- ✅ **SDK Integration**: Installed and initialized the Farcaster Mini App SDK
- ✅ **Context & State Management**: Successfully implemented all required state management
- ✅ **Hook Implementation**: Created `useMiniAppSdk` with all required functionalities
- ✅ **Error Handling**: Implemented proper error handling for all SDK operations
- ✅ **Type Definitions**: Added comprehensive TypeScript types for context and actions

**Next Steps:**
1. Refactor `FrameEmbed.tsx` to use the new hook instead of direct SDK usage
2. Implement support for Mini App surfaces (splash screen, header, modal sizing)
3. Add support for advanced features (notifications, webhooks, meta tags, manifest)

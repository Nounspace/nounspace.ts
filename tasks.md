# Farcaster Mini App SDK Provider Implementation Tasks

## Provider & Hook Implementation
- [ ] Create a new provider: `MiniAppSdkProvider` in `/src/common/providers/MiniAppSdkProvider.tsx` following the pattern of `TokenProvider` and `ClankerProvider`.
  - [ ] Reference: See provider patterns in `/src/common/providers/TokenProvider.tsx` and `/src/common/providers/Clanker.tsx`.
  - [ ] Reference: [Manual Setup](docs/miniapp-llm-full.md#manual-setup) for SDK installation instructions.
- [ ] Install the Farcaster Mini App SDK (`@farcaster/frame-sdk`) as described in [Manual Setup](docs/miniapp-llm-full.md#manual-setup).
- [ ] Ensure the provider initializes the Mini App/Frame SDK on mount (client-side only), manages its state, and exposes it via React context.
  - [ ] Reference: [SDK](docs/miniapp-llm-full.md#sdk) and [API](docs/miniapp-llm-full.md#api) sections for initialization and available actions.
- [ ] Manage and expose the following state in the context:
  - [ ] SDK instance (if needed)
  - [ ] Loading state (`isInitializing`, `isReady`)
  - [ ] Error state (initialization/runtime errors)
  - [ ] Farcaster context (user, fid, signer, etc.)
    - [ ] Reference: [Authenticating users](docs/miniapp-llm-full.md#authenticating-users)
  - [ ] Mini app context (frame context, actions, events, etc.)
    - [ ] Reference: [context](docs/miniapp-llm-full.md#context)
- [ ] Add the provider to the global provider tree in `/src/common/providers/index.tsx` so it wraps the app.
  - [ ] Reference: See how other providers are added in `/src/common/providers/index.tsx`.

## Hook Implementation
- [ ] Create a single hook: `useMiniAppSdk` in `/src/common/lib/hooks/useMiniAppSdk.ts`.
  - [ ] Reference: [Hook Pattern](docs/miniapp-llm-full.md#sdk) and `/src/common/lib/hooks/` for examples.
- [ ] The hook should consume the context and return all relevant state, context, actions, and event helpers.
- [ ] Expose a single, comprehensive interface for all mini-app/Frame SDK needs, including:
  - [ ] `isReady`, `isLoading`, `error`
  - [ ] `context` (Farcaster user info, frame context, etc.)
  - [ ] `actions` (all SDK actions: `ready`, `composeCast`, `addFrame`, `close`, `signin`, `openUrl`, `viewProfile`, etc.)
    - [ ] Reference: [Actions](docs/miniapp-llm-full.md#actions)
  - [ ] `events` (event subscription/unsubscription helpers)
    - [ ] Reference: [Events](docs/miniapp-llm-full.md#events)

## Integration & Refactor
- [ ] Refactor any direct SDK usage (e.g. in `FrameEmbed.tsx`) to use the new hook.
  - [ ] Reference: [Calling ready](docs/miniapp-llm-full.md#calling-ready) and [SDK](docs/miniapp-llm-full.md#sdk) for correct usage.
- [ ] Ensure the hook can be used anywhere in the app and provides all necessary information for mini-app/Frame integration (auth, context, actions, etc.).
- [ ] Support all required Mini App surfaces:
  - [ ] Splash screen handling ([Splash Screen](docs/miniapp-llm-full.md#splash-screen))
  - [ ] Header rendering ([Header](docs/miniapp-llm-full.md#header))
  - [ ] Modal sizing ([Size & Orientation](docs/miniapp-llm-full.md#size--orientation))

## Error Handling & Loading States
- [ ] Handle initialization errors and expose them via context.
- [ ] Expose loading and error states for consumers to handle UI feedback.
- [ ] Use try/catch for async SDK calls, log errors, and provide user-friendly error messages.
- [ ] Reference: [Error Handling](docs/miniapp-llm-full.md#user-experience) and [Loading your app](docs/miniapp-llm-full.md#loading-your-app).

## Documentation
- [ ] Document the context shape, hook usage, and integration steps in the codebase.
  - [ ] Reference: [Building with AI](docs/miniapp-llm-full.md#building-with-ai) for LLM-friendly documentation.
- [ ] Define strong TypeScript types for all context values, actions, and events.
  - [ ] Reference: [API](docs/miniapp-llm-full.md#api) and [Manifest](docs/miniapp-llm-full.md#manifest) for type inspiration.
- [ ] Ensure the provider and hook follow the established code patterns and best practices in the codebase.

## Advanced/Optional
- [ ] Support notification event handling and webhook integration ([Sending Notifications](docs/miniapp-llm-full.md#sending-notifications), [Receiving webhooks](docs/miniapp-llm-full.md#receiving-webhooks)).
- [ ] Support Mini App embed meta tag parsing and rendering ([Mini App Embed](docs/miniapp-llm-full.md#mini-app-embed), [Sharing your app](docs/miniapp-llm-full.md#sharing-your-app)).
- [ ] Support manifest file validation and usage ([Manifest](docs/miniapp-llm-full.md#manifest), [Publishing your app](docs/miniapp-llm-full.md#publishing-your-app)).

# Farcaster Mini Apps

## Getting Started

import { Caption } from '../../components/Caption';

### Overview

Mini apps are web apps built with HTML, CSS, and Javascript that can be discovered
and used within Farcaster clients. You can use an SDK to access native
Farcaster features, like authentication, sending notifications, and interacting
with the user's wallet.

### Quick Start

For new projects, you can set up an app using the
[@farcaster/create-mini-app](https://github.com/farcasterxyz/frames/tree/main/packages/create-mini-app)
CLI. This will prompt you to set up a project for your app.

:::code-group
```bash [npm]
npm create @farcaster/mini-app
```

```bash [pnpm]
pnpm create @farcaster/mini-app
```

```bash [yarn]
yarn create @farcaster/mini-app
```
:::

Remember, you can use whatever your favorite web framework is to build Mini
Apps so if these options aren't appealing you can setup the SDK in your own
project by following the instructions below.

### Manual Setup

For existing projects, install the Frames SDK:

#### Package Manager

:::code-group
```bash [npm]
npm install @farcaster/frame-sdk
```

```bash [pnpm]
pnpm add @farcaster/frame-sdk
```

```bash [yarn]
yarn add @farcaster/frame-sdk
```
:::

#### CDN

If you're not using a package manager, you can also use the Frame SDK via an
ESM-compatible CDN such as esm.sh. Simply add a `<script type="module">` tag to
the bottom of your HTML file with the following content.

```html
<script type="module">
  import { sdk } from 'https://esm.sh/@farcaster/frame-sdk'
</script>
```

### Building with AI

These docs are LLM friendly so that you use the latest models to build your
applications.

1. Use the Ask in ChatGPT buttons available on each page to interact with the
   documentation.

<video autoPlay muted playsInline loop>
  <source src="/ask_in_chatgpt.mp4" type="video/mp4" />

  Your browser does not support the video tag.
</video>

2. Use the <a class="vocs_Anchor vocs_Link vocs_Link_accent" href="/llms-full.txt">llms-full.txt</a> to keep your LLM up to date with these docs:

<picture>
  <img alt="setup mini app docs in cursor" src="/cursor-setup.png" width="auto" />
</picture>

<br />

<Caption>
  Adding the Mini App docs to Cursor
</Caption>

#### How does this work?

This entire site is converted into a single markdown doc that can fit inside
the context window of most LLMs. See [The /llms.txt file](https://llmstxt.org/)
standards proposal for more information.

### Next Steps

You'll need to do a few more things before distributing your app to users:

1. publish the app by providing information about who created it and how it should displayed
2. make it sharable in feeds


## Specification

A Mini App is a web application that renders inside a Farcaster client.

### Mini App Embed

The primary discovery points for Mini Apps are social feeds. Mini App Embeds
are an OpenGraph-inspired metadata standard that lets any page in a Mini App
be rendered as a rich object that can launch user into an application.

![mini app embed](/embed_schematic.png)

#### Versioning

Mini App Embeds will follow a simple versioning scheme where non-breaking
changes can be added to the same version but a breaking change must accompany a
version bump.

#### Metatags

A Mini App URL must have a FrameEmbed in a serialized form in the `fc:frame` meta tag in the HTML `<head>`. When this URL is rendered in a cast, the image is displayed in a 3:2 ratio with a button underneath. Clicking the button will open a Mini App to the provided action url and use the splash page to animate the transition.

```html
<meta name="fc:frame" content="<stringified Embed JSON>" />
```

#### Schema

| Property | Type   | Required | Description             | Constraints                                    |
| -------- | ------ | -------- | ----------------------- | ---------------------------------------------- |
| version  | string | Yes      | Version of the embed.   | Must be "1" or "next"                          |
| imageUrl | string | Yes      | Image url for the embed | Max 1024 characters. Must be 3:2 aspect ratio. |
| button   | object | Yes      | Button                  |                                                |

##### Button Schema

| Property | Type   | Required | Description    | Constraints                 |
| -------- | ------ | -------- | -------------- | --------------------------- |
| title    | string | Yes      | Mini App name. | Max length 32 characters    |
| action   | object | Yes      | Action         | Max length 1024 characters. |

##### Action Schema

| Property              | Type   | Required | Description                                                                        | Constraints                                  |
| --------------------- | ------ | -------- | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| type                  | string | Yes      | Mini App name.                                                                     | Max length 32 characters                     |
| url                   | string | No       | App URL to open. If not provided, defaults to full URL used to fetch the document. | Max length 1024 characters.                  |
| name                  | string | No       |                                                                                    | Name of the application                      |
| splashImageUrl        | string | No       | URL of image to show on loading screen.                                            | Max length 32 characters. Must be 200x200px. |
| splashBackgroundColor | string | No       | Hex color code to use on loading screen.                                           | Hex color code.                              |

##### Example

```json
{
  "version": "next",
  "imageUrl": "https://yoink.party/framesV2/opengraph-image",
  "button": {
    "title": "🚩 Start",
    "action": {
      "type": "launch_frame",
      "name": "Yoink!",
      "url": "https://yoink.party/framesV2",
      "splashImageUrl": "https://yoink.party/logo.png",
      "splashBackgroundColor": "#f5f0ec"
    }
  }
}
```

### App Surface

![https://github.com/user-attachments/assets/66cba3ca-8337-4644-a3ac-ddc625358390](https://github.com/user-attachments/assets/66cba3ca-8337-4644-a3ac-ddc625358390)

#### Header

Hosts should render a header above the Mini App that includes the name and
author specified in the manifest. Clients should show the header whenever the
Mini App is launched.

#### Splash Screen

Hosts should show a splash screen as soon as the app is launched. The icon
and background must be specified in the Mini App manifest or embed meta tags.
The Mini App can hide the splash screen once loading is complete.

![splash schematic](/splash_screen_schematic.png)

#### Size & Orientation

A Mini App should be rendered in a vertical modal. Mobile Mini App sizes should
be dictated by device dimensions while web Mini App sizes should be set to
424x695px.

### SDK

Mini Apps can communicate with their Host using a JavaScript SDK. At this time
there is no formal specification for the message passing format, Hosts and Apps
should use the open-source NPM packages that can be found in the
[farcasterxyz/miniapps](https://github.com/farcasterxyz/miniapps) repo.

This SDK facilitates communication over a `postMessage` channel available in
iframes and mobile WebViews.

#### Versioning

The SDK is versioned using [Semantic Versioning](https://semver.org/). A
[What's New page](/docs/sdk/changelog) is maintained to communicate developer
impacting changes. A [lower level
changelog](https://github.com/farcasterxyz/miniapps/blob/main/packages/frame-sdk/CHANGELOG.md)
is maintained within the code base to document all changes.

#### API

* [context](/docs/sdk/context) - provides information about the context the Mini App is running in

##### Actions

* [addFrame](/docs/sdk/actions/add-frame) - Prompts the user to add the Mini App
* [close](/docs/sdk/actions/close) - Closes the Mini App
* [composeCast](/docs/sdk/actions/compose-cast) - Prompt the user to cast
* [ready](/docs/sdk/actions/ready) - Hides the Splash Screen
* [signin](/docs/sdk/actions/sign-in) - Prompts the user to Sign In with Farcaster
* [openUrl](/docs/sdk/actions/open-url) - Open an external URL
* [viewProfile](/docs/sdk/actions/view-profile) - View a Farcaster profile

##### Wallet

* [ethProvider](/docs/sdk/wallet) - [EIP-1193 Ethereum Provider](https://eips.ethereum.org/EIPS/eip-1193)

#### Events

The SDK allows Mini Apps to [subscribe to events](/docs/sdk/events) emitted by the Host.

### Manifest

Mini Apps can publish metadata that allows Farcaster clients to more deeply
integrate with their Mini App. This file is published at
`/.well-known/farcaster.json` and the [Fully Qualified Domain
Name](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) where it is
hosted uniquely identifies the Mini App. The Manifest contains data that allows
Farcaster clients to verify the author of the app, present the Mini App in
discovery surfaces like app stores, and allows the Mini App to send
notifications.

#### Versioning

Manfiests will follow a simple versioning scheme where non-breaking
changes can be added to the same version but a breaking change must accompany a
version bump.

#### Schema

| Property           | Type   | Required | Description                                      |
| ------------------ | ------ | -------- | ------------------------------------------------ |
| accountAssociation | object | Yes      | Verifies domain ownership to a Farcaster account |
| frame              | object | Yes      | Metadata about the Mini App                      |

##### accountAssociation

The account association verifies authorship of this domain to a Farcaster
account.

The value is set to the JSON representation of a [JSON Farcaster
Signature](https://github.com/farcasterxyz/protocol/discussions/208) from the
account's custody address with the following payload:

```json
{
  domain: string;
}
```

The `domain` value must exactly match the FQDN of where it is hosted.

##### Schema

| Property  | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| header    | string | Yes      | base64 encoded JFS header |
| payload   | string | Yes      | base64 encoded payload    |
| signature | string | Yes      | base64 encoded signature  |

##### Example

```json
{
  "header": "eyJmaWQiOjM2MjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Q4NWEwOTMyNjFmNTkyNzA4MDRBNkVBNjk3Q2VBNENlQkVjYWZFIn0",
  "payload": "eyJkb21haW4iOiJ5b2luay5wYXJ0eSJ9",
  "signature": "MHgwZmJiYWIwODg3YTU2MDFiNDU3MzVkOTQ5MDRjM2Y1NGUxMzVhZTQxOGEzMWQ5ODNhODAzZmZlYWNlZWMyZDYzNWY4ZTFjYWU4M2NhNTAwOTMzM2FmMTc1NDlmMDY2YTVlOWUwNTljNmZiNDUxMzg0Njk1NzBhODNiNjcyZWJjZTFi"
}
```

##### frame

Metadata needed to by Hosts to distribute the Mini App.

import ManifestAppConfigSchema from "../../snippets/manifestAppConfigSchema.mdx"

<ManifestAppConfigSchema />

##### Example

import ManifestAppConfigExample from "../../snippets/manifestAppConfigExample.mdx"

<ManifestAppConfigExample />

#### Example

Example of a valid farcaster.json manifest:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjM2MjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Q4NWEwOTMyNjFmNTkyNzA4MDRBNkVBNjk3Q2VBNENlQkVjYWZFIn0",
    "payload": "eyJkb21haW4iOiJ5b2luay5wYXJ0eSJ9",
    "signature": "MHgwZmJiYWIwODg3YTU2MDFiNDU3MzVkOTQ5MDRjM2Y1NGUxMzVhZTQxOGEzMWQ5ODNhODAzZmZlYWNlZWMyZDYzNWY4ZTFjYWU4M2NhNTAwOTMzM2FmMTc1NDlmMDY2YTVlOWUwNTljNmZiNDUxMzg0Njk1NzBhODNiNjcyZWJjZTFi"
  },
  "frame": {
    "version": "1",
    "name": "Yoink!",
    "iconUrl": "https://yoink.party/logo.png",
    "homeUrl": "https://yoink.party/framesV2/",
    "imageUrl": "https://yoink.party/framesV2/opengraph-image",
    "buttonTitle": "🚩 Start",
    "splashImageUrl": "https://yoink.party/logo.png",
    "splashBackgroundColor": "#f5f0ec",
    "webhookUrl": "https://yoink.party/api/webhook"
  }
}
```

#### Caching

Farcaster clients may cache the manifest for a Mini App but should provide a
way for refreshing the manifest file.

### Adding Mini Apps

Mini Apps can be added to their Farcaster client by users. This enables the user
to quickly navigate back to the app and the app to send notifications to the
user.

Mini Apps can prompt the user to add the app during an interaction with the
[addFrame](/docs/sdk/actions/add-frame) action. Hosts may also let users add Mini
Apps from discovery surfaces like app stores or featured notifications.

Before a user adds a Mini App the Host should display information about the app
and a reminder that the app will be able to notify the user.

When a user adds a Mini App the Host must generate the appropriate Server
Events and send them to the Mini App's `webhookUrl` if one was provided.

After a user adds a Mini App, the Host should make it easy to find and launch
the Mini App by providing a top-level interface where users can browse and open
added apps.

#### Server Events

The Host server POSTs 4 types of events to the Mini App server at the
`webhookUrl` specified in its Mini App manifest:

* `frame_added`
* `frame_removed`
* `notifications_enabled`
* `notifications_disabled`

The body looks like this:

Events use the [JSON Farcaster
Signature](https://github.com/farcasterxyz/protocol/discussions/208) format and
are signed with the app key of the user. The final format is:

```
{
  header: string;
  payload: string;
  signature: string;
}
```

All 3 values are `base64url` encoded. The payload and header can be decoded to
JSON, where the payload is different per event.

##### frame\_added

This event may happen when an open frame calls `actions.addFrame` to prompt the
user to favorite it, or when the frame is closed and the user adds the frame
elsewhere in the client application (e.g. from a catalog).

Adding a frame includes enabling notifications.

The Host server generates a unique `notificationToken` and sends it
together with the `notificationUrl` that the frame must call, to both the
Host client and the frame server. Client apps must generate unique
tokens for each user.

Webhook payload:

```json
{
  "event": "frame-added",
  "notificationDetails": {
    "url": "https://api.warpcast.com/v1/frame-notifications",
    "token": "a05059ef2415c67b08ecceb539201cbc6"
  }
}
```

```ts
type EventFrameAddedPayload = {
  event: 'frame_added';
  notificationDetails?: FrameNotificationDetails;
};
```

##### frame\_removed

A user can remove a frame, which means that any notification tokens for that
fid and client app (based on signer requester) should be considered invalid:

Webhook payload:

```json
{
  "event": "frame-removed"
}
```

##### notifications\_disabled

A user can disable frame notifications from e.g. a settings panel in the client
app. Any notification tokens for that fid and client app (based on signer
requester) should be considered invalid:

Webhook payload:

```json
{
  "event": "notifications_disabled"
}
```

##### notifications\_enabled

A user can enable frame notifications (e.g. after disabling them). The client
backend again sends a `notificationUrl` and a `token`, with a backend-only
flow:

Webhook payload:

```json
{
  "event": "notifications-enabled",
  "notificationDetails": {
    "url": "https://api.warpcast.com/v1/frame-notifications",
    "token": "a05059ef2415c67b08ecceb539201cbc6"
  }
}
```

```ts
type EventNotificationsEnabledPayload = {
  event: 'notifications_enabled';
  notificationDetails: FrameNotificationDetails;
};
```

#### Notifications

A Mini App server can send notifications to one or more users who have enabled
them.

The Mini App server is given an authentication token and a URL which they can
use to push a notification to the specific Farcaster app that invoked the Mini
App. This is private and must be done separately for each Farcaster client that
a user may use.

The Mini App server calls the `notificationUrl` with the following JSON body:

import SendNotificationRequestSchema from '../../snippets/sendNotificationRequestSchema.mdx'

<SendNotificationRequestSchema />

The response from the client server must be an HTTP 200 OK with the following JSON body:

import SendNotificationResponseSchema from '../../snippets/sendNotificationResponseSchema.mdx'

<SendNotificationResponseSchema />

Once a user has been notified, when clicking the notification the client app will:

* Open `targetUrl`
* Set the context to the notification, see `NotificationLaunchContext`

##### Rate Limits

Host servers should impose rate limits per `token` to prevent intentional or accidentally abuse. The recommended rate limits are:

* 1 notification per 30 seconds per `token`
* 100 notifications per day per `token`

##### Displaying notifications

Hosts should display a user's Mini App notifications from their UI as follows:

![notifications schematic](/notification_schematic.png)

##### Controls

Hosts should provide controls for the user to toggle their notification
settings for their apps.

* Users should be able to navigate to settings for any Mini App they've added
  and be able to enable or disable notifications from this menu
* Users should be able to disable notifications for a Mini App directly from a
  notification from that Mini App


import { Caption } from '../../../components/Caption';

## Authenticating users

An app can use the [signIn](/docs/sdk/actions/sign-in) to get a [Sign in with
Farcaster (SIWF)](https://docs.farcaster.xyz/developers/siwf/) authentication credential for the user.

After requesting the credential, applications can verify it on their server
using
[verifySignInMessage](https://docs.farcaster.xyz/auth-kit/client/app/verify-sign-in-message).
Apps can then issue a session token like a JWT that can be used for the
remainder of the session.

Session tokens should be kept in memory but not persisted in Local Storage or
Cookies. Since users are signing in through their Farcaster client their
expectation will be if they sign out of the their Farcaster client they'll be
signed out of any Mini Apps as well.

### User Experience

In cases where the Farcaster client (i.e. on mobile) has direct access to the
user's signing key (e.g. their custody account) this credential can be produced
silently without the user needing to take any action. Otherwise the user will be
prompted to sign in.

Farcaster clients are working to support silent sign-in across all platforms so
that users are never prompted to sign in on a different device.

![signing in a user](/sign_in_preview.png)

<Caption>
  A users opens an app and is automatically signed in
</Caption>


import { Caption } from '../../../components/Caption';

## Loading your app

When users open Mini Apps in Farcaster they are shown a branded splash screen
instead of a blank loading page like they would in a browser. Once your interface
is ready to show the splash screen can be hidden.

![calling ready to hide the splash screen](/ready_preview.png)

<Caption>
  Dismiss the Splash Screen with ready.
</Caption>

### Calling ready

Call [ready](/docs/sdk/actions/ready) when your interface is ready to be displayed:

```ts twoslash
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.ready();
```

**You should call ready as soon as possible while avoiding jitter and content
reflows.**

Minimize loading time for your app by following web performance best practices:

* [Learn about web performance](https://web.dev/learn/performance)
* [Test your app's speed and diagnose performance issues](https://pagespeed.web.dev/analysis/https-pagespeed-web-dev/bywca5kqd1?form_factor=mobile)

<br />

To avoid jitter and content reflowing:

* Don't call ready until your interface has loaded
* Use placeholders and skeleton states if additional loading is required

#### Disabling native gestures

Mini Apps are rendered in modal elements where certain swipe gestures or clicks
outside the app surface will result in the app closing. If your app has conflicting
gestures you can set the `disableNativeGestures` flag to disable native gestures.

```ts
await sdk.actions.ready({ disableNativeGestures: true });
```

### Splash Screen

When a user launches your app they will see a Splash Screen while your app loads.

![splash screen schematic](/splash_screen_schematic.png)

You'll learn how to configure the Splash Screen in the [sharing your
app](/docs/guides/sharing) and [publishing your app](/docs/guides/publishing)
guides.

### Previewing your app

This app doesn't do anything interesting yet but we've now done the bare
minimum to preview it inside a Farcaster client.

Let's preview it in Warpcast:

1. Open the [Mini App Debug Tool](https://warpcast.com/~/developers/mini-apps/debug)
   on desktop
2. Enter your app url
3. Hit *Preview*


import { Caption } from '../../../components/Caption';

## Sending Notifications

Mini Apps can send notifications to users who have added the Mini App to
their Farcaster client and enabled notifications.

![in-app notifications in Warpcast](/in-app-notifications-preview.png)

<Caption>
  An in-app notification is sent to a user and launches them into the app
</Caption>

### Overview

At a high-level notifications work like so:

* when a user enables notifications for your app, the Farcaster client (i.e. Warpcast)
  hosting your app will generate a notification token for that user and send it
  to your server
* to send a notification to a user, make a request to host's servers with the
  notification token and content
* if a user later disables notifications, you'll receive another event indicating
  the user is unsubscribed and the notification token is no longer valid

### Steps

::::steps
#### Listen for events

You'll need a server to receive webhook events and a database to store
notification tokens for users:

* **Managed** - If you'd rather stay focused on your app, use
  [Neynar](https://neynar.com) to manage notification tokens on your behalf:<br />
  [Setup a managed notifications server with
  Neynar](https://docs.neynar.com/docs/send-notifications-to-frame-users#step-1-add-events-webhook-url-to-frame-manifest).
* **Roll your own** - If you want to host your own server to receive webhooks:<br />
  [Follow the Receiving Webhooks guide](#receiving-webhooks).

#### Add your webhook URL in `farcaster.json`

If you haven't already, follow the [Publishing your app](/docs/guides/publishing) guide to host a
`farcaster.json` on your app's domain.

Define the `webhookUrl` property in your app's configuration in `farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjU0NDgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg2MWQwMEFENzYwNjhGOEQ0NzQwYzM1OEM4QzAzYUFFYjUxMGI1OTBEIn0",
    "payload": "eyJkb21haW4iOiJleGFtcGxlLmNvbSJ9",
    "signature": "MHg3NmRkOWVlMjE4OGEyMjliNzExZjUzOTkxYTc1NmEzMGZjNTA3NmE5OTU5OWJmOWFmYjYyMzAyZWQxMWQ2MWFmNTExYzlhYWVjNjQ3OWMzODcyMTI5MzA2YmJhYjdhMTE0MmRhMjA4MmNjNTM5MTJiY2MyMDRhMWFjZTY2NjE5OTFj"
  },
  "frame": {
    "version": "1",
    "name": "Example App",
    "iconUrl": "https://example.com/icon.png",
    "homeUrl": "https://example.com",
    "imageUrl": "https://example.com/image.png",
    "buttonTitle": "Check this out",
    "splashImageUrl": "https://example.com/splash.png",
    "splashBackgroundColor": "#eeccff",
    "webhookUrl": "https://example.com/api/webhook" // [!code focus] 
  }
}
```

:::note
For a real example, this is Yoink's manifest:
[https://yoink.party/.well-known/farcaster.json](https://yoink.party/.well-known/farcaster.json)
:::

#### Get users to add your app

For a Mini App to send notifications, it needs to first be added by a user to
their Farcaster client and for notifications to be enabled (these will be
enabled by default).

Use the [addFrame](/docs/sdk/actions/add-frame) action while a user is using your app to prompt
them to add it:

#### Save the notification tokens

When notifications are enabled, the Farcaster client generates a unique
notification token for the user. This token is sent webhook endpoint along with
a `url` that the app should call to send a notification.

The `token` and `url` need to be securely saved to database so they can be
looked up when you want to send a notification to a particular user.

#### Send a notification

![notifications schematic](/notification_schematic.png)

Once you have a notification token for a user, you can send them a notification
by sending a `POST` request the `url` associated with that token.

:::tip
If your are sending the same notification to multiple users, you batch up to a
100 sends in a single request by providing multiple `tokens`.
:::

The body of that request must match the following JSON schema:

import SendNotificationRequestSchema from '../../../snippets/sendNotificationRequestSchema.mdx'

<SendNotificationRequestSchema />

The server should response with an HTTP 200 OK and the following JSON body:

import SendNotificationResponseSchema from '../../../snippets/sendNotificationResponseSchema.mdx'

<SendNotificationResponseSchema />

<br />

When a user clicks the notification, the Farcaster client will:

* Open your Mini App at `targetUrl`
* Set the `context.location` to a `FrameLocationNotificationContext`

```ts
export type FrameLocationNotificationContext = {
  type: 'notification';
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
};
```

[Example code to send a
notification](https://github.com/farcasterxyz/frames-v2-demo/blob/7905a24b7cd254a77a7e1a541288379b444bc23e/src/app/api/send-notification/route.ts#L25-L65)

##### Rate Limits

Host servers may impose rate limits per `token`. The standard rate limits,
which are enforced by Warpcast, are:

* 1 notification per 30 seconds per `token`
* 100 notifications per day per `token`
::::

### Receiving webhooks

Users can add and configure notification settings Mini Apps within their
Farcaster client. When this happens Farcaster clients will send events your
server that include data relevant to the event.

This allows your app to:

* keep track of what users have added or removed your app
* securely receive tokens that can be used to send notifications to your users

:::note
If you'd rather stay focused on your app, [Neynar](https://neynar.com) offers a
[managed service to handle
webhooks](https://docs.neynar.com/docs/send-notifications-to-frame-users#step-1-add-events-webhook-url-to-frame-manifest)
on behalf of your application.
:::

#### Events

##### frame\_added

Sent when the user adds the Mini App to their Farcaster client (whether or not
this was triggered by an `addFrame()` prompt).

The optional `notificationDetails` object provides the `token` and `url` if the
client equates adding to enabling notifications (Warpcast does this).

##### Payload

```json
{
  "event": "frame_added",
  "notificationDetails": {
    "url": "https://api.warpcast.com/v1/frame-notifications",
    "token": "a05059ef2415c67b08ecceb539201cbc6"
  }
}
```

##### frame\_removed

Sent when a user removes a mini app, which means that any notification tokens for
that fid and client app (based on signer requester) should be considered
invalid:

##### Payload

```json
{
  "event": "frame_removed"
}
```

##### notifications\_disabled

Sent when a user disables notifications from e.g. a settings panel in the
client app. Any notification tokens for that fid and client app (based on
signer requester) should be considered invalid:

##### Payload

```json
{
  "event": "notifications_disabled"
}
```

##### notifications\_enabled

Sent when a user enables notifications (e.g. after disabling them). The payload
includes a new `token` and `url`:

##### Payload

```json
{
  "event": "notifications_enabled",
  "notificationDetails": {
    "url": "https://api.warpcast.com/v1/frame-notifications",
    "token": "a05059ef2415c67b08ecceb539201cbc6"
  }
}
```

#### Handling events

Farcaster clients will POST events to the `webhookUrl` specified in your `farcaster.json`.

Your endpoint should:

* verify the event
* persist relevant data
* return a 200 response

If your app doesn't respond with a 200, the Farcaster client will attempt to
re-send the event. The exact number of retries is up to each client.

#### Verifying events

Events are signed by the app key of a user with a [JSON Farcaster
Signature](https://github.com/farcasterxyz/protocol/discussions/208). This allows
Mini Apps to verify the Farcaster client that generated the notification and the
Farcaster user they generated it for.

The
[`@farcaster/frame-node`](https://github.com/farcasterxyz/frames/tree/main/packages/frame-node)
library provides a helper for verifying events. To use it, you'll need to supply a validation
function that can check the signatures against the latest Farcaster network state.

An implementation that uses [Neynar](https://neynar.com) is provided. You can sign up and get
an API key on their free tier. Make sure to set `NEYNAR_API_KEY` environment variable.

#### Example

```ts twoslash
const requestJson = "base64encodeddata";

// ---cut---
import {
  ParseWebhookEvent,
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/frame-node";

try {
  const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
} catch (e: unknown) {
  const error = e as ParseWebhookEvent.ErrorType;

  switch (error.name) {
    case "VerifyJsonFarcasterSignature.InvalidDataError":
    case "VerifyJsonFarcasterSignature.InvalidEventDataError":
      // The request data is invalid
    case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
      // The app key is invalid
    case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
      // Internal error verifying the app key (caller may want to try again)
  }
}
```

#### Reference implementation

For a complete example, check out the [Mini App V2 Demo
](https://github.com/farcasterxyz/frames-v2-demo) has all of the above:

* [Handles webhooks](https://github.com/farcasterxyz/frames-v2-demo/blob/main/src/app/api/webhook/route.ts) leveraging the [`@farcaster/frame-node`](https://github.com/farcasterxyz/frames/tree/main/packages/frame-node) library that makes this very easy
* [Saves notification tokens to Redis](https://github.com/farcasterxyz/frames-v2-demo/blob/main/src/lib/kv.ts)
* [Sends notifications](https://github.com/farcasterxyz/frames-v2-demo/blob/main/src/lib/notifs.ts)


import { Caption } from '../../../components/Caption';

## Publishing your app

Publishing Mini Apps involves providing information like who developed the app,
how it should be displayed, and what its capabilities are.

Since Farcaster is a decentralized network with multiple clients, publishing is
done by hosting a manifest file at `/.well-known/farcaster.json` on the domain
your app is hosted on rather than submitting information directly to a single
entity.

![discover mini apps](/explore-preview.png)

<Caption>
  Published Mini Apps can be discovered in App Stores.
</Caption>

### Steps

::::steps
#### Choose a domain

A Mini App is associated with a single domain (i.e. rewards.warpcast.com). This
domain serves as the identifier for your app and can't be changed later so
you should choose a stable domain.

There's no limit on the number of apps you can create. You can create a separate
domain specifically for development purposes if needed.

:::note
A domain does not include the scheme (e.g. https) or path. It can optionally
include a subdomain.

* ✅ rewards.warpcast.com
* ❌ [https://rewards.warpcast.com](https://rewards.warpcast.com)
:::

#### Host a manifest file

Host a manifest file on your chosen domain at `/.well-known/farcaster.json`.

For now we'll create an empty file:

```sh
touch public/.well-known/farcaster.json
```

#### Define your application configuration

A Mini App has metadata that is used by Farcaster clients to host your app. This
data is specified in the `frame` property of the manifest and has the following properties:

import ManifestAppConfigSchema from "../../../snippets/manifestAppConfigSchema.mdx"

<ManifestAppConfigSchema />

Here's an example `farcaster.json` file:

```json
{
  "frame": {
    "version": "1",
    "name": "Yoink!",
    "iconUrl": "https://yoink.party/logo.png",
    "homeUrl": "https://yoink.party/framesV2/",
    "imageUrl": "https://yoink.party/framesV2/opengraph-image",
    "buttonTitle": "🚩 Start",
    "splashImageUrl": "https://yoink.party/logo.png",
    "splashBackgroundColor": "#f5f0ec",
  }
}
```

:::note
You can omit `webhookUrl` for now. We'll show you how to set it up in the
[sending notifications guide](/docs/guides/notifications).
:::

### Verifying ownership

A Mini App is owned by a single Farcaster account. This lets users know who
they are interacting with and developers get credit for their work.

:::tip
Verified Mini Apps are automatically eligible for [Warpcast Developer
Rewards](https://warpcast.com/~/mini-apps/rewards) that are paid out weekly
based on usage and onchain transactions.
:::

![verified author ](/verified_author.png)

Verification is done by placing a cryptographically signed message in the
`accountAssociation` property of your `farcaster.json`.

You can generate a signed account association object using the [Mini App
Manifest Tool](https://warpcast.com/~/developers/new) in Warpcast. Take
the output from that tool and update your `farcaster.json` file.

:::warning
The domain you host the file on must exactly match the domain you entered in
the Warpcast tool.
:::

Here's an example `farcaster.json` file for the domain `yoink.party` with the
account association:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjM2MjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyY2Q4NWEwOTMyNjFmNTkyNzA4MDRBNkVBNjk3Q2VBNENlQkVjYWZFIn0",
    "payload": "eyJkb21haW4iOiJ5b2luay5wYXJ0eSJ9",
    "signature": "MHgwZmJiYWIwODg3YTU2MDFiNDU3MzVkOTQ5MDRjM2Y1NGUxMzVhZTQxOGEzMWQ5ODNhODAzZmZlYWNlZWMyZDYzNWY4ZTFjYWU4M2NhNTAwOTMzM2FmMTc1NDlmMDY2YTVlOWUwNTljNmZiNDUxMzg0Njk1NzBhODNiNjcyZWJjZTFi"
  },
  "frame": {
    "version": "1",
    "name": "Yoink!",
    "iconUrl": "https://yoink.party/logo.png",
    "homeUrl": "https://yoink.party/framesV2/",
    "imageUrl": "https://yoink.party/framesV2/opengraph-image",
    "buttonTitle": "🚩 Start",
    "splashImageUrl": "https://yoink.party/logo.png",
    "splashBackgroundColor": "#f5f0ec",
    "webhookUrl": "https://yoink.party/api/webhook"
  }
}
```
::::


import { Caption } from '../../../components/Caption';

## Sharing your app

Mini Apps can be shared in social feeds using special embeds that let users
interact with an app directly from their feed.

Each URL in your application can be made embeddable by adding meta tags to it
that specify an image and action, similar to how Open Graph tags work.

For example:

* a personality quiz app can let users share a personalized embed with their results
* an NFT marketplace can let users share an embed for each listing
* a prediction market app can let users share an embed for each market

![sharing an app in a social feed with a embed](/share_preview.png)

<Caption>
  A viral loop: user discovers app in feed → uses app → shares app in feed
</Caption>

### Sharing a page in your app

Add a meta tag in the `<head>` section of the page you want to make
sharable specifying the embed metadata:

```html
<meta name="fc:frame" content="<stringified FrameEmbed JSON>" />
```

When a user shares the URL with your embed on it in a Farcaster client, the
Farcaster client will fetch the HTML, see the `fc:frame` meta tag, and use it
to render a rich card.

### Properties

![mini app embed](/embed_schematic.png)

#### `version`

The string literal `'next'`.

#### `imageUrl`

The URL of the image that should be displayed.

* the image will be displayed at 3:2 aspect ratio.
* the image must be less than 10MB
* The URL must be \<= 1024 characters

#### `button.title`

This text will be rendered in the button. Use a clear call-to-action that hints
to the user what action they can take in your app.

#### `button.action.type`

The string literal `'launch_frame'`.

#### `button.action.url` (optional)

The URL that the user will be sent to within your app. If not provided, it defaults to the current webpage URL (including query parameters).

#### `button.action.name` (optional)

Name of the application. Defaults to name of your application in `farcaster.json`.

#### `button.action.splashImageUrl` (optional)

Splash image URL. Defaults to `splashImageUrl` specified in your application's `farcaster.json`.

#### `button.action.splashBackgroundColor` (optional)

Splash image Color. Defaults to `splashBackgroundColor` specified in your application's `farcaster.json`.

### Example

```typescript
const frame = {
  version: "next",
  imageUrl: "https://yoink.party/framesV2/opengraph-image",
  button: {
    title: "🚩 Start",
    action: {
      type: "launch_frame",
      url: "https://yoink.party/framesV2",
      name:"Yoink!",
      splashImageUrl: "https://yoink.party/logo.png",
      splashBackgroundColor:"#f5f0ec"
    }
  }
}
```

```html
<html lang="en">
  <head>
    <!-- head content -->
    <meta name="fc:frame" content='{"version":"next","imageUrl":"https://yoink.party/framesV2/opengraph-image","button":{"title":"🚩 Start","action":{"type":"launch_frame","name":"Yoink!","url":"https://yoink.party/framesV2","splashImageUrl":"https://yoink.party/logo.png","splashBackgroundColor":"#f5f0ec"}}}' />
  </head>
  <body>
    <!-- page content -->
  </body>
</html>
```

### Debugging

You can use the [Mini App Embed
Tool](https://warpcast.com/~/developers/mini-apps/embed) in Warpcast to preview
a embed.

import ExposeLocalhost from '../../../snippets/exposeLocalhost.mdx';

<ExposeLocalhost />

### Caching

Since embeds are shared in feeds, they are generally scraped once and cached so
that they can be efficiently served in the feeds of hundreds or thousands
users.

This means that when a URL gets shared, the embed data present at that time
will be attached to the cast and won't be updated even if the embed data at
that URL gets changed.

#### Lifecycle

1. App adds an `fc:frame` meta tag to a page to make it sharable.
2. User copies URL and embeds it in a cast.
3. Farcaster client fetches the URL and attaches the frame metadata to the cast.
4. Farcaster client injects the cast + embed + attached metadata into thousands of feeds.
5. User sees cast in feed with an embed rendered from the attached metadata.

### Next steps

Now that you know how to create embeds for your app, think about how you'll get
users to share them in feed. For instance, you can create a call-to-action once
a user takes an action in your app to share a embed in a cast.

At the very least you'll want to setup a embed for the root URL of your application.

### Advanced Topics

#### Dynamic Embed images

Even though the  data attached to a specific cast is static, a dynamic
image can be served using tools like Next.js
[Next ImageResponse](https://nextjs.org/docs/app/api-reference/functions/image-response).

For example, we could create an embed that shows the current price of ETH. We'd
set the `imageUrl` to a static URL like `https://example.xyz/eth-price.png`. When a request
is made to this endpoint we'd:

* fetch the latest price of ETH (ideally from a cache)
* renders an image using a tool like [Vercel
  OG](https://vercel.com/docs/functions/og-image-generation) and returns it
* sets the following header: `Cache-Control: public, immutable, no-transform,
  max-age=300`

##### Setting `max-age`

You should always set a non-zero `max-age` (outside of testing) so that the
image can get cached and served from CDNs, otherwise users will see a gray
image in their feed while the dynamic image is generated. You'll also quickly
rack up a huge bill from your service provider. The exact time depends on your
application but opt for the longest time that still keeps the image reasonably
fresh. If you're needing freshness less than a minute you should reconsider
your design or be prepared to operate a high-performance endpoint.

Here's some more reading if you're interested in doing this:

* [Vercel Blog - Fast, dynamic social card images at the Edge](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images)
* [Vercel Docs - OG Image Generation](https://vercel.com/docs/og-image-generation)

##### Avoid caching fallback images

If you are generating a dynamic images there's a chance something goes wrong when
generating the image (for instance, the price of ETH is not available) and you need
to serve a fallback image.

In this case you should use an extremely short or even 0 `max-age` to prevent the
error image from getting stuck in any upstream CDNs.


import { Caption } from '../../../components/Caption';

## Interacting with Wallets

Mini Apps can interact with a user's crypto wallet without needing to worry
about popping open "select your wallet" dialogs or flakey connections.

![users taking onchain action from app](/transaction-preview.png)

<Caption>
  A user minting an NFT using the Warpcast Wallet.
</Caption>

### Getting Started

The Mini App SDK exposes an [EIP-1193 Ethereum Provider
API](https://eips.ethereum.org/EIPS/eip-1193) at `sdk.wallet.ethProvider`.

We recommend using [Wagmi](https://wagmi.sh) to connect to and interact with
the users wallet. This is not required but provides high-level hooks for
interacting with the wallet in a type-safe way.

::::steps
#### Setup Wagmi

Use the [Getting Started
guide](https://wagmi.sh/react/getting-started#manual-installation) to setup
Wagmi in your project.

#### Install the connector

Next we'll install a Wagmi connector that will be used to interact with the
user's wallet:

:::code-group
```bash [npm]
npm install @farcaster/frame-wagmi-connector
```

```bash [pnpm]
pnpm add @farcaster/frame-wagmi-connector
```

```bash [yarn]
yarn add @farcaster/frame-wagmi-connector
```
:::

#### Add to Wagmi configuration

Add the Mini App connector to your Wagmi config:

```ts
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
})
```

#### Connect to the wallet

If a user already has a connected wallet the connector will automatically
connect to it (e.g. `isConnected` will be true).

It's possible a user doesn't have a connected wallet so you should always check
for a connection and prompt them to connect if they aren't already connected:

```tsx
import { useAccount, useConnect } from 'wagmi'

function ConnectMenu() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()

  if (isConnected) {
    return (
      <>
        <div>You're connected!
        <div>Address: {address}</div>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect
    </button>
  )
}
```

:::note
Your Mini App won't need to show a wallet selection dialog that is common in a
web based dapp, the Farcaster client hosting your app will take care of getting
the user connected to their preferred crypto wallet.
:::

#### Send a transaction

You're now ready to prompt the user to transact. They will be shown a preview
of the transaction in their wallet and asked to confirm it:

Follow [this guide from
Wagmi](https://wagmi.sh/react/guides/send-transaction#_2-create-a-new-component)
on sending a transaction (note: skip step 1 since you're already connected to
the user's wallet).
::::

### Troubleshooting

#### Transaction Scanning

Modern crypto wallets scan transactions and preview them to users to help
protect users from scams. New contracts and applications can generate false
positives in these systems. If your transaction is being reported as
potentially malicious use this [Blockaid
Tool](https://report.blockaid.io/verifiedProject) to verify your app with
Blockaid.


## What's New

### April 22, 2025 (0.0.36)

* Added `noindex` field to manifest (see [discussions/204](https://github.com/farcasterxyz/miniapps/discussions/204))

### April 16, 2025 (0.0.35)

* Introduced new manifest metadata fields (see [discussions/191](https://github.com/farcasterxyz/miniapps/discussions/191))
* Deprecated `imageUrl` and `buttonTitle` (see [discussions/194](https://github.com/farcasterxyz/miniapps/discussions/194))
* Made `url` optional in `actionLaunchFrameSchema` - when not provided, it defaults to the current webpage URL (including query parameters) (see [discussions/189](https://github.com/farcasterxyz/miniapps/discussions/189))

### April 6, 2024 (0.0.34)

* Increased URL max length to 1024 characters


## Context

When your app is opened it can access information about the session from
`sdk.context`. This object provides basic information about the user, the
client, and where your app was opened from:

```ts
export type FrameContext = {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  location?: FrameLocationContext;
  client: {
    clientFid: number;
    added: boolean;
    safeAreaInsets?: SafeAreaInsets;
    notificationDetails?: FrameNotificationDetails;
  };
};
```

### Properties

#### `location`

Contains information about the context from which the Mini App was launched.

```ts
export type CastEmbedLocationContext = {
  type: 'cast_embed';
  embed: string;
  cast: {
    fid: number;
    hash: string;
  };
};

export type NotificationLocationContext = {
  type: 'notification';
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
};

export type LauncherLocationContext = {
  type: 'launcher';
};

export type ChannelLocationContext = {
  type: 'channel';
  channel: {
    /**
     * Channel key identifier
     */
    key: string;

    /**
     * Channel name
     */
    name: string;

    /**
     * Channel profile image URL
     */
    imageUrl?: string;
  };
};

export type LocationContext =
  | CastEmbedLocationContext
  | NotificationLocationContext
  | LauncherLocationContext
  | ChannelLocationContext;
```

##### Cast Embed

Indicates that the Mini App was launched from a cast (where it is an embed).

```ts
> sdk.context.location
{
  type: "cast_embed",
  cast: {
    fid: 3621,
    hash: "0xa2fbef8c8e4d00d8f84ff45f9763b8bae2c5c544",
  }
}
```

##### Notification

Indicates that the Mini App was launched from a notification triggered by the frame.

```ts
> sdk.context.location
{
  type: "notification",
  notification: {
    notificationId: "f7e9ebaf-92f0-43b9-a410-ad8c24f3333b"
    title: "Yoinked!",
    body: "horsefacts captured the flag from you.",
  }
}
```

##### Launcher

Indicates that the Mini App was launched directly by the client app outside of a context, e.g. via some type of catalog or a notification triggered by the client.

```ts
> sdk.context.location
{
  type: "launcher"
}
```

#### `user`

Details about the calling user which can be used to customize the interface. This should be considered untrusted since it is passed in by the application, and there is no guarantee that it was authorized by the user.

```ts
export type AccountLocation = {
  placeId: string;

  /**
   * Human-readable string describing the location
   */
  description: string;
};

export type UserContext = {
  fid: number;
  username?: string;
  displayName?: string;

  /**
   * Profile image URL
   */
  pfpUrl?: string;
  location?: AccountLocation;
};
```

```ts
> sdk.context.user
{
  "fid": 6841,
  "username": "deodad",
  "displayName": "Tony D'Addeo",
  "pfp": "https://i.imgur.com/dMoIan7.jpg",
  "bio": "Building @warpcast and @farcaster, new dad, like making food",
  "location": {
    "placeId": "ChIJLwPMoJm1RIYRetVp1EtGm10",
    "description": "Austin, TX, USA"
  }
}
```

```ts
type User = {
  fid: number;
  username?: string;
  displayName?: string;
  pfp?: string;
  bio?: string;
  location?: {
    placeId: string;
    description: string;
  };
};
```

#### client

Details about the Farcaster client running the Mini App. This should be considered untrusted

* `clientFid`: the self-reported FID of the client (e.g. 9152 for Warpcast)
* `added`: whether the user has added the Mini App to the client
* `safeAreaInsets`: insets to avoid areas covered by navigation elements that obscure the view
* `notificationDetails`: in case the user has enabled notifications, includes the `url` and `token` for sending notifications

```ts
export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type ClientContext = {
  clientFid: number;
  added: boolean;
  notificationDetails?: FrameNotificationDetails;
  safeAreaInsets?: SafeAreaInsets;
};
```

```ts
> sdk.context.client
{
  clientFid: 9152,
  added: true,
  safeAreaInsets: {
    top: 0,
    bottom: 20,
    left: 0,
    right: 0,
  };
  notificationDetails: {
    url: "https://api.warpcast.com/v1/frame-notifications",
    token: "a05059ef2415c67b08ecceb539201cbc6"
  }
}
```

```ts
type FrameNotificationDetails = {
  url: string;
  token: string;
};

type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type ClientContext = {
  clientFid: number;
  added: boolean;
  safeAreaInsets?: SafeAreaInsets;
  notificationDetails?: FrameNotificationDetails;
};
```

##### Using safeAreaInsets

Mobile devices render navigation elements that obscure the view of an app. Use
the `safeAreaInsets` to render content in the safe area that won't be obstructed.

A basic usage would to wrap your view in a container that adds margin:

```
<div style={{
  marginTop: context.client.safeAreaInsets.top,
  marginBottom: context.client.safeAreaInsets.bottom,
  marginLeft: context.client.safeAreaInsets.left,
  marginRight: context.client.safeAreaInsets.right,
}}>
  ...your app view
</div>
```

However, you may want to set these insets on specific elements: for example if
you have tab bar at the bottom of your app with a different background, you'd
want to set the bottom inset as padding there so it looks attached to the
bottom of the view.


## Client Events

When a user interacts with your app events will be sent from the Farcaster
client to your application client.

Farcaster clients emit events to directly to your app client while it is open that can
be used to update your UI in response to user actions.

To listen to events, you have to use `sdk.on` to register callbacks ([see full
example](https://github.com/farcasterxyz/frames-v2-demo/blob/20d454f5f6b1e4f30a6a49295cbd29ca7f30d44a/src/components/Demo.tsx#L92-L124)).

Listeners can be cleaned up with `sdk.removeListener()` or sdk.removeAllListeners()\`.

### Events

#### frameAdded

The user added the Mini App.

#### frameRemoved

The user removed the Mini App.

#### notificationsEnabled

The user enabled notifications after previously having them disabled.

#### notificationsDisabled

The user disabled notifications.


import { Caption } from '../../../components/Caption';

## Wallet

![users taking onchain action from app](/transaction-preview.png)

<Caption>
  A user minting an NFT using the Warpcast Wallet.
</Caption>

The SDK exposes an [EIP-1193 Ethereum Provider
](https://eips.ethereum.org/EIPS/eip-1193) at `sdk.wallet.ethProvider`. You can
interact with this object directly or use it with ecosystem tools like
[Wagmi](https://wagmi.sh/) or [Ethers](https://docs.ethers.org/v6/).

For more information:

* [EIP-1193 Ethereum Provider API](https://eips.ethereum.org/EIPS/eip-1193)
* [Guide on interacting with wallets](/docs/guides/wallets)


import { Caption } from '../../../../components/Caption';

## addFrame

Prompts the user to add the app.

![adding a mini app in Warpcast](/add_frame_preview.png)

<Caption>
  A users discover an app from their social feed, adds it, and then sees it
  from their apps screen
</Caption>

### Usage

```ts twoslash
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.addFrame()
```

### Return Value

`void`

### Errors

#### `RejectedByUser`

Thrown if a user rejects the request to add the Mini App.

#### `InvalidDomainManifestJson`

Thrown an app does not have a valid `farcaster.json`.


import { Caption } from '../../../../components/Caption';

## close

Closes the mini app.

![closing the app](/close_preview.png)

<Caption>
  Close the app with `close`.
</Caption>

### Usage

```ts twoslash
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.close()
```

### Return Value

`void`


import { Caption } from '../../../../components/Caption';

## composeCast

Open the cast composer with a suggested cast. The user will be able to modify
the cast before posting it.

![composing a cast](/compose_cast_action.png)

<Caption>
  An app prompts the user to cast and includes an embed.
</Caption>

### Usage

```ts twoslash
/**
 * Cryptographically secure nonce generated on the server and associated with
 * the user's session.
 */ 
const text = "I just learned how to compose a cast";
const embeds = ["https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast"] as [string];

// ---cut---
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.composeCast({ 
  text,
  embeds,
})
```

### Parameters

#### text (optional)

* **Type:** `string`

Suggested text for the body of the cast.

Mentions can be included using the human-writeable form (e.g. @farcaster).

#### embeds (optional)

* **Type:** `[] | [string] | [string, string]`

Suggested embeds. Max two.

#### parent (optional)

* **Type:** `{ type: 'cast'; hash: string }`

Suggested parent of the cast.

#### close (optional)

* **Type:** `boolean`

Whether the app should be closed when this action is called. If true the app
will be closed and the action will resolve with no result.

### Return Value

The cast posted by the user, or `undefined` if set to close.

```ts twoslash
import { sdk } from "@farcaster/frame-sdk";

// ---cut---
const result = await sdk.actions.composeCast({ 
//    ^?  
  text: "I just learned how to compose a cast",
  embeds: ["https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast"]
})










```


import { Caption } from '../../../../components/Caption';

## openUrl

Opens an external URL.

If a user is on mobile `openUrl` can be used to deeplink
users into different parts of the Farcaster client they
are using.

![opening a url](/open_url_preview.png)

<Caption>
  Opening an external url with `openUrl`.
</Caption>

### Usage

```ts twoslash
const url = 'https://farcaster.xyz';

//---cut---
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.openUrl(url)
```

### Return Value

\`void


import { Caption } from '../../../../components/Caption';

## ready

Hides the Splash Screen. Read the [guide on loading your app](/docs/guides/loading) for best practices.

![calling ready to hide the splash screen](/ready_preview.png)

<Caption>
  Dismiss the Splash Screen with ready.
</Caption>

### Usage

```ts twoslash
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.ready()
```

### Parameters

#### disableNativeGestures (optional)

* **Type:** `boolean`
* **Default:** `false`

Disable native gestures. Use this option if your frame uses gestures
that conflict with native gestures like swipe to dismiss.

### Return Value

`void`


import { Caption } from '../../../../components/Caption';

## signIn

Request a [Sign in with Farcaster
(SIWF)](https://docs.farcaster.xyz/developers/siwf/) credential from the user.

See the guide on [authenticating users](/docs/guides/auth).

![signing in a user](/sign_in_preview.png)

<Caption>
  A users opens an app and is automatically signed in
</Caption>

### Usage

```ts twoslash
/**
 * Cryptographically secure nonce generated on the server and associated with
 * the user's session.
 */ 
const nonce = 'securenonce';

// ---cut---
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.signIn({ 
  nonce 
})
```

### Parameters

#### nonce

* **Type:** `string`

A random string used to prevent replay attacks, at least 8 alphanumeric
characters.

### Return Value

The SIWF message and signature.

```
type SignInResult = {
  signature: string;
  message: string;
}
```

:::note
This message must be sent to your server and verified. See the guide on
[authenticating with Farcaster](/docs/guides/loading) for more information.
:::


import { Caption } from '../../../../components/Caption';

## viewProfile

Displays a user's Farcaster profile.

![viewing a profile from an app](/view_profile_preview.png)

<Caption>
  Viewing a profile and follow a user from an app.
</Caption>

### Usage

```ts twoslash
const fid = 6841;

// ---cut---
import { sdk } from '@farcaster/frame-sdk'

await sdk.actions.viewProfile({ 
  fid
})
```

### Parameters

#### fid

* **Type:** `number`

Farcaster ID of the user who's profile to view.

### Return Value

`void`

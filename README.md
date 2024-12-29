# Nounspace
[![build](https://github.com/hellno/herocast/actions/workflows/build.yaml/badge.svg)](https://github.com/hellno/herocast/actions/workflows/build.yaml)

Forked from [herocast](https://github.com/hellno/herocast/)

# Docs
https://docs.nounspace.com/nounspace-alpha/

## What is Farcaster?
a protocol for decentralized social apps: https://www.farcaster.xyz

## 🏗️ Dev Setup

1. Clone the repo
2. Install Supabase CLI: <br> e.g. for MacOS with `brew install supabase/tap/supabase`
3. Install dependencies `yarn install`
4. Create a file `.env.development.local`
5. Get the details you need for the file <br>
  a. get a Neynar API key https://docs.neynar.com/docs -> `NEYNAR_API_KEY` <br>
  b. get an Alchemy API key https://www.alchemy.com -> `NEXT_PUBLIC_ALCHEMY_API_KEY` <br>
  c. get your Farcaster account FID and mnemonic -> `NEXT_PUBLIC_APP_FID` + `APP_MNENOMIC`<br>
  d. launch local copy of Supabase with `supabase start` (in the root directory of this repo), use the info provided -> <br>
 `API URL`:`NEXT_PUBLIC_SUPABASE_URL` + `anon key`:`NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing and making Fidgets

See the [contributing docs](docs/CONTRIBUTING.MD) for how to add to the code base.

## Code Design

The Nounspace App follows the Atomic Design Pattern
![atomic_design](https://github.com/Nounspace/nounspace.ts/assets/7180740/2c892612-c730-4e74-bd32-3e7a8a6babbb)

`src/pages` holds the Page elements of the atomic design. These are separated from `src/common` due to how Next.js handles routing.

`src/common/ui` contains all of the display components for all other layers of the atomic design. `src/common/ui/components` are a mixture of Molecules and Organisms that were imported from `herocast`, they still need to be split into their appropriate folders (`src/common/ui/molecules` & `src/common/ui/organisms`).

`src/common/data` contains access to datastreams, in the form of database connections and API's

`src/common/lib` contains useful functions for accessing formatted data, along with helpers functions inside the `utils` directory.

`src/styles` contains information for managing website styling

`src/constants` contains all static information that is needed to run the app. This includes actual constants, along with some global types

### Refactoring

This file structure is adapted from `herocast`, and not all files have been cleaned up properly. If you find files or data that are placed in the wrong location, please refactor it. For example, there are some constants that are not placed in the `src/constants` directory, and instead are in the other files


### DB scheme: accounts
reminder: key is an edcsa key not a 'normal' EVM address

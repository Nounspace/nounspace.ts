# Nounspace
[![build](https://github.com/hellno/herocast/actions/workflows/build.yaml/badge.svg)](https://github.com/hellno/herocast/actions/workflows/build.yaml)

Forked from [herocast](https://github.com/hellno/herocast/)

## What is Farcaster?
a protocol for decentralized social apps: https://www.farcaster.xyz

## 🏗️ Dev Setup

1. Clone the repo
2. Install Supabase CLI: <br> e.g. for MacOS with `brew install supabase/tap/supabase`
3. Install dependencies `yarn install`
4. Create a file `.env.development.local`
5. Get the details you need for the file <br>
  a. get a Neynar API key https://docs.neynar.com/docs -> `NEXT_PUBLIC_NEYNAR_API_KEY` <br>
  b. get an Alchemy API key https://www.alchemy.com -> `NEXT_PUBLIC_ALCHEMY_API_KEY` <br>
  c. get your Farcaster account FID and mnemoic -> `NEXT_PUBLIC_APP_FID` + `NEXT_PUBLIC_APP_MNENOMIC`<br>
  d. launch local copy of Supabase with `supabase start`, use the info provided -> <br>
 `API URL`:`NEXT_PUBLIC_SUPABASE_URL` + `anon key`:`NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Design

The Nounspace App follows the Atomic Design Pattern
![atomic_design](https://github.com/Nounspace/nounspace.ts/assets/7180740/2c892612-c730-4e74-bd32-3e7a8a6babbb)

Atoms and Moluclues can be found in the `src/shared/ui` foloder. Feel free to use existing ones or add your own.

Fidgets are a type of Organism, fulfilling the role of sections of a page. To build Fidgets, please add them to the `src/fidgets` directory.

Templates are the Fidget grid. Pages are managed by Nounspace


### DB scheme: accounts
reminder: key is an edcsa key not a 'normal' EVM address

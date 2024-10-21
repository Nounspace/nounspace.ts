# Contributing

To add any code to the `nounspace/Nounspace.ts` repo, you will need to open a PR.

## Typescript
Nounspace is written fully in typescript. At time of writing this (5/7/24), we are still in the process of fixing type errors that exist from the original codebase.

## Steps to open a PR
Nounspace expects its contributors to follow the "Fork and Pull" method to open PRs. Below is a TL;DR for this process

1. Fork `nounspace/Nounspace.ts`
  a. Press the `fork` button at the top of the page
  b. Copy the fork locally (`git clone {your url}`)
  c. Set up the `upstream` to `nounspace/Nounspace.ts` (`git remote add upstream git@github.com:Nounspace/nounspace.ts.git`)
2. Make changes in your fork
3. Commit your changes to your fork and push them to Github
4. Open a PR in the Github webapp

For more details on the "Fork and Pull" method, check out [Github's docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models).


## PR Expectations
- All commits follow [conventional commits](https://www.conventionalcommits.org/)
- PR's titles begin with either "[FIDGET]" or "[CLIENT]" to show if the changes made are a Fidget submission or a change to the client code base
- PR's bodies outline the changes made, and the rationale for them.
- All PR's contain no new type errors and are fully valid typescript code

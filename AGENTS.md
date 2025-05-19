# Repository Guidelines

This repository contains the **Nounspace** client built with Next.js and TypeScript. Contributions should follow the conventions below.

## Development
- Use **TypeScript** for all source files (`.ts`/`.tsx`).
- Run code formatting and lint checks before committing:
  ```bash
  yarn run prettier --write <file_path>
  yarn run eslint <file_path>
  ```
- Ensure new code compiles with `tsc` and does not introduce type errors.

## Pull Requests
- Commit messages must follow [conventional commits](https://www.conventionalcommits.org).
- PR titles start with either `[FIDGET]` or `[CLIENT]` to indicate the area of change.
- Describe the rationale for the change in the PR body.

## Repository Structure
- Components follow the Atomic Design pattern. Display components live under `src/common/ui` and pages under `src/pages` or `src/app`.
- Global providers are registered in `src/common/providers/index.tsx`.

Please keep this file up to date with any additional guidelines.

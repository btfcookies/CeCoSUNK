# Contributing to CeCoSUNK

Thanks for your interest in contributing! CeCoSUNK (Celestial Collision Simulator Utilizing Newtonian Kinematics) is a small browser-based simulator, so the process is intentionally lightweight.

## Getting started

1. Fork and clone the repo.
2. Install dependencies:
   ```
   npm install
   ```
3. Run the dev server:
   ```
   npm run dev
   ```
   This serves `public/` with live-server (live reload on save).

## Making changes

- Create a branch off `main` for your change (e.g. `feat/orbit-trails`, `fix/velocity-nan`).
- Keep changes focused — one feature or fix per pull request.
- Follow the existing commit message style seen in the project history, e.g.:
  - `feat: ...` for new functionality
  - `fix: ...` for bug fixes
  - `refactor: ...` for internal changes with no behavior change
- Test your changes manually in the browser before submitting (there is no automated test suite yet).

## Submitting a pull request

1. Push your branch and open a PR against `main`.
2. Describe what changed and why in the PR description.
3. Link any related issues.
4. Be responsive to review feedback — small projects move fast.

## Reporting bugs / suggesting features

Please open an issue on [GitHub](https://github.com/btfcookies/CeCoSunk/issues) with:
- A clear description of the problem or idea
- Steps to reproduce (for bugs)
- Screenshots or a short clip if it's visual

## Code style

- Keep it simple and readable — no build step or framework is in use, so plain, idiomatic JS/CSS/HTML is preferred.
- Avoid adding dependencies unless they're clearly worth the tradeoff for a project this size.

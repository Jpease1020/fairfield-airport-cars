// Declares Next.js asset module types (*.svg, *.png, *.jpg, etc.) so that a
// standalone `tsc --noEmit` type-check passes in CI.
//
// Next normally provides these via `next-env.d.ts`, but that file is generated
// by `next dev`/`next build` and is .gitignored — so a fresh CI checkout that
// runs `tsc` *before* any build has no `*.svg` declarations and fails with
// TS2307 (e.g. src/design/components/icons/svg/index.ts importing './logo.svg').
//
// This mirrors next-env.d.ts's reference to next/image-types/global (a package
// under node_modules, always present after `npm ci`). It's a no-op locally
// where next-env.d.ts already pulls in the identical declarations — TypeScript
// dedupes them, so there is no duplicate-module conflict.
/// <reference types="next/image-types/global" />

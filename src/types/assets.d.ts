/**
 * Type declarations for static asset imports not natively recognized by TypeScript.
 * These allow Next.js/webpack image imports (webp, png, jpg, svg, etc.) to be
 * typed correctly without errors during `pnpm typecheck`.
 */

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.avif" {
  const src: string;
  export default src;
}

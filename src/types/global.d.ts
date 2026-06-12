/// <reference types="google.maps" />
// The triple-slash reference force-includes the ambient `@types/google.maps`
// global `google` namespace. Without it (since the TS 6 / @types bump), the
// namespace stopped being auto-discovered and every google.maps usage failed
// with "Cannot find namespace 'google'".

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};

/**
 * Demo mode.
 *
 * When enabled, the app serves every API response from a dataset bundled into
 * the build instead of calling a backend. That makes the whole platform
 * deployable as a static Next.js app — no server, no database — which is what
 * the client-facing demo needs.
 *
 * Enabled by NEXT_PUBLIC_DEMO_MODE=true at build time. Left unset, the app
 * behaves exactly as before and talks to the real API.
 */

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Credentials shown on the demo login screen. */
export const DEMO_CREDENTIALS = {
  email: "adaeze.okonkwo@meridian-demo.com",
  password: "DemoPass123!",
};

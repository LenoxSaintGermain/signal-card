export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  oAuthPortalUrl: process.env.OAUTH_PORTAL_URL ?? process.env.VITE_OAUTH_PORTAL_URL ?? "",
  appOrigin: process.env.APP_ORIGIN ?? process.env.VITE_APP_ORIGIN ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  swarmBackendUrl: process.env.SWARM_BACKEND_URL ?? "",
  swarmOperatorApiKey: process.env.SWARM_OPERATOR_API_KEY ?? "",
  swarmRequestTimeoutMs: Number(process.env.SWARM_REQUEST_TIMEOUT_MS ?? 8_000),
};

function assertUrl(value: string, label: string) {
  try {
    new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

export function validateEnv() {
  const missing: string[] = [];

  if (!ENV.cookieSecret) missing.push("JWT_SECRET");
  if (!ENV.appId) missing.push("VITE_APP_ID");
  if (!ENV.oAuthServerUrl) missing.push("OAUTH_SERVER_URL");
  if (!ENV.oAuthPortalUrl) missing.push("OAUTH_PORTAL_URL (or VITE_OAUTH_PORTAL_URL)");
  if (!ENV.appOrigin) missing.push("APP_ORIGIN (or VITE_APP_ORIGIN)");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  assertUrl(ENV.oAuthServerUrl, "OAUTH_SERVER_URL");
  assertUrl(ENV.oAuthPortalUrl, "OAUTH_PORTAL_URL");
  assertUrl(ENV.appOrigin, "APP_ORIGIN");

  if (ENV.swarmBackendUrl) {
    assertUrl(ENV.swarmBackendUrl, "SWARM_BACKEND_URL");
  }
}

export function assertRequiredEnv() {
  validateEnv();
}

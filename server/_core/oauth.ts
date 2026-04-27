import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { randomBytes } from "crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { ENV, isOAuthConfigured } from "./env";
import { getOAuthStateCookieOptions, getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_STATE_TTL_MS = 5 * 60 * 1000;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function requireAppOrigin(): string {
  if (!ENV.appOrigin) {
    throw new Error(
      "APP_ORIGIN is not configured. Set APP_ORIGIN (or VITE_APP_ORIGIN) to the public base URL."
    );
  }
  return ENV.appOrigin.replace(/\/+$/, "");
}

function requireOAuthPortalUrl(): string {
  if (!ENV.oAuthPortalUrl) {
    throw new Error(
      "OAUTH_PORTAL_URL is not configured. Set OAUTH_PORTAL_URL (or VITE_OAUTH_PORTAL_URL)."
    );
  }
  return ENV.oAuthPortalUrl.replace(/\/+$/, "");
}

function requireAppId(): string {
  if (!ENV.appId) {
    throw new Error("VITE_APP_ID is not configured for OAuth.");
  }
  return ENV.appId;
}

function buildRedirectUri(): string {
  return `${requireAppOrigin()}/api/oauth/callback`;
}

function buildPortalLoginUrl(redirectUri: string, state: string): string {
  const portalBase = requireOAuthPortalUrl();
  const url = new URL("app-auth", `${portalBase}/`);
  url.searchParams.set("appId", requireAppId());
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/start", (req: Request, res: Response) => {
    try {
      if (!isOAuthConfigured()) {
        res
          .status(503)
          .json({ error: "OAuth is not configured for this deployment" });
        return;
      }

      const redirectUri = buildRedirectUri();
      const state = randomBytes(32).toString("base64url");
      const cookieOptions = getOAuthStateCookieOptions(req);

      res.cookie(OAUTH_STATE_COOKIE, state, {
        ...cookieOptions,
        maxAge: OAUTH_STATE_TTL_MS,
      });

      const portalUrl = buildPortalLoginUrl(redirectUri, state);
      res.redirect(302, portalUrl);
    } catch (error) {
      console.error("[OAuth] Start failed", error);
      res.status(500).json({ error: "OAuth start failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    if (!isOAuthConfigured()) {
      res
        .status(503)
        .json({ error: "OAuth is not configured for this deployment" });
      return;
    }

    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const cookies = parseCookieHeader(req.headers.cookie ?? "");
      const expectedState = cookies[OAUTH_STATE_COOKIE];
      const stateCookieOptions = getOAuthStateCookieOptions(req);

      if (!expectedState || expectedState !== state) {
        res.clearCookie(OAUTH_STATE_COOKIE, stateCookieOptions);
        res.status(400).json({ error: "Invalid OAuth state" });
        return;
      }

      res.clearCookie(OAUTH_STATE_COOKIE, stateCookieOptions);

      const redirectUri = buildRedirectUri();
      const tokenResponse = await sdk.exchangeCodeForToken(code, redirectUri);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

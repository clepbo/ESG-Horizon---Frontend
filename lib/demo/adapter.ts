import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { DEMO_CREDENTIALS } from "./index";

import dashboard from "./data/dashboard.json";
import user from "./data/user.json";
import assessments from "./data/assessments.json";
import reportDetail from "./data/report-detail.json";
import reports from "./data/reports.json";
import targets from "./data/targets.json";
import targetsWithProgress from "./data/targets-with-progress.json";
import targetLatestPair from "./data/target-latest-pair.json";
import subsidiaries from "./data/subsidiaries.json";
import activities from "./data/activities.json";
import companyProfile from "./data/company-profile.json";
import onboardingProgress from "./data/onboarding-progress.json";
import industries from "./data/industries.json";
import sectors from "./data/sectors.json";
import audit from "./data/audit.json";
import auditKpis from "./data/audit-kpis.json";

/**
 * Route table. Keys are matched against `METHOD /path` with numeric path
 * segments normalised to `:id`, so /report/47 and /report/51 share an entry.
 */
const ROUTES: Record<string, unknown> = {
  "GET /users/me": user,
  "GET /auth/status": { authenticated: true, user },

  "GET /company/esg/dashboard": dashboard,
  "GET /company/esg/onboarding-progress": onboardingProgress,
  "GET /company/esg/profile": companyProfile,
  "GET /company/esg/activities": activities,

  "GET /assessments": assessments,
  "GET /assessments/:id": assessments,

  "GET /report": reports,
  "GET /report/:id": reportDetail,
  "GET /report/one/:id": reportDetail,

  "GET /target": targets,
  "GET /target/with-progress": targetsWithProgress,
  "GET /target/latest": targetLatestPair,
  "GET /target/latest-pair": targetLatestPair,
  "GET /target/baseline-options": [],

  "GET /subsidiary": subsidiaries,
  "GET /subsidiary/company-subsidiaries": subsidiaries,

  "GET /industries": industries,
  "GET /industries/sectors": sectors,

  "GET /admin/audit": audit,
  "GET /admin/audit/kpis": auditKpis,
};

/** Strips the baseURL and query string, and normalises numeric ids. */
function routeKey(config: AxiosRequestConfig): string {
  const method = (config.method ?? "get").toUpperCase();
  let url = config.url ?? "";
  if (config.baseURL && url.startsWith(config.baseURL)) {
    url = url.slice(config.baseURL.length);
  }
  url = url.split("?")[0];
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  const normalised = url.replace(/\/\d+(?=\/|$)/g, "/:id");
  return `${method} ${normalised}`;
}

function respond(
  config: AxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Created",
    headers: {},
    config: config as AxiosResponse["config"],
  };
}

/** A touch of latency so loading states are visible rather than flashing. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const demoAdapter: AxiosAdapter = async (config) => {
  await delay(120 + Math.random() * 180);

  const key = routeKey(config);
  const method = (config.method ?? "get").toUpperCase();

  // --- Auth ------------------------------------------------------------------
  if (key === "POST /auth/login") {
    const body =
      typeof config.data === "string" ? JSON.parse(config.data) : config.data ?? {};
    const emailMatches =
      String(body.email ?? "").trim().toLowerCase() ===
      DEMO_CREDENTIALS.email.toLowerCase();
    const passwordMatches = String(body.password ?? "") === DEMO_CREDENTIALS.password;

    // Any @meridian-demo.com address with the shared demo password works, so a
    // presenter can sign in as whichever persona the story calls for.
    const isDemoAddress = String(body.email ?? "")
      .trim()
      .toLowerCase()
      .endsWith("@meridian-demo.com");

    if ((emailMatches || isDemoAddress) && passwordMatches) {
      return respond(
        config,
        { message: "Logged in successfully", user: (user as Record<string, unknown>) },
        201,
      );
    }
    const error = new Error("Invalid credentials") as Error & {
      response: AxiosResponse;
      isAxiosError: boolean;
      config: AxiosRequestConfig;
    };
    error.isAxiosError = true;
    error.config = config;
    error.response = respond(
      config,
      { message: "Invalid email or password." },
      401,
    );
    throw error;
  }

  if (key === "POST /auth/refresh" || key === "POST /auth/logout") {
    return respond(config, { message: "ok" }, 201);
  }

  // --- Reads -----------------------------------------------------------------
  if (method === "GET") {
    if (key in ROUTES) return respond(config, ROUTES[key]);
    // Unknown read: an empty success keeps a screen rendering its empty state
    // rather than throwing an error banner over the demo.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[demo] no fixture for ${key} — returning empty payload`);
    }
    return respond(config, { message: "No demo data for this view.", data: [] });
  }

  // --- Writes ----------------------------------------------------------------
  // The demo dataset is read-only. Mutations report success so buttons feel
  // responsive, but nothing is persisted and a refresh restores the dataset.
  return respond(config, { message: "Saved (demo mode — not persisted)." }, 201);
};

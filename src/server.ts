import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { startBackgroundAlertsWorker } from "./lib/notification-scheduler";

// Inicia o worker em background para envio automático periódico de programação e lembretes
try {
  startBackgroundAlertsWorker();
} catch (e) {
  console.error("Falha ao iniciar startBackgroundAlertsWorker:", e);
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Hosting compresses every response at the edge. Never compress a body (gzip, brotli,
// CompressionStream) or set content-encoding here or in a server route: the body gets encoded
// twice and renders garbled.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Rota HTTP Cron para disparar rotina automática externamente (via n8n Schedule Trigger ou Cron job)
    if (url.pathname === "/api/cron/daily-alerts") {
      try {
        const { processAllAutomatedAlerts } = await import("./lib/notification-scheduler");
        const { getServiceSupabase } = await import("./lib/supabase-service");
        const serviceDb = getServiceSupabase();
        const result = await processAllAutomatedAlerts(serviceDb);
        return new Response(JSON.stringify(result, null, 2), {
          status: result.ok ? 200 : 500,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }
    }

    if (url.pathname.startsWith("/auth/v1") || url.pathname.startsWith("/rest/v1") || url.pathname.startsWith("/storage/v1")) {
      const kongBase = (process.env["KONG_INTERNAL_URL"] || "http://kong:8000").replace(/\/+$/, "");
      const targetUrl = `${kongBase}${url.pathname}${url.search}`;
      const reqHeaders = new Headers(request.headers);
      reqHeaders.set("host", new URL(kongBase).host);
      // Evita que o undici/fetch descompacte o corpo mantendo Content-Encoding: gzip (ERR_CONTENT_DECODING_FAILED)
      reqHeaders.delete("accept-encoding");
      const upstreamRes = await fetch(targetUrl, {
        method: request.method,
        headers: reqHeaders,
        redirect: "manual",
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        // @ts-expect-error Node fetch duplex option
        duplex: "half",
      });
      const resHeaders = new Headers(upstreamRes.headers);
      resHeaders.delete("content-encoding");
      resHeaders.delete("content-length");
      resHeaders.delete("transfer-encoding");
      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        headers: resHeaders,
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

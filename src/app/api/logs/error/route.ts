import { supabaseClient } from "@/lib/supabase/clients";

import * as ERR from "@/lib/messages/error";
import { APP_ERROR_LOGS_TABLE } from "@/lib/supabase/contents/table";

/**
 * エラーログを supabase に集約する API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    const url = req.headers.get("referer") ?? "";

    // body 取得失敗
    const body = await req.json();
    if (!body?.logs || !Array.isArray(body.logs)) {
      throw new Error(ERR.PAYLOAD_ERROR);
    }

    const rows = body.logs.map((l: any) => ({
      message: l.message,
      name: l.name,
      stack: l.stack,
      component_stack: l.componentStack,
      detail: safeToJson(l.detail),
      severity: l.severity ?? "error",
      tags: l.tags ?? null,
      client_ts: new Date(l.timestamp).toISOString(),
      hash: l.hash ?? null,
      user_agent: ua,
      url,
    }));

    const { error } = await supabaseClient()
      .from(APP_ERROR_LOGS_TABLE)
      .insert(rows);

    // DB insert 失敗
    if (error) {
      throw new Error(`[logs.insert] ${error.message}`, { cause: error });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : ERR.UNKNOWN_ERROR;

    console.error(`${ERR.API_LOGS_ERROR}: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}

function safeToJson(x: unknown) {
  try {
    return typeof x === "string" ? JSON.parse(x) : x ?? null;
  } catch {
    return { raw: String(x) };
  }
}

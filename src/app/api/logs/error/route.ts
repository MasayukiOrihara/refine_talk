import { ErrorLogsRepo } from "@/lib/supabase/repositories/errorLogs.repo";

import * as ERR from "@/lib/messages/error";
import * as TYPE from "@/lib/type";
import { ErrorLogsPayloadSchema } from "@/lib/schema";

export type LOGS_ERROR_RESPONSE = {
  ok: boolean;
};

/**
 * エラーログを supabase に集約する API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    const url = req.headers.get("referer") ?? "";

    // body 取得
    const body = await req.json();
    const parsed = ErrorLogsPayloadSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error(`${ERR.PAYLOAD_ERROR} logs`);
    }
    const { logs } = parsed.data;

    // todo: sessionidも送る
    const rows: TYPE.ErrorLogsPayload[] = logs.map((log) => ({
      id: log.id,
      message: log.message,
      name: log.name,
      stack: log.stack,
      component_stack: log.componentStack,
      detail: safeToJson(log.detail),
      severity: log.severity ?? "error",
      tags: log.tags ?? null,
      occurred_at: new Date(log.timestamp).toISOString(),
      hash: log.hash ?? null,
      user_agent: ua,
      url,
    }));

    // DB 更新
    await ErrorLogsRepo.insert(rows);

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : ERR.UNKNOWN_ERROR;

    console.error(`${ERR.API_LOGS_ERROR}: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * オブジェクトを json 型にパースする
 * @param x
 * @returns
 */
function safeToJson(x: unknown) {
  try {
    return typeof x === "string" ? JSON.parse(x) : x ?? null;
  } catch {
    return { raw: String(x) };
  }
}

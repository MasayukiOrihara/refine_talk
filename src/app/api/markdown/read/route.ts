import z from "zod";

import * as ERR from "@/lib/messages/error";
import { MarkdownInfo, MarkdownInfoSchema } from "@/lib/schema";
import path from "path";
import { readFile } from "fs/promises";

export const runtime = "nodejs";

/**
 * markdown ファイルを取得する API
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    // body 取得
    const body = await req.json();

    // チェック
    const parse = z.object({ mdInfo: MarkdownInfoSchema }).safeParse(body);
    if (!parse.success) {
      throw new Error(`${ERR.PAYLOAD_ERROR} mdInfo`);
    }
    const mdInfo: MarkdownInfo = parse.data.mdInfo;

    // 取得
    const abs = path.join(process.cwd(), mdInfo.dir, mdInfo.file);
    const page = await readFile(abs, "utf8");

    return Response.json(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : ERR.UNKNOWN_ERROR;

    console.error(`${ERR.MD_READ_ERROR}: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}

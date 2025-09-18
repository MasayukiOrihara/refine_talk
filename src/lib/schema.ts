import { z } from "zod";

/**
 * markdown の情報を取得するときのスキーマ
 */
export const MarkdownInfoSchema = z.object({
  file: z.string().trim().min(1),
  dir: z.string().trim().min(1),
  // 必要な項目を追加
});
export type MarkdownInfo = z.infer<typeof MarkdownInfoSchema>;

/**
 * エラーログを取り扱うスキーマ
 */
export const SeveritySchema = z.enum(["error", "warn", "info"]).optional();

export const AppErrorSchema = z
  .object({
    id: z.string(), // crypto.randomUUID() を想定
    sessionId: z.string().optional(),
    message: z.string().trim().min(1).max(2000), // 空文字を禁止
    detail: z.string().max(10000).optional(),
    name: z.string().max(200).optional(),
    stack: z.string().max(20000).optional(),
    componentStack: z.string().max(20000).optional(),
    timestamp: z
      .number()
      .int()
      .nonnegative()
      .refine(
        (ts) => ts < Date.now() + 5 * 60_000,
        "timestamp is in the future"
      ),
    severity: SeveritySchema,
    tags: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
    hash: z.string().max(200).optional(),
    sent: z.boolean().optional(),
  })
  .strict(); // 余計なキーを拒否（許可したいなら .passthrough()）
export type AppErrorDTO = z.infer<typeof AppErrorSchema>;

export const ErrorLogsPayloadSchema = z
  .object({
    logs: z.array(AppErrorSchema).min(1).max(100), // 一度に送りすぎ防止
  })
  .strict();
export type ErrorLogsPayload = z.infer<typeof ErrorLogsPayloadSchema>;

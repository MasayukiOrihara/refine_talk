import { APP_ERROR_LOGS_TABLE } from "@/lib/contents/table";
import { supabaseClient } from "../clients";
import { dbTry } from "../db";
import { ErrorLogsPayload } from "@/lib/type";

/**
 * エラーログ
 */
export const ErrorLogsRepo = {
  insert: async (rows: ErrorLogsPayload[]) =>
    dbTry(async () => {
      const { error } = await supabaseClient()
        .from(APP_ERROR_LOGS_TABLE)
        .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

      if (error)
        throw new Error(`[logs.insert] ${error.message}`, { cause: error });
    }),
};

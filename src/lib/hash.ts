import { createHash as nodeCreateHash } from "crypto";

/** ハッシュ値を生成する自作関数 */
export function createHash(input: string): string {
  return nodeCreateHash("sha1") // sha256 や md5 でも可
    .update(input)
    .digest("hex");
}

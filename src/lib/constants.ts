/** マークダウンファイル名の定数配列 */
export const MARKDOWN_NAME = [
  "q1_morning-meeting.md",
  "q2_group-info.md",
  "q3_slide-review.md",
  "q4_meeting-report.md",
  "q5_phone-call.md",
  "q6_email-report.md",
];

/** プロンプト */
export const ANSWER_PROMPT =
  "以下はビジネスマナーに関する問題とそれに対するユーザーの回答です。ユーザーの回答をブラッシュアップする形で模範解答を作成してください。出力は模範回答のみ出力してください。それ以外のポイントの説明や装飾文字は出力しないでください。\n\n問題: \n{question}\n\nユーザーの回答: \n{user_answer}\n\n模範解答: ";

/** エラー時 */
export const FILE_NOT_FOUND = "ファイルが存在しません: ";
export const TOAST_ERROR = "エラーが発生しました";

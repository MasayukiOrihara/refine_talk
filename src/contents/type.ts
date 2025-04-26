/** メッセージ記憶用 */
export type MessageJson = {
    input: string;
    output: string;
    createdAt: string;
};

/** プロンプトテンプレート */
export type Variables = {
    id: number,
    name: string
};
export type PromptTemplateJson = {
    name: string,
    template: string,
    variables?: Variables[]
}
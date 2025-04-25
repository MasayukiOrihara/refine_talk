/** メッセージ記憶用 */
export type MessageMemoryJson = {
    input: string;
    output: string;
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
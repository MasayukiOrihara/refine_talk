export const SCENARIO_PATH = "public/markdowns/scenario";

export const scenarios = [
  {
    slug: "it-dev-intro.md",
    title: "💻 開発 新人",
    description: "IT従事者向け 初級 全6問",
    contents: [
      "進捗の報告",
      "不具合修正の報告",
      "仕様変更の共有",
      "ﾘﾘｰｽｽｹｼﾞｭｰﾙの共有",
      "設計用の判断に迷う場面",
      "納期調整の相談",
    ],
    file: [
      "it-dev-q1-progress-report.md",
      "it-dev-q2-bugfix-report.md",
      "it-dev-q3-spec-change.md",
      "it-dev-q4-release-schedule.md",
      "it-dev-q5-design-decision.md",
      "it-dev-q6-deadline-adjustment.md",
    ],
  },
  {
    slug: "it-ops-intro.md",
    title: "🖥 保守・監視 新人",
    description: "IT従事者向け 初級 全6問",
    contents: [
      "障害発生の報告",
      "定期ﾒﾝﾃﾅﾝｽ結果の報告",
      "ｼｽﾃﾑ停止予定の共有",
      "ｾｷｭﾘﾃｨパッチ適用の共有",
      "障害復旧対応の相談",
      "ﾘｿｰｽ増強の相談",
    ],
    file: [
      "it-ops-q1-incident-report.md",
      "it-ops-q2-maintenance-report.md",
      "it-ops-q3-downtime-notice.md",
      "it-ops-q4-security-patch.md",
      "it-ops-q5-incident-recovery.md",
      "it-ops-q6-resource-scaling.md",
    ],
  },

  {
    slug: "mfg-intro.md",
    title: "🏭 製造業 新人",
    description: "非IT従事者向け 初級 全6問",
    contents: [
      "品質検査の結果",
      "ﾄﾗﾌﾞﾙ報告",
      "工程変更の共有",
      "安全情報の共有",
      "品質異常への対応",
      "設備ﾄﾗﾌﾞﾙ時の判断",
    ],
    file: [
      "mfg-q1-quality-check.md",
      "mfg-q2-trouble-report.md",
      "mfg-q3-process-change.md",
      "mfg-q4-quality-issue-response.md",
      "mfg-q5-equipment-failure-response.md",
      "mfg-q6-safety-notice.md",
    ],
  },
  {
    slug: "sales-intro.md",
    title: "💼 営業 新人",
    description: "非IT従事者向け 初級 全6問",
    contents: [
      "商談結果の報告",
      "目標進捗の報告",
      "顧客訪問予定の共有",
      "契約条件変更の共有",
      "クレーム対応の相談",
      "値引き交渉の相談",
    ],
    file: [
      "sales-q1-meeting-result.md",
      "sales-q2-target-progress.md",
      "sales-q3-client-visit-schedule.md",
      "sales-q4-contract-terms-update.md",
      "sales-q5-complaint-handling.md",
      "sales-q6-price-negotiation.md",
    ],
  },
];

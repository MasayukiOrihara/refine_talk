export const Question: React.FC = () => {
  return (
    <div className="w-2xl m-5 text-zinc-500 border-zinc-200">
      <header className="my-2">
        <h1 className="text-2xl font-semibold">朝礼：口頭報告</h1>
      </header>

      <div className="border border-dashed p-6 rounded">
        <section>
          <header className="py-2 border-b">
            <h2 className="text-lg font-semibold">
              🚩 このカリキュラムのゴール
            </h2>
          </header>
          <div className="my-2">
            <p className="text-sm">
              当日予定していたタスクを朝礼で報告できるようになる。
            </p>
          </div>
        </section>
        <section>
          <header className="py-2 border-b">
            <h2 className="text-lg font-semibold">🎲 問題</h2>
          </header>
          <div className="my-2">
            <p className="text-sm">以下は本日の予定表である。</p>
            <div className="flex justify-center py-6">
              <table>
                <thead>
                  <tr>
                    <th className="border-b border-r border-zinc-200 px-4 py-2">
                      時間
                    </th>
                    <th className="border-b border-r border-zinc-200 px-4 py-2">
                      タスク
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-2">
                      現状進捗率
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-r px-4 py-2">09:00</td>
                    <td className="border-r px-4 py-2">朝礼</td>
                    <td className="text-center px-4 py-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r px-4 py-2">09:30</td>
                    <td className="border-r px-4 py-2">テストデータ作成</td>
                    <td className="text-center px-4 py-2">60%</td>
                  </tr>
                  <tr>
                    <td className="border-r px-4 py-2">12:00</td>
                    <td className="border-r px-4 py-2">昼休憩</td>
                    <td className="text-center px-4 py-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r px-4 py-2">13:00</td>
                    <td className="border-r px-4 py-2">発表準備</td>
                    <td className="text-center px-4 py-2">90%</td>
                  </tr>
                  <tr>
                    <td className="border-r px-4 py-2">14:00</td>
                    <td className="border-r px-4 py-2">ミーティング</td>
                    <td className="text-center px-4 py-2">-</td>
                  </tr>
                  <tr>
                    <td className="border-r px-4 py-2">15:30</td>
                    <td className="border-r px-4 py-2">テスト工程</td>
                    <td className="text-center px-4 py-2">0%</td>
                  </tr>
                  <tr>
                    <td className="border-r px-4 py-2">17:30</td>
                    <td className="border-r px-4 py-2">夕礼</td>
                    <td className="text-center px-4 py-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-sm">✅ 状況整理（背景・課題）</h3>
            <ul className="text-sm list-disc list-outside px-10">
              <li className="mb-2">
                テストデータの作成が前日に完了せず、本日午前にずれ込んだ
              </li>
              <li className="mb-2">原因は「仕様確認に時間を要した」ため</li>
              <li className="mb-2">
                テスト工程には入れるが、本日中の完了は難しい可能性がある
              </li>
            </ul>
            <h3 className="text-sm">✅ 遅れの対策</h3>
            <ul className="text-sm list-disc list-outside px-10">
              <li className="mb-2">
                対策①：明日午前のタスクを30分後ろ倒し → テスト時間を確保
              </li>
              <li className="mb-2">
                対策②：確認待ちが少ないテスト項目から着手 → 作業効率アップ
              </li>
            </ul>
            <h3 className="text-sm">✅ 再発防止策</h3>
            <ul className="text-sm list-disc list-outside px-10">
              <li className="mb-2">
                テストデータ作成時に午前中の進捗確認タイミングを設ける →
                遅れを早期に察知
              </li>
            </ul>
            <p className="text-sm my-4">
              上記を踏まえ、本日の予定を報告してください。<br></br>
              また点数が70点未満の場合、再び報告を行い70点以上を目指しましょう。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

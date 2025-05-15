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
            <ul className="text-sm list-disc list-outside px-10">
              <li className="mb-2">
                午後2時のミーティングでは発表する予定があり、資料はできているが上司に一度確認してほしい。
              </li>
              <li className="mb-2">
                前日までの計画では本日中にテスト工程を終わらせる予定だったが、テストデータの作成に手間取り時間がかかってしまい、まだテストデータの作成が終わっていない。
              </li>
              <li className="mb-2">
                テスト工程には入れる見通しだが、本日中にテスト工程は終わらないかもしれない。
              </li>
            </ul>
            <p className="text-sm my-4">
              上記を踏まえ、本日の予定を報告してください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

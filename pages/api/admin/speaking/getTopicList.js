import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = await getUserFromSession(req, res);

    try {
      // Google Sheetsの情報
      const spreadsheetId = '1pfKfTmiF_H11qSRToHNX8qcE0ApN4RrDxlx5V9DkQ3M'; // あなたのスプレッドシートIDに置き換えてください
      const range = 'topicList'; // シート名

      // Google Sheetsからデータを取得
      const rawData = await getGoogleSheetData(spreadsheetId, range);

      // ヘッダーとデータを分離
      const headers = rawData[0];
      const data = rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers[index];
          obj[key] = value;
        });
        return obj;
      });

      // Statusが 'Created' のものだけをフィルタ
      const filteredData = data.filter(row => row.Status === 'Created');

      // カテゴリごとにトピックリストを作成
      const categoryMap = {};
      filteredData.forEach(row => {
        const { Category, Topic, Status, FlagToCreate } = row;

        // カテゴリがすでに存在しなければ新しく作成
        if (!categoryMap[Category]) {
          categoryMap[Category] = {
            category: Category,
            topicList: []
          };
        }

        // トピックリストにトピックを追加
        categoryMap[Category].topicList.push({
          topicName: Topic,
          Status: Status,
          FlagToCreate: FlagToCreate
        });
      });

      // オブジェクトの配列に変換
      const result = Object.values(categoryMap);

      // 結果を返す
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

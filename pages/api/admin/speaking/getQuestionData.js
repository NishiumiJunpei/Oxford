import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = await getUserFromSession(req, res);

    try {
      const { category, topic } = req.body;

      // パラメータが指定されているか確認
      if (!category || !topic) {
        return res.status(400).json({ error: 'Category and topic are required' });
      }

      // Google Sheetsの情報
      const spreadsheetId = '1pfKfTmiF_H11qSRToHNX8qcE0ApN4RrDxlx5V9DkQ3M'; // あなたのスプレッドシートIDに置き換えてください
      const range = 'questionData'; // シート名

      // Google Sheetsからデータを取得
      const rawData = await getGoogleSheetData(spreadsheetId, range);

      // ヘッダーとデータを分離
      const headers = rawData[0]; // 1行目がヘッダー
      const data = rawData.slice(1); // ヘッダー以降のデータ

      // CategoryとTopicが一致するデータをフィルタリング
      const filteredData = data.filter(row => row[0] === category && row[1] === topic);

      // 一致するデータがない場合
      if (filteredData.length === 0) {
        return res.status(404).json({ error: 'No matching data found' });
      }

      // データを questionCategory 毎に構造化する
      const structuredData = filteredData.reduce((result, row) => {
        const [category, topic, questionCategory, question, simpleAnswer, detailedAnswer] = row;

        if (!result[questionCategory]) {
          result[questionCategory] = [];
        }

        result[questionCategory].push({
          question,
          simpleAnswer,
          detailedAnswer,
        });

        return result;
      }, {});

      // 整形されたデータを返す
      res.status(200).json(structuredData);

      } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

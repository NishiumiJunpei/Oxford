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
      const range = 'topicData'; // シート名

      // Google Sheetsからデータを取得
      const rawData = await getGoogleSheetData(spreadsheetId, range);

      // ヘッダーとデータを分離
      const headers = rawData[0]; // 1行目がヘッダー
      const data = rawData.slice(1); // ヘッダー以降のデータ

      // CategoryとTopicが一致するデータを探す
      const matchedData = data.find(row => row[0] === category && row[1] === topic);

      // 一致するデータがない場合
      if (!matchedData) {
        return res.status(404).json({ error: 'No matching data found' });
      }

      // Dataカラム (3列目) の内容をJSONにパース
      let parsedData;
      try {
        parsedData = JSON.parse(matchedData[2]); // 3列目にDataがある
        console.log('test', parsedData)
      } catch (error) {
        return res.status(500).json({ error: 'Failed to parse Data as JSON' });
      }

      // パースしたデータを返す
      res.status(200).json(parsedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

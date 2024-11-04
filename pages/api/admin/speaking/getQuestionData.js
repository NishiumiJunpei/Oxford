import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId } = await getUserFromSession(req, res);

  try {
    const { category, topic } = req.body;

    // パラメータが指定されているか確認
    if (!category || !topic) {
      return res.status(400).json({ error: 'Category and topic are required' });
    }

    // Google Sheetsの情報
    const spreadsheetId = '1pfKfTmiF_H11qSRToHNX8qcE0ApN4RrDxlx5V9DkQ3M';
    const range = 'questionData';

    // Google Sheetsからデータを取得
    const rawData = await getGoogleSheetData(spreadsheetId, range);

    // ヘッダーとデータを分離
    const headers = rawData[0];
    const data = rawData.slice(1);

    // CategoryとTopicが一致するデータをフィルタリングし、オブジェクト形式に整形
    const filteredData = data
      .filter(row => row[0] === category && row[1] === topic)
      .map(row => ({
        category: row[0],
        topic: row[1],
        questionE: row[2],
        questionJ: row[3],
        answerE: row[4],
        answerJ: row[5]
      }));

    // 一致するデータがない場合
    if (filteredData.length === 0) {
      return res.status(404).json({ error: 'No matching data found' });
    }

    // 整形されたデータを返す
    res.status(200).json(filteredData);

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
}

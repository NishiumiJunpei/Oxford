import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') { // GETリクエストに変更
    try {
      const { userId } = await getUserFromSession(req, res);
      // クエリパラメータからフィルタ用のパラメータを受け取る
      const { category1, category2, engLevel } = req.query; 

      const spreadsheetId = '1JJCY9EkGzlQb-l_0zRiKxjYsVds3Y73beJtEATErWuw';
      const range = 'phraseList'; // 読み込むシートと範囲
      const rawData = await getGoogleSheetData(spreadsheetId, range);

      const headers = rawData[0];
      let phraseList = rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers[index];
          obj[key] = value;
        });
        return obj;
      });

      // ユーザーの選択に基づいてフィルタリング
      phraseList = phraseList.filter(phrase => 
        (!category1 || phrase['category1'] === category1) && 
        (!category2 || phrase['category2'] === category2) && 
        (!engLevel || phrase['engLevel'] === engLevel)
      );

      res.status(200).json({ phraseList });

    } catch (error) {
      console.error('error', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']); // GETメソッドを許可
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

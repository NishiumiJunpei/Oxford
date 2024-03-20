import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';

const engLevelDisplayOrder = [
  {engLevel: 'CEFR A1', displayOrder: 1},
  {engLevel: 'CEFR A2', displayOrder: 2},
  {engLevel: 'CEFR B1', displayOrder: 3},
  {engLevel: 'CEFR B2', displayOrder: 4},
  {engLevel: 'CEFR C1', displayOrder: 5},
  {engLevel: 'CEFR C2', displayOrder: 6}
]

export default async function handler(req, res) {
  if (req.method === 'GET') { // このAPIはGETリクエストを想定
    try {
      const { userId } = await getUserFromSession(req, res);

      const spreadsheetId = '1JJCY9EkGzlQb-l_0zRiKxjYsVds3Y73beJtEATErWuw';
      const range = 'phraseList'; // 読み込むシートと範囲
      const rawData = await getGoogleSheetData(spreadsheetId, range);
      
      // rawDataからヘッダー行（最初の行）を取得
      const headers = rawData[0];
      // rawDataからデータ行（2行目以降）を取得し、それぞれの行をオブジェクトに変換
      const data = rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers[index]; // カラム名をキーとして使用
          obj[key] = value; // 当該行の値をセット
        });
        return obj;
      });
      
      
      let engLevels = {};

      data.forEach(row => {
        const engLevel = row.engLevel
        const category1 = row.category1
        const category2 = row.category2

        if (!engLevels[engLevel]) {
          engLevels[engLevel] = {};
        }

        if (!engLevels[engLevel][category1]) {
          engLevels[engLevel][category1] = new Set();
        }

        engLevels[engLevel][category1].add(category2);
      });

      // engLevelの表示順序をマップする
      const engLevelOrderMap = engLevelDisplayOrder.reduce((acc, item) => {
        acc[item.engLevel] = item.displayOrder;
        return acc;
      }, {});

      // Setオブジェクトを配列に変換
      Object.keys(engLevels).forEach(engLevel => {
        Object.keys(engLevels[engLevel]).forEach(category1 => {
          engLevels[engLevel][category1] = Array.from(engLevels[engLevel][category1]);
        });
      });

      // engLevelsのキーを表示順序に基づいてソートする
      let sortedEngLevels = Object.keys(engLevels).sort((a, b) => {
        return engLevelOrderMap[a] - engLevelOrderMap[b];
      }).reduce((acc, key) => {
        acc[key] = engLevels[key];
        return acc;
      }, {});


      res.status(200).json({ engLevels: sortedEngLevels });

    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

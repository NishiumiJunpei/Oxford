import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);

      // ----------------------------------------------------------------------------------------
      // ----------------------------------  categoryList   ----------------------------------
      // ----------------------------------------------------------------------------------------

      const spreadsheetId = '1JJCY9EkGzlQb-l_0zRiKxjYsVds3Y73beJtEATErWuw';
      const range = 'categoryList'; // 読み込むシートと範囲
      const rawData = await getGoogleSheetData(spreadsheetId, range);

      const headers = rawData[0];
      const data = rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers[index];
          obj[key] = value;
        });
        return obj;
      });


      const categoryList = data.filter(row => row.pickForApp === '1')

      // ----------------------------------------------------------------------------------------
      // ----------------------------------  phraseList   ----------------------------------
      // ----------------------------------------------------------------------------------------

      const range2 = 'phraseList'; // 読み込むシートと範囲
      const rawData2 = await getGoogleSheetData(spreadsheetId, range2);

      const headers2 = rawData2[0];
      const data2 = rawData2.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers2[index];
          obj[key] = value;
        });
        return obj;
      });

      // data2の配列から条件に合うデータを抽出
      const phraseList = data2.filter(row =>
        categoryList.some(categoryItem =>
          categoryItem.category1 === row.category1 &&
          categoryItem.category2 === row.category2 &&
          categoryItem.engLevel === row.engLevel
        )
      );


      // categoryListId で phraseList をソートする
      phraseList.forEach(phrase => {
        const categoryIndex = categoryList.findIndex(category => category.category2 === phrase.category2);
        const categoryItem = categoryList[categoryIndex]
        // categoryListId を追加。categoryList に該当する category2 が存在しない場合は、null または適切なデフォルト値を設定
        phrase.categoryListId = categoryItem ? categoryItem.id : null;
        phrase.categoryNo = categoryIndex + 1
      });
      phraseList.sort((a, b) => {
        // categoryListId が null または未定義の場合の処理
        if (a.categoryListId == null) return 1;
        if (b.categoryListId == null) return -1;
      
        return a.categoryListId - b.categoryListId;
      });
      

      console.log('test', phraseList)
      res.status(200).json({ categoryList, phraseList });

    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

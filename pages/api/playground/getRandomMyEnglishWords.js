import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';
import { shuffleArray } from '@/utils/utils';

const MAX_WORD_NUM = 30;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const spreadsheetId = '1Kc95utlTq10z6K3Ej7mbJYmjt6e1zBror9-q0FTFOJg';
      const range = '単語リスト!A2:E'; // Assuming data starts from the second row and includes the understanding level
      const data = await getGoogleSheetData(spreadsheetId, range);

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Set default understanding level to 0 if it's empty and include row index
      const processedData = data.map((row, index) => {
        const englishWord = row[0] || '';  // 英単語 (空白なら空文字列)
        const japaneseMeaning = row[1] || '';  // 日本語の意味 (空白なら空文字列)
        const exampleSentenceE = row[2] || '';  // 追加フィールド1 (空白なら空文字列)
        const remark = row[3] || '';  // 追加フィールド2 (空白なら空文字列)
        const understandingLevel = (row[4] === '1' || row[4] === '2') ? row[4] : '0';  // 理解度 (1か2でなければ0)
      
        return [index + 2, englishWord, japaneseMeaning, exampleSentenceE, remark, understandingLevel];  // インデックスと全てのフィールドを含める
      });

      const filters = req.query;
      const filteredData = processedData.filter(row => filters[row[5]] === 'true');
      
      const shuffledData = shuffleArray(filteredData);
      const selectedData = shuffledData.slice(0, MAX_WORD_NUM);

      res.status(200).json({ words: selectedData });
    } catch (error) {
      console.error('Error fetching words:', error);
      res.status(500).json({ error: 'Failed to fetch words' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

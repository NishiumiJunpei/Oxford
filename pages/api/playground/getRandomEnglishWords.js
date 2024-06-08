import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';
import { shuffleArray } from '@/utils/utils';

const MAX_WORD_NUM = 30

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
      
      const spreadsheetId = '1Kc95utlTq10z6K3Ej7mbJYmjt6e1zBror9-q0FTFOJg';
      const range = '単語リスト!A2:D'; // Assuming data starts from the second row
      const data = await getGoogleSheetData(spreadsheetId, range);
      
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Shuffle the data array

//      const shuffledData = data.sort(() => 0.5 - Math.random());
     const shuffledData = shuffleArray(data)
     console.log('shuffledData', shuffledData)


      // Select the first 50 items from the shuffled array
      const selectedData = shuffledData.slice(0, MAX_WORD_NUM);

      res.status(200).json({        
        words: selectedData,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

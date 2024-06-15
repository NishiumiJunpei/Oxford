import { getUserFromSession } from '@/utils/session-utils';
import { writeToGoogleSheet } from '@/utils/googleapi-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { rowIndex, newLevel } = req.body; // フロントエンドからの行インデックスを受け取る
      const spreadsheetId = '1Kc95utlTq10z6K3Ej7mbJYmjt6e1zBror9-q0FTFOJg';
      const range = `単語リスト!E${rowIndex}`; // 正しい行と列を指定

      // Write the updated data back to the sheet
      await writeToGoogleSheet(spreadsheetId, range, [[newLevel]], 'UPDATE');

      res.status(200).json({ message: 'Understanding level updated' });
    } catch (error) {
      console.error('Error updating understanding level:', error);
      res.status(500).json({ error: 'Failed to update understanding level' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

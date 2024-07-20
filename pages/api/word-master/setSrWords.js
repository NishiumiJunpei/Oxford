import { getUserFromSession } from '@/utils/session-utils';
import { setSrForWordListUserStatus } from '@/utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const wordListIds = req.body.wordListIds.map(id => parseInt(id));
      let srStartTime = new Date(req.body.srStartTime);
      const srLanguageDirection = req.body.srLanguageDirection || 'EJ';

      for (let i = 0; i < wordListIds.length; i++) {
        const wordListId = wordListIds[i];
        await setSrForWordListUserStatus(userId, wordListId, srStartTime, srLanguageDirection);

        // 10件ごとに srStartTime を10秒増やす
        if ((i + 1) % 10 === 0) {
          srStartTime = new Date(srStartTime.getTime() + 10000); // 10秒追加
        }
      }

      res.status(200).json({ message: 'updated successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

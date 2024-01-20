import { getUserFromSession } from '@/utils/session-utils';
import { setSrForWordListUserStatus } from '@/utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const wordListIds = req.body.wordListIds.map(id => parseInt(id));
      const srStartTime = new Date(req.body.srStartTime);
      const srLanguageDirection = req.body.srLanguageDirection || 'EJ'

      for (const wordListId of wordListIds) {
        await setSrForWordListUserStatus(userId, wordListId, srStartTime, srLanguageDirection);
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

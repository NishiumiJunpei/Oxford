// pages/api/word-master/updateUserWordStatus.js

import { updateUserWordStatus } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';



export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const { wordId, status, languageDirection } = req.body;

      const response = await updateUserWordStatus(userId, wordId, languageDirection, status);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

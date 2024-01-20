import { getUserFromSession } from '@/utils/session-utils';
import { updateUserInterestKeyword } from '@/utils/user-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await getUserFromSession(req, res);
    const { interestKeyword, action } = req.body;

    // 必須パラメータのチェック
    if (!interestKeyword || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 'action'の値の検証
    if (!['UPDATE', 'DELETE'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await updateUserInterestKeyword(userId, interestKeyword, action);
    res.status(200).json({ message: 'Updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

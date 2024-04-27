import { getUserFromSession } from '@/utils/session-utils';
import { deleteSrWordList } from '../../../utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = await getUserFromSession(req, res);

  try {
    // prisma-utilsで定義した関数を使用してストーリーを削除
    await deleteSrWordList(userId);
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

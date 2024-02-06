import { getUserFromSession } from '@/utils/session-utils';
import { deleteWordStoryByGPT } from '../../../utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = await getUserFromSession(req, res);

  const { id } = req.body; // ストーリーのIDをリクエストボディから取得
  try {
    // prisma-utilsで定義した関数を使用してストーリーを削除
    await deleteWordStoryByGPT(id);
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

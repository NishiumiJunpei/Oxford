// updateSrWords APIハンドラー
import { getUserFromSession } from '@/utils/session-utils';
import { updateSrWordListUserStatus } from '@/utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const { wordListUserStatusIds, action } = req.body;

      // 文字列のIDを整数に変換
      const ids = wordListUserStatusIds.map(id => parseInt(id));

      await updateSrWordListUserStatus(ids, action);

      res.status(200).json({ message: 'updated successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

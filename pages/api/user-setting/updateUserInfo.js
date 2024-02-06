import { updateUser } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await getUserFromSession(req, res);

      const birthday = new Date(req.body.birthday);
      const updatedData = {
        name: req.body.name,
        birthday,
        profile: req.body.profile,
      }

      // ユーザー情報を更新
      const response = await updateUser(userId, updatedData);

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

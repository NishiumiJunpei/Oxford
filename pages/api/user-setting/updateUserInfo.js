import { updateUser } from '../../../utils/prisma-utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.userId) {
        return res.status(401).json({ error: "You must be signed in to update the information." });
      }

      const userId = session.userId; // セッションから userId を取得
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

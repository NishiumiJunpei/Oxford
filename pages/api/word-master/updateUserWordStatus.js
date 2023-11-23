// pages/api/word-master/updateUserWordStatus.js

import { updateUserWordStatus } from '../../../utils/prisma-utils';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"



export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
        const session = await getServerSession(req, res, authOptions)

        if (session) {
          res.send({
            content:
              "This is protected content. You can access this content because you are signed in.",
          })
        } else {
          res.send({
            error: "You must be signed in to view the protected content on this page.",
          })
        }
      
      const userId = session.userId; // セッションから userId を取得
      const { wordId, status } = req.body;

      console.log('test',userId, wordId, status)
      const response = await updateUserWordStatus(userId, wordId, status);
      console.log('res', response)
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

import { verifySignupToken } from '@/utils/user-utils';
import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: true, message: 'トークンが提供されていません。' });
    }

    try {
      const result = verifySignupToken(token)

      if (!result.valid) {
        return res.status(404).json({ error: true, message: '無効なトークンです。' });
      }

      // トークンが有効であることを応答
      return res.status(200).json({ email: result.email, message: '有効なトークンです。' });
    } catch (error) {
      console.error('validateToken Error:', error);
      return res.status(500).json({ error: true, message: 'サーバーエラーが発生しました。' });
    }
  } else {
    // GETメソッド以外は許可しない
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

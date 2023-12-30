import prisma from '../../../prisma/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: true, message: 'トークンが提供されていません。' });
    }

    try {
      const tokenRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (!tokenRecord) {
        return res.status(404).json({ error: true, message: '無効なトークンです。' });
      }

      // トークンの有効期限をチェック
      const now = new Date();
      if (tokenRecord.expires < now) {
        return res.status(401).json({ error: true, message: 'トークンの有効期限が切れています。' });
      }

      // トークンが有効であることを応答
      return res.status(200).json({ message: '有効なトークンです。' });
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

// pages/api/auth/resetPassword.js
import { findUserByPasswordResetToken, updateUserPasswordById, deletePasswordResetToken } from '../../../utils/user-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token, password } = req.body;

    try {
      const tokenRecord = await findUserByPasswordResetToken(token);
      if (!tokenRecord || !tokenRecord.user) {
        return res.status(404).json({ error: true, message: '無効なトークンです。' });
      }

      await updateUserPasswordById(tokenRecord.user.id, password);
      await deletePasswordResetToken(tokenRecord.id);

      return res.status(200).json({ message: 'パスワードが更新されました。' });

    } catch (error) {
      console.error('resetPassword Error:', error);
      return res.status(500).json({ error: true, message: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

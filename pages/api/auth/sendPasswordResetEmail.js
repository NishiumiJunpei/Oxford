// pages/api/auth/sendPasswordResetEmail.js
import { findUserByEmail, createPasswordResetToken } from '../../../utils/user-utils';
import {sendPasswordResetEmail} from '../../../utils/mail-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: true, message: 'メールアドレスが見つかりません。' });
      }

      // パスワードリセットトークンを生成して保存
      const token = await createPasswordResetToken(user.id);

      // パスワードリセット用のURLをメールで送信
      const domainUrl = process.env.DOMAIN_URL
      const resetUrl = `${domainUrl}auth/resetPassword?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    
      return res.status(200).json({ message: 'パスワード再設定のメールを送信しました。' });
    } catch (error) {
      return res.status(500).json({ error: true, message: 'サーバーエラーが発生しました。' });
    }
  } else {
    // POSTメソッド以外は許可しない
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

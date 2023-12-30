// pages/api/auth/sendSignUpConfirmationEmail.js
import { findUserByEmail, createSignUpToken } from '../../../utils/user-utils';
import {sendSignUpConfirmationEmail} from '../../../utils/mail-utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      const user = await findUserByEmail(email)
      if (user){
        return res.status(200).json({ error: true, message: 'そのメールアドレスは登録されています' });
      }

      // 確認用トークンを生成して保存
      const token = await createSignUpToken(email); // この関数は独自に実装する必要があります

      // 確認用URLをメールで送信
      const domainUrl = process.env.DOMAIN_URL;
      const confirmationUrl = `${domainUrl}auth/signup/inputUserInfo?token=${token}`;
      await sendSignUpConfirmationEmail(email, confirmationUrl);

      return res.status(200).json({ message: 'サインアップ確認メールを送信しました。' });
    } catch (error) {
      console.error('sendSignUpConfirmationEmail Error:', error);
      return res.status(500).json({ error: true, message: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

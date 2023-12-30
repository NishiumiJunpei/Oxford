import bcrypt from 'bcrypt';
import { verifySignupToken, createUser } from '@/utils/user-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token, email, password, selectedThemeId } = req.body;

  if (!token) {
    return res.status(400).json({ error: true, message: 'トークンが提供されていません。' });
  }

  try {
    const result = verifySignupToken(token);

    if (!result.valid) {
      return res.status(404).json({ error: true, message: '無効なトークンです。' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      currentChallengeThemeId: selectedThemeId
    };
  
    const user = await createUser(newUser);
  
    return res.status(200).json({ user, message: 'ユーザーが正常に作成されました。' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: true, message: 'サーバーエラーが発生しました。' });
  }
}

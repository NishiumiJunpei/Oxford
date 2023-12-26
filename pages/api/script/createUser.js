import { createUser } from '../../../utils/prisma-utils';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

  try {
    const password = "0000"
      
    // パスワードのハッシュ化
    const saltRounds = 10; // Salt Roundsの選択
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
        name: "Rika",
        email: "rika.nishiumi@gmail.com",
        password: hashedPassword,
        profile: "",
      }


    // const user = await createUser(userData);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

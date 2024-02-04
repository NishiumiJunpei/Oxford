import { getUserById } from '../../../utils/prisma-utils'; // getUserById 関数のインポート
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
  
        const userId = session.userId; // セッションから userId を取得
        const user = await getUserById(userId); // prisma-utils.js からの関数を使用

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        // const formattedBirthday = user.birthday ? user.birthday.toISOString().split('T')[0] : ''
        const { email, name, currentChallengeThemeId, profileKeyword, interestKeyword } = user;
        const profileKeywordsArray = profileKeyword ? profileKeyword.split(',') : ''
        const interestKeywordsArray = interestKeyword ? interestKeyword.split(',') : ''
        
        res.status(200).json({ 
          email, 
          name, 
          currentChallengeThemeId, 
          profileKeywords: profileKeywordsArray, 
          interestKeywords: interestKeywordsArray 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  
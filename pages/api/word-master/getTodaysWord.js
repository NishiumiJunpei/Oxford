import { getUserById, getUserWordListById, getUserWordStatusByTheme } from '../../../utils/prisma-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const userId = session.userId;
      const user = await getUserById(userId)
      const theme = user.defaultTheme

      const userWordStatus = await getUserWordStatusByTheme(userId, theme);

      console.log('test1')
      // NOT_MEMORIZED な単語をフィルタリング
      const notMemorizedWords = userWordStatus.filter(status => 
        status.memorizeStatus === 'NOT_MEMORIZED'
      );

      // ランダムに1つ選択
      if (notMemorizedWords.length > 0) {
        const randomWordStatus = notMemorizedWords[Math.floor(Math.random() * notMemorizedWords.length)];

        // 必要な情報をレスポンスとして返す
        const result = {
          wordListByThemeId: randomWordStatus.wordListByTheme.id,
          english: randomWordStatus.wordListByTheme.english,
          japanese: randomWordStatus.wordListByTheme.japanese,
          exampleSentence: randomWordStatus.exampleSentence || null,
          theme: randomWordStatus.wordListByTheme.theme,
          block: randomWordStatus.wordListByTheme.block,
        };

        res.status(200).json(result);
      } else {
        res.status(200).json({ message: 'No words to memorize' });
      }

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

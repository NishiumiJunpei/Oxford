// createWordStoryByGPT.js
import { getWordListByCriteria, getWordListUserStatus, getUserById, saveWordStoryByGPT } from '../../../utils/prisma-utils';
import { calculateAge } from '../../../utils/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { generateWordStory } from '../../../utils/openai-utils';
import { shuffleArray } from '@/utils/utils'


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { blockId, length, genre, characters } = req.body;
  const session = await getServerSession(req, res, authOptions);
  const userId = session.userId; 
  const user = await getUserById(userId);
  const userProfile = JSON.stringify(user.profile)
  const age = calculateAge(user.birthday);
  

  try {
    const criteria = {
      blockId: parseInt(blockId)
    };
    const wordList = await getWordListByCriteria(criteria);
    const userWordStatus = await getWordListUserStatus(userId, '', blockId); 

    let updatedWordList = await Promise.all(wordList.map(async word => {
      const status = userWordStatus.find(us => us.wordListId == word.id)
      return { ...word, status };
    }));

    const notMemorizedEJ = updatedWordList.filter(word => word.status.memorizeStatusEJ === 'NOT_MEMORIZED');
    const memorizedEJ = updatedWordList.filter(word => word.status.memorizeStatusEJ === 'MEMORIZED');
    const notMemorizedJE = updatedWordList.filter(word => word.status.memorizeStatusJE === 'NOT_MEMORIZED');
    const memorizedJE = updatedWordList.filter(word => word.status.memorizeStatusJE === 'MEMORIZED');
    
    shuffleArray(notMemorizedEJ)
    shuffleArray(memorizedEJ)
    shuffleArray(notMemorizedJE)
    shuffleArray(memorizedJE)

    const combinedList = [...notMemorizedEJ, ...memorizedEJ, ...notMemorizedJE, ...memorizedJE];

    // 3. lengthに基づいて単語を選択
    const wordCount = { 'Short': 5, 'Medium': 10, 'Long': 20 }[length];
    updatedWordList = combinedList.slice(0, wordCount);

    // 4. OpenAI APIにプロンプトを渡す
    const response = await generateWordStory(updatedWordList, length, age, userProfile, genre, characters)

    // 5. DBに登録
    const words = updatedWordList.map(word => `${word.english} (${word.japanese})`)
    await saveWordStoryByGPT(userId, blockId, length, genre, characters, response, words);


    // 6. 結果と単語をフロントに返す
    res.status(200).json({ story: response, words: updatedWordList });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

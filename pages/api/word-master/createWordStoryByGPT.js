// createWordStoryByGPT.js
import { getWordListByCriteria, getWordListUserStatus, getUserById, saveWordStoryByGPT, getTheme } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';
import { generateWordStory } from '../../../utils/openai-utils';
import { shuffleArray } from '@/utils/utils'


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = await getUserFromSession(req, res);
  const { blockId, length, genre = '', characters = '' } = req.body;
  const user = await getUserById(userId);
  
  try {
    const criteria = {
      blockId: parseInt(blockId)
    };
    const wordList = await getWordListByCriteria(criteria);
    const userWordStatus = await getWordListUserStatus(userId, '', blockId); 
    const theme = await getTheme(user.currentChallengeThemeId)

    let updatedWordList = await Promise.all(wordList.map(async word => {
      const status = userWordStatus.find(us => us.wordListId == word.id) || {
        memorizeStatusEJ: 'NOT_MEMORIZED',
        memorizeStatusJE: 'NOT_MEMORIZED',
      }
      return { 
        ...word, 
        status 
      };
    }));

    const notMemorizedEJ = updatedWordList.filter(word => word.status?.memorizeStatusEJ === 'NOT_MEMORIZED');
    const memorizedEJ = updatedWordList.filter(word => word.status?.memorizeStatusEJ === 'MEMORIZED');
    const notMemorizedJE = updatedWordList.filter(word => word.status?.memorizeStatusJE === 'NOT_MEMORIZED');
    const memorizedJE = updatedWordList.filter(word => word.status?.memorizeStatusJE === 'MEMORIZED');
    
    shuffleArray(notMemorizedEJ)
    shuffleArray(memorizedEJ)
    shuffleArray(notMemorizedJE)
    shuffleArray(memorizedJE)
    shuffleArray(updatedWordList)

    const combinedList = [...notMemorizedEJ, ...memorizedEJ, ...notMemorizedJE, ...memorizedJE, ...updatedWordList];

    // 3. lengthに基づいて単語を選択
    const wordCount = { 'Short': 5, 'Medium': 10, 'Long': 20 }[length];
    updatedWordList = combinedList.slice(0, wordCount);

    // 4. OpenAI APIにプロンプトを渡す
    const stream = await generateWordStory(updatedWordList, length, genre, characters, theme.levelKeyword, user)



    let collectedData = ''; // ストリームからのデータを収集するための変数

    for await (const chunk of stream) {
      if (chunk.choices[0]?.finish_reason == 'stop'){
        break;
      }
      const data = chunk.choices[0]?.delta?.content 
      collectedData += data

      res.write(data)
    } 

    if (collectedData){
      const words = updatedWordList.map(word => `${word.english} (${word.japanese})`)
      await saveWordStoryByGPT(userId, blockId, length, genre, characters, collectedData, words);
    }
    
    res.end()


    // 6. 結果と単語をフロントに返す
    // res.status(200).json({ story: response, words: updatedWordList });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

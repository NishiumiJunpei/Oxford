// import { getTheme, getUserById } from '../../../utils/prisma-utils';
// import { updateQuestionJE } from '../../../utils/prisma-utils'
// import { getUserFromSession } from '@/utils/session-utils';
// import { generateQuestionAnswerJE } from '@/utils/openai-utils';

// //将来のために残しているが、現在無効中。コード要精査
// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     // POSTリクエストからデータを取得

//     try {
//         const { userId } = await getUserFromSession(req, res);
//         const { wordListId, english, japanese } = req.body;

//         // 必須パラメータのチェック
//         if (!wordListId || !english || !japanese) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         const user = await getUserById(userId);
//         if (user.profileKeyword == '' || user.interestKeyword == ''){
//             res.status(200).json({ errorMessage: 'プロフィール・興味を登録してください' });    
//         }


//         const theme = await getTheme(user.currentChallengeThemeId)

//         const {questionJE, answerJE} = await generateQuestionAnswerJE(english, japanese, user, theme.levelKeyword);

//         if (questionJE == '' || answerJE == ''){
//             res.status(200).json({ questionJE: 'エラーが発生しました。', answerJE: 'エラーが発生しました', errorMessage: 'GPT処理でエラーが発生しました。もう一度やり直してください。' });    
//         }else{
//             await updateQuestionAnswerJE(userId, wordListId, questionJE, answerJE);
//             res.status(200).json({ questionJE, answerJE });    
//         }

//         res.status(200).json({ questionJE: '転職を考えた後、気分転換にスプラトゥーンをプレイすることにしました。それはいつも私の気持ちを高めてくれます', 
//         answerJE: 'After contemplating a career change, I decided to unwind by playing Splatoon, which always boosts my spirits.' });    
      
//     } catch (error) {
//       console.error('Error during image generation:', error);
//       res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
//       }
//   } else {
//     res.setHeader('Allow', 'POST');
//     res.status(405).end('Method Not Allowed');
//   }
// }



import { getTheme, getUserById, updateQuestionJE } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';
import { generateQuestionJE } from '@/utils/openai-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { userId } = await getUserFromSession(req, res);
    const { wordListId, english, japanese } = req.body;

    if (!wordListId || !english || !japanese) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await getUserById(userId);
    if (!user || user.profileKeyword === '' || user.interestKeyword === '') {
      return res.status(400).json({ errorMessage: 'プロフィール・興味を登録してください' });
    }

    const theme = await getTheme(user.currentChallengeThemeId);
    const stream = await generateQuestionJE(english, japanese, user, theme.levelKeyword);

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
      await updateQuestionJE(userId, wordListId, collectedData);
    }
    
    res.end()

  } catch (error) {
    console.error('Error during API processing:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。詳細: ' + error.message });
  }
}

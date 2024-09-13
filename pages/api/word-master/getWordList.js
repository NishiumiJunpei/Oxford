import { getUserFromSession } from '@/utils/session-utils';
import { getBlock, getWordListByCriteria, getWordListUserStatus, findBlockByDisplayOrderAndThemeId, getWordStoriesByUserIdAndBlockId, getBlocks } from '../../../utils/prisma-utils';
import { getS3FileUrl, getS3AudioFileUrl, getS3MovieFileUrl } from '../../../utils/aws-s3-utils';
import { getTimeDifferenceText, isWithinDays } from '@/utils/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);

      const { blockId, moveBlock } = req.query;
      if (!blockId) {
        return res.status(400).json({ error: 'Theme and block are required' });
      }

      const criteria = {
        blockId: parseInt(blockId)
      };

      const block = await getBlock(parseInt(blockId));

      // 非同期処理を並列に行うためにPromise.allを使用
      const [normalMovieUrl, reproductionMovieUrl, explanationMovieUrl] = await Promise.all([
        block.normalMovieFilename ? getS3MovieFileUrl(block.normalMovieFilename) : null,
        block.reproductionMovieFilename ? getS3MovieFileUrl(block.reproductionMovieFilename) : null,
        block.explanationMovieFilename ? getS3MovieFileUrl(block.explanationMovieFilename) : null
      ]);
      
      // 結果をblockに追加
      block.normalMovieUrl = normalMovieUrl;
      block.reproductionMovieUrl = reproductionMovieUrl;
      block.explanationMovieUrl = explanationMovieUrl;
      

      const blocks = await getBlocks(block.theme.id)      

      const wordList = await getWordListByCriteria(criteria);
      const userWordStatus = await getWordListUserStatus(userId, block.theme.id, parseInt(blockId)); 


      // progress計算
      let memorizedCountEJ = 0;
      let memorizedCountJE = 0;

    
      userWordStatus.forEach(status => {
        // memorizeStatusEJのカウント
        if (status.memorizeStatusEJ === 'MEMORIZED') {
          memorizedCountEJ += 1;
        } else if (status.memorizeStatusEJ === 'MEMORIZED2') {
          memorizedCountEJ += 2;
        }
    
        // memorizeStatusJEのカウント
        if (status.memorizeStatusJE === 'MEMORIZED') {
          memorizedCountJE += 1;
        } else if (status.memorizeStatusJE === 'MEMORIZED2') {
          memorizedCountJE += 2;
        }
      });

      // progress計算
      const progress = {
        EJ: Math.round(memorizedCountEJ / wordList.length * 100),
        JE: Math.round(memorizedCountJE / wordList.length * 100)
      }    


      const updatedWordList = await Promise.all(wordList.map(async word => {
        const userWordListStatus = userWordStatus.find(us => us.wordListId == word.id)

        return {
          ...word,
          memorizeStatusEJ: userWordListStatus?.memorizeStatusEJ || 'NOT_MEMORIZED',
          memorizeStatusJE: userWordListStatus?.memorizeStatusJE || 'NOT_MEMORIZED',
          imageUrl: await getS3FileUrl(word.imageFilename),
          explanationAudioUrl: await getS3AudioFileUrl(word.explanationAudioFilename),
          usage: word.usage ? JSON.parse(word.usage) : '',
          userWordListStatus,
          lastMemorizedDateEJ: {
            timeText: getTimeDifferenceText(userWordListStatus?.lastMemorizedDateEJ),
            within1Day: isWithinDays(userWordListStatus?.lastMemorizedDateEJ, 1),
            within3Days: isWithinDays(userWordListStatus?.lastMemorizedDateEJ, 3),
            within7Days: isWithinDays(userWordListStatus?.lastMemorizedDateEJ, 7),
          }
        };
      }));

      const wordStoryList = await getWordStoriesByUserIdAndBlockId(userId, block.id);

      //progressDetail作成処理（EJ、JEの単語数、正解数、２連続性回数、過去１週間追加分）
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 1週間前の日付を設定

      const progressDetail = {
        EJ:{
          wordTotalNum: updatedWordList.length,
          memorizedNum: updatedWordList.filter(w => (w.memorizeStatusEJ == 'MEMORIZED' || w.memorizeStatusEJ == 'MEMORIZED2') ).length,
          memorized2Num: updatedWordList.filter(w => w.memorizeStatusEJ == 'MEMORIZED2').length,
          memorizedNumNew: updatedWordList.filter(w => w.memorizeStatusEJ == 'MEMORIZED'
                && new Date(w.userWordListStatus.lastMemorizedDateEJ) >= oneWeekAgo).length,
          memorized2NumNew: updatedWordList.filter(w => w.memorizeStatusEJ == 'MEMORIZED2' 
                && new Date(w.userWordListStatus.lastMemorizedDateEJ) >= oneWeekAgo).length,
        },
        JE:{
          wordTotalNum: updatedWordList.length,
          memorizedNum: updatedWordList.filter(w => (w.memorizeStatusJE == 'MEMORIZED' || w.memorizeStatusJE == 'MEMORIZED2') ).length,
          memorized2Num: updatedWordList.filter(w => w.memorizeStatusJE == 'MEMORIZED2').length,
          memorizedNumNew: updatedWordList.filter(w => w.memorizeStatusJE == 'MEMORIZED'
                && new Date(w.userWordListStatus.lastMemorizedDateJE) >= oneWeekAgo).length,
          memorized2NumNew: updatedWordList.filter(w => w.memorizeStatusJE == 'MEMORIZED2' 
                && new Date(w.userWordListStatus.lastMemorizedDateJE) >= oneWeekAgo).length,

        }
      }

      res.status(200).json({
        wordList: updatedWordList,
        progress,
        progressDetail,
        wordStoryList,
        block,
        blocks,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

// pages/api/word-master/getProgressByThemeId.js
import { getWordListByCriteria, getWordListUserStatus, getUserById, getBlocks, getTheme } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';
import { getTimeDifferenceText } from '@/utils/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const {userId, currentChallengeThemeId} = await getUserFromSession(req, res);

      const themeId = currentChallengeThemeId
      const theme = await getTheme(themeId)
      const wordList = await getWordListByCriteria({ themeId });
      const wordListUserStatus = await getWordListUserStatus(userId, themeId);
      const blocks = await getBlocks(themeId);

      let totalProgressEJ = 0;
      let totalProgressJE = 0;
      let totalWords = 0;
      const wordNum = wordList.length
      const currentTime = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 1週間前の日付を設定

      //過去１週間の正解数
      let EJmemorizedNumNew = 0
      let EJmemorized2NumNew = 0
      let JEmemorizedNumNew = 0
      let JEmemorized2NumNew = 0      

      const updatedBlocks = blocks.map(block => {
        const blockWords = wordList.filter(word => word.blocks.some(b => b.blockId === block.id));
      
        // progress計算
        let memorizedCountEJ = 0;
        let memorizedCountJE = 0;
        let memorizedCountEJ_NOTSTARTED = 0;
        let memorizedCountEJ_MEMORIZED = 0;
        let memorizedCountEJ_MEMORIZED2 = 0;
      
        // アセスメントやる余地があるか
        let numAbleToProgressEJ = 0;
        let numAbleToProgressJE = 0;
      
        // lastUpdatedAtの初期値を設定
        let lastUpdatedAt = null;
      
        blockWords.forEach(word => {
          const status = wordListUserStatus.find(us => us.wordListId == word.id);
      
          if (status) {
            // updatedAtの最大値を追跡
            if (!lastUpdatedAt || new Date(status.updatedAt) > new Date(lastUpdatedAt)) {
              lastUpdatedAt = status.updatedAt;
            }
      
            // memorizeStatusEJのカウント
            if (status.memorizeStatusEJ === 'MEMORIZED') {
              memorizedCountEJ += 1;
              memorizedCountEJ_MEMORIZED += 1
              numAbleToProgressEJ = (status.lastMemorizedDateEJ?.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000) ? numAbleToProgressEJ + 1 : numAbleToProgressEJ;
      
              if (new Date(status.lastMemorizedDateEJ) >= oneWeekAgo) {
                EJmemorizedNumNew += 1;
              }
      
            } else if (status.memorizeStatusEJ === 'MEMORIZED2') {
              memorizedCountEJ += 2;
              memorizedCountEJ_MEMORIZED2 += 1
      
              if (new Date(status.lastMemorizedDateEJ) >= oneWeekAgo) {
                EJmemorizedNumNew += 1;
                EJmemorized2NumNew += 1;
              }
      
            } else {
              memorizedCountEJ_NOTSTARTED += 1
              numAbleToProgressEJ += 1;
            }
      
            // memorizeStatusJEのカウント
            // if (status.memorizeStatusJE === 'MEMORIZED') {
            //   memorizedCountJE += 1;
            //   numAbleToProgressJE = (status.lastMemorizedDateJE?.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000) ? numAbleToProgressJE + 1 : numAbleToProgressJE;
      
            //   if (new Date(status.lastMemorizedDateJE) >= oneWeekAgo) {
            //     JEmemorizedNumNew += 1;
            //   }
      
            // } else if (status.memorizeStatusJE === 'MEMORIZED2') {
            //   memorizedCountJE += 2;
      
            //   if (new Date(status.lastMemorizedDateJE) >= oneWeekAgo) {
            //     JEmemorizedNumNew += 1;
            //     JEmemorized2NumNew += 1;
            //   }
      
            // } else {
            //   numAbleToProgressJE += 1;
            // }

          }else{
            memorizedCountEJ_NOTSTARTED += 1  
          }
        });
      
        // lastUpdatedAtオブジェクトの作成
        const lastUpdatedAtObject = lastUpdatedAt ? {
          datetime: lastUpdatedAt,
          datetimeText: getTimeDifferenceText(lastUpdatedAt),
          within7day: (currentTime.getTime() - new Date(lastUpdatedAt).getTime()) <= (7 * 24 * 60 * 60 * 1000) // 7日（ミリ秒単位）の範囲内かどうかを判定
        } : null;
      
        // progress計算
        const progress = {
          EJ: Math.round(memorizedCountEJ / blockWords.length * 100),
          JE: Math.round(memorizedCountJE / blockWords.length * 100),
          NOT_STARTED: memorizedCountEJ_NOTSTARTED,
          MEMORIZED: memorizedCountEJ_MEMORIZED,
          MEMORIZED2: memorizedCountEJ_MEMORIZED2,
        };
      
        totalProgressEJ += memorizedCountEJ;
        totalProgressJE += memorizedCountJE;
        // totalWords += blockWords.length;
      
        const numAbleToProgress = {
          EJ: numAbleToProgressEJ,
          JE: numAbleToProgressJE
        };
      
        return {
          block,
          progress,
          numAbleToProgress,
          totalWordNum: blockWords.length,
          lastUpdatedAt: lastUpdatedAtObject
        };
      });
                              
      updatedBlocks.sort((a, b) => a.block - b.block);

      // --------------------------------- overallProgress ---------------------------------
      const totalWordCnt = wordList.length;
      const memorizedCountEJ_NOT_STARTED = updatedBlocks.reduce((acc, block) => acc + block.progress.NOT_STARTED, 0);
      const memorizedCountEJ_MEMORIZED = updatedBlocks.reduce((acc, block) => acc + block.progress.MEMORIZED, 0);
      const memorizedCountEJ_MEMORIZED2 = updatedBlocks.reduce((acc, block) => acc + block.progress.MEMORIZED2, 0);
      
      const memorizedRatioEJ_NOT_STARTED = Math.round((memorizedCountEJ_NOT_STARTED / totalWordCnt) * 100);
      const memorizedRatioEJ_MEMORIZED = Math.round((memorizedCountEJ_MEMORIZED / totalWordCnt) * 100);
      const memorizedRatioEJ_MEMORIZED2 = Math.round((memorizedCountEJ_MEMORIZED2 / totalWordCnt) * 100);
      
      const overallProgress = {
        memorizedCountEJ_NOT_STARTED: memorizedCountEJ_NOT_STARTED,
        memorizedCountEJ_MEMORIZED: memorizedCountEJ_MEMORIZED,
        memorizedCountEJ_MEMORIZED2: memorizedCountEJ_MEMORIZED2,
    
        memorizedRatioEJ_NOT_STARTED: memorizedRatioEJ_NOT_STARTED,
        memorizedRatioEJ_MEMORIZED: memorizedRatioEJ_MEMORIZED,
        memorizedRatioEJ_MEMORIZED2: memorizedRatioEJ_MEMORIZED2,
      };
      

      
      // --------------------------------- progressOverLastWeek ---------------------------------
    
      theme.totalWordCnt = wordNum
      const memorizeImageArray = [0, 10, 50, 100, 150, 200]
      const findLastExceedingIndex = (count, array) => {
        let lastIndex = 0; 
        for (let i = 0; i < array.length; i++) {
          if (count > array[i]) {
            lastIndex = i; // countが配列の要素を超える最後のインデックスを更新
          } else {
            break; // countが配列の要素を超えなくなったらループを抜ける
          }
        }      
        return lastIndex;
      };
      const progressOverLastWeek = {
        EJ: {
          memorizedNumNew: EJmemorizedNumNew,
          memorized2NumNew: EJmemorized2NumNew,
          memorizedNumNewImageIndex: findLastExceedingIndex(EJmemorizedNumNew, memorizeImageArray),
          memorized2NumNewImageIndex: findLastExceedingIndex(EJmemorized2NumNew, memorizeImageArray),
        },
        JE:{
          memorizedNumNew: JEmemorizedNumNew,
          memorized2NumNew: JEmemorized2NumNew,
          memorizedNumNewImageIndex: findLastExceedingIndex(JEmemorizedNumNew, memorizeImageArray),
          memorized2NumNewImageIndex: findLastExceedingIndex(JEmemorized2NumNew, memorizeImageArray),

        }
      }


      res.status(200).json({ 
        theme,
        overallProgress, 
        blocks: updatedBlocks, 
        progressOverLastWeek,
      });
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

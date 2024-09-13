// pages/api/word-master/getBlocksWithStatusByThemeId.js
import { getWordListByCriteria, getWordListUserStatus, getUserById, getBlocks, getTheme } from '../../../utils/prisma-utils';
import { getUserFromSession } from '@/utils/session-utils';
import { getTimeDifferenceText } from '@/utils/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId, currentChallengeThemeId } = await getUserFromSession(req, res);

      const themeId = currentChallengeThemeId;
      const theme = await getTheme(themeId);
      const wordList = await getWordListByCriteria({ themeId });
      const wordListUserStatus = await getWordListUserStatus(userId, themeId);
      const blocks = await getBlocks(themeId);

      const currentTime = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      let updatedBlocks = blocks.map(block => {
        const blockWords = wordList.filter(word => word.blocks.some(b => b.blockId === block.id));

        let memorizedCountEJ = 0;
        let memorizedCountEJ_NOTSTARTED = 0;
        let memorizedCountEJ_MEMORIZED = 0;
        let memorizedCountEJ_MEMORIZED2 = 0;

        let numAbleToProgressEJ = 0;

        let lastMemorizedDateEJ = null;

        blockWords.forEach(word => {
          const status = wordListUserStatus.find(us => us.wordListId == word.id);

          if (status) {
            if (!lastMemorizedDateEJ || new Date(status.lastMemorizedDateEJ) > new Date(lastMemorizedDateEJ)) {
              lastMemorizedDateEJ = status.lastMemorizedDateEJ;
            }

            if (status.memorizeStatusEJ === 'MEMORIZED') {
              memorizedCountEJ += 1;
              memorizedCountEJ_MEMORIZED += 1;
              numAbleToProgressEJ = (status.lastMemorizedDateEJ?.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000) ? numAbleToProgressEJ + 1 : numAbleToProgressEJ;

            } else if (status.memorizeStatusEJ === 'MEMORIZED2') {
              memorizedCountEJ += 2;
              memorizedCountEJ_MEMORIZED2 += 1;

            } else {
              memorizedCountEJ_NOTSTARTED += 1;
              numAbleToProgressEJ += 1;
            }
          } else {
            memorizedCountEJ_NOTSTARTED += 1;
          }
        });

        const lastMemorizedDateEJObject = lastMemorizedDateEJ ? {
          datetime: lastMemorizedDateEJ,
          datetimeText: getTimeDifferenceText(lastMemorizedDateEJ),
          within1day: (currentTime.getTime() - new Date(lastMemorizedDateEJ).getTime()) <= (24 * 60 * 60 * 1000),
          within7day: (currentTime.getTime() - new Date(lastMemorizedDateEJ).getTime()) <= (7 * 24 * 60 * 60 * 1000)
        } : null;

        const progress = {
          EJ: Math.round(memorizedCountEJ / blockWords.length * 100),
          NOT_STARTED: memorizedCountEJ_NOTSTARTED,
          MEMORIZED: memorizedCountEJ_MEMORIZED,
          MEMORIZED2: memorizedCountEJ_MEMORIZED2,
        };

        const numAbleToProgress = {
          EJ: numAbleToProgressEJ,
        };

        return {
          block,
          progress,
          numAbleToProgress,
          totalWordNum: blockWords.length,
          lastMemorizedDateEJ: lastMemorizedDateEJObject
        };
      });

      updatedBlocks.sort((a, b) => a.block - b.block);


      //カテゴリ毎にデータ構造を変換
      const blocksByCategory = updatedBlocks.reduce((acc, element) => {
        const categoryName = element.block.categoryName || '英単語ブロック'; 
        if (!acc[categoryName]) {
          acc[categoryName] = { categoryName, blocks: [] };
        }
        acc[categoryName].blocks.push(element);
        return acc;
      }, {});

      // 結果を配列形式に変換
      updatedBlocks = Object.values(blocksByCategory);



      res.status(200).json({
        theme,
        blocks: updatedBlocks,
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

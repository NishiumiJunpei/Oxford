// getSrWordList APIハンドラー
import { getUserFromSession } from '@/utils/session-utils';
import { getActiveSrWordListsForUser } from '@/utils/prisma-utils';
import { getS3FileUrl, getS3AudioFileUrl } from '@/utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const currentTime = new Date(req.query.currentTime); // フロントエンドから渡される前提

      const wordList = await getActiveSrWordListsForUser(userId);
      const updatedWordList = await Promise.all(wordList.map(async word => {
        return {
          ...word,
          memorizeStatusEJ: word.userWordListStatus?.memorizeStatusEJ,
          memorizeStatusJE: word.userWordListStatus?.memorizeStatusJE,
          imageUrl: await getS3FileUrl(word.imageFilename),
          explanationAudioUrl: await getS3AudioFileUrl(word.explanationAudioFilename),
          usage: word.usage ? JSON.parse(word.usage) : '',
        };
      }));

      const updatedWordListEJ = updatedWordList.filter(w => w.userWordListStatus.srLanguageDirection == 'EJ')
      const updatedWordListJE = updatedWordList.filter(w => w.userWordListStatus.srLanguageDirection == 'JE')

      const createSrWordListAndCount = (wordList, currentTime) => {
          // srNextTimeでソート
          wordList.sort((a, b) => new Date(a.srNextTime) - new Date(b.srNextTime));

          // srNextTimeが同一の要素をグループ化
          const groupedWordList = wordList.reduce((acc, curr) => {
            const key = curr.userWordListStatus.srNextTime.toISOString(); // ISO Stringとしてキーを生成
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(curr);
            return acc;
          }, {});


          // 最初の5つのキーのみを取得
          const sortedKeys = Object.keys(groupedWordList).sort().slice(0, 5);

          // 最初の5つのキーに基づいてsrWordListを生成
          const srWordList = sortedKeys.reduce((acc, key) => {
            acc[key] = groupedWordList[key];
            return acc;
          }, {});
              

          const uniqueSrNextTimes = []
          let countOverdue = 0

          wordList.forEach(word => {
            const srNextTime = new Date(word.userWordListStatus.srNextTime).getTime(); // Dateをタイムスタンプに変換
            if (!uniqueSrNextTimes.includes(srNextTime)) {
              uniqueSrNextTimes.push(srNextTime)
              // 5分前を過ぎているかチェック
              if (currentTime - srNextTime > 5 * 60 * 1000) { // 5分 = 5 * 60秒 * 1000ミリ秒
                countOverdue += 1;
              }
            }
          });
          
          const countTotal = uniqueSrNextTimes.length;

          return {srWordList, countTotal, countOverdue}
      }

      const {srWordList: srWordListEJ, countTotal: countTotalEJ, countOverdue: countOverdueEJ} = createSrWordListAndCount(updatedWordListEJ, currentTime)
      const {srWordList: srWordListJE, countTotal: countTotalJE, countOverdue: countOverdueJE} = createSrWordListAndCount(updatedWordListJE, currentTime)

      const srWordList = {
        EJ: srWordListEJ,
        JE: srWordListJE,
      }
      const srCount = {
        total: countTotalEJ + countTotalJE,
        EJ: countTotalEJ,
        JE: countTotalJE,
        overdueTotal: countOverdueEJ + countOverdueJE,
        overdueEJ: countOverdueEJ,
        overdueJE: countOverdueJE,
      }

      res.status(200).json({ srWordList, srCount });
    } catch (error) {
        console.log('error', error)
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

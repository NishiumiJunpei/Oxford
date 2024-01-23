// getSrWordList APIハンドラー
import { getUserFromSession } from '@/utils/session-utils';
import { getActiveSrWordListsForUser } from '@/utils/prisma-utils';
import { getS3FileUrl } from '@/utils/aws-s3-utils';

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
        };
      }));

      // srNextTimeでソート
      updatedWordList.sort((a, b) => new Date(a.srNextTime) - new Date(b.srNextTime));

      // srNextTimeが同一の要素をグループ化
      const groupedWordList = updatedWordList.reduce((acc, curr) => {
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
          

      // srCountオブジェクトの初期化
      const srCount = {
        total: 0,
        overdue: 0
      };

      const uniqueSrNextTimes = []
      updatedWordList.forEach(word => {
        const srNextTime = new Date(word.userWordListStatus.srNextTime).getTime(); // Dateをタイムスタンプに変換
        if (!uniqueSrNextTimes.includes(srNextTime)) {
          uniqueSrNextTimes.push(srNextTime)
          // 5分前を過ぎているかチェック
          if (currentTime - srNextTime > 5 * 60 * 1000) { // 5分 = 5 * 60秒 * 1000ミリ秒
            srCount.overdue += 1;
          }
        }
      });
      
      srCount.total = uniqueSrNextTimes.length;

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

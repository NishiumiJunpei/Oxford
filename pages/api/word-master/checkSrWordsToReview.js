import { getUserFromSession } from '@/utils/session-utils';
import { getActiveSrWordListsForUser } from '@/utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const wordList = await getActiveSrWordListsForUser(userId);
      const currentTime = new Date(req.query.currentTime); // フロントからのcurrentTimeを受け取る

      // srNextTimeのキーだけを格納する配列を作成
      const srNextTimes = wordList.reduce((acc, curr) => {
        const srNextTime = new Date(curr.status.srNextTime);
        const fiveMinutesBefore = new Date(currentTime.getTime() - 5 * 60000); // 現在時刻の5分前

        if (srNextTime < fiveMinutesBefore) {
          const key = srNextTime.toISOString();
          if (acc.indexOf(key) === -1) {
            acc.push(key); // 条件を満たすキーのみ追加
          }
        }

        return acc;
      }, []);

      const uniqueSrNextTimeCount = srNextTimes.length; // ユニークなsrNextTimeの件数

      res.status(200).json({ count: uniqueSrNextTimeCount });
    } catch (error) {
      console.log('error', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

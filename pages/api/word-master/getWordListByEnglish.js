import { getUserFromSession } from '@/utils/session-utils';
import { getWordListByEnglish} from '../../../utils/prisma-utils';
import { getS3AudioFileUrl, getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const { english } = req.query

      if (userId != '1') return null

      const wordList = await getWordListByEnglish(english);
      const updatedWordList = await Promise.all(wordList.map(async word => {
        return {
          ...word,
          imageUrl: await getS3FileUrl(word.imageFilename),
          explanationAudioUrl: await getS3AudioFileUrl(word.explanationAudioFilename),
          usage: word.usage ? JSON.parse(word.usage) : '',
        };
      }))

      res.status(200).json({
        wordList: updatedWordList,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

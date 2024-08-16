import { getWordListById } from '../../../utils/prisma-utils';
import { getS3FileUrl, getS3AudioFileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const {wordListId} = req.query

      const wordDetail = await getWordListById(parseInt(wordListId));
      wordDetail.imageUrl =  await getS3FileUrl(wordDetail.imageFilename),
      wordDetail.usage =  wordDetail.usage ? JSON.parse(wordDetail.usage) : '',
     wordDetail.explanationAudioUrl = await getS3AudioFileUrl(wordDetail.explanationAudioFilename),

      res.status(200).json({
        wordDetail
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

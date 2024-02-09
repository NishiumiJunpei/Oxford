import { getWordListByBlockIds } from '../../../utils/prisma-utils'; // getUserById 関数のインポート
import { getS3FileUrl } from '../../../utils/aws-s3-utils';

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {  

        const { blockIds } = req.body
        let wordList = await getWordListByBlockIds(blockIds);

        wordList = await Promise.all(wordList.map(async word => {
          return {
            ...word,
            imageUrl: await getS3FileUrl(word.imageFilename),
            usage: word.usage ? JSON.parse(word.usage) : '',
          };
        }));
  

        if (!wordList) {
          return res.status(404).json({ error: 'wordList not found' });
        }
  
        // wordList.sort((a, b) => a.name < b.name);
        res.status(200).json({ wordList });

    } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  
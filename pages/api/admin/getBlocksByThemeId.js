import { getS3MovieFileUrl } from '@/utils/aws-s3-utils';
import { getBlocks, getWordListByCriteria } from '../../../utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {  
      const themeId = parseInt(req.query.themeId);
      const includeWordInfo = req.query.includeWordInfo === 'true'; // includeWordInfo パラメータを取得

      // Blocksの取得
      const blocks = await getBlocks(themeId);

      if (!blocks || blocks.length === 0) {
        return res.status(404).json({ error: 'Theme not found' });
      }

      let updatedBlocks;

      if (includeWordInfo) {
        // wordListを含めて詳細情報を追加する場合
        const wordList = await getWordListByCriteria({ themeId });

        updatedBlocks = await Promise.all(blocks.map(async (block) => {
          const words = wordList.filter(w => w.blocks.some(b => b.blockId == block.id));
          const noImageNum = words.filter(w => !w.imageFilename).length;

          // 映画のURLを取得する
          const normalMovieUrl = block.normalMovieFilename ? await getS3MovieFileUrl(block.normalMovieFilename) : null;
          const reproductionMovieUrl = block.reproductionMovieFilename ? await getS3MovieFileUrl(block.reproductionMovieFilename) : null;
          const explanationMovieUrl = block.explanationMovieFilename ? await getS3MovieFileUrl(block.explanationMovieFilename) : null;

          return {
            ...block,
            wordNum: words.length,
            noImageNum,
            normalMovieUrl,
            reproductionMovieUrl,
            explanationMovieUrl
          };
        }));
      } else {
        // wordListを取得せずに、ブロック情報のみ処理する場合
        updatedBlocks = await Promise.all(blocks.map(async (block) => {
          // 映画のURLを取得する
          const normalMovieUrl = block.normalMovieFilename ? await getS3MovieFileUrl(block.normalMovieFilename) : null;
          const reproductionMovieUrl = block.reproductionMovieFilename ? await getS3MovieFileUrl(block.reproductionMovieFilename) : null;
          const explanationMovieUrl = block.explanationMovieFilename ? await getS3MovieFileUrl(block.explanationMovieFilename) : null;

          return {
            ...block,
            normalMovieUrl,
            reproductionMovieUrl,
            explanationMovieUrl
          };
        }));
      }

      res.status(200).json({ blocks: updatedBlocks });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

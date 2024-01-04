import { getBlocks, getWordListByCriteria } from '../../../utils/prisma-utils'; // getUserById 関数のインポート

export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {  

        const themeId = req.query.themeId
        const blocks = await getBlocks(parseInt(themeId));


        if (!blocks) {
          return res.status(404).json({ error: 'Theme not found' });
        }

        const wordList = await getWordListByCriteria({themeId: parseInt(themeId)})
        const updatedBlocks = blocks.map(block =>{
        const words = wordList.filter(w => w.blocks.some(b => b.blockId == block.id))
        const notExampleWordWords = words.filter(w => !w.imageFilename)

        return {
            ...block,
            wordNum: words.length,
            notExampleWordNum: notExampleWordWords.length    
          }
        })

  
        updatedBlocks.sort((a, b) => a.displayOrder - b.displayOrder);
        res.status(200).json({ blocks: updatedBlocks });

    } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  
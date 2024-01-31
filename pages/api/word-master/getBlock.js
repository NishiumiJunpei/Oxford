import { getUserFromSession } from '@/utils/session-utils';
import { getBlock } from '../../../utils/prisma-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = await getUserFromSession(req, res);
      const { blockId } = req.query;

      if (!blockId) {
        return res.status(400).json({ error: 'blockId are required' });
      }

      const block = await getBlock(parseInt(blockId));


      res.status(200).json({        
        block,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

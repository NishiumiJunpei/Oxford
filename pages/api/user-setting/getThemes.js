import { getThemes } from '../../../utils/prisma-utils'; // getUserById 関数のインポート

export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {  

        const themes = await getThemes();

        if (!themes) {
          return res.status(404).json({ error: 'Theme not found' });
        }
  
        themes.sort((a, b) => a.displayOrder - b.displayOrder);
        res.status(200).json({ themes });

    } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }
  
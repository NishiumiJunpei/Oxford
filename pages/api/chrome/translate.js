
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
    //   const { userId } = await getUserFromSession(req, res);

      res.status(200).json({        
        'susuEnglish is great!!',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

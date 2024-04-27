import { getAllUsers } from '../../../utils/user-utils'; // Adjust the path as necessary

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error); // More descriptive logging
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']); // Only GET is allowed, not POST
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

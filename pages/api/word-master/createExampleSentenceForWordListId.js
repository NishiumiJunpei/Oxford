import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Return 405 Method Not Allowed if the request is not POST
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session.userId;
  if (userId != 1 ) {
    // Return an appropriate error message and status code
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { wordListId } = req.body; // Get wordListId from the request body

  try {
    const wordDetail = await createExampleSentenceAndImageByGPT(wordListId);
    res.status(200).json({wordDetail});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

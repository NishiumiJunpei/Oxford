import { createExampleSentenceAndImageByGPT } from '../../../utils/wordList-utils';
import { getUserFromSession } from '@/utils/session-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Return 405 Method Not Allowed if the request is not POST
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = await getUserFromSession(req, res);

  if (userId != 1 ) {
    // Return an appropriate error message and status code
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { wordListId, rewirteScope } = req.body; // Get wordListId from the request body

  try {
    let mode = {
      japanese: {on: true, rewrite: false},
      exampleSentence: {on: true, rewrite: false},
      image: {on: true, rewrite: false},
      usage: {on: false, rewrite: false},
      synonyms: {on: false, rewrite: false},
    }
    if (rewirteScope == 'IMAGE'){
      mode.image.rewrite = true
    }
    if (rewirteScope == 'EX_IMAGE'){
      mode.exampleSentence.rewrite = true
    }
    if (rewirteScope == 'J_EX_IMAGE'){
      mode.japanese .rewrite = true
    }
  

    const wordDetail = await createExampleSentenceAndImageByGPT(wordListId, mode);
    
    res.status(200).json({wordDetail});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

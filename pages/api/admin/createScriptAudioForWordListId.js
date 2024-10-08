import { createAudioFromScript } from '../../../utils/wordList-utils';
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
      explanationScript: { on: true, rewrite: false },
      explanationAudio: { on: true, rewrite: false },
    };

    if (rewirteScope == 'SCRIPT'){
      mode.explanationScript.rewrite = true
    }
    if (rewirteScope == 'AUDIO'){
      mode.explanationAudio.rewrite = true
    }

    // 音声とスクリプトの生成処理を実行
    const wordDetail = await createAudioFromScript(wordListId, mode);

    
    res.status(200).json({wordDetail});
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

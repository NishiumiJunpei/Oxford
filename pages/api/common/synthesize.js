// pages/api/common/synthesize.js
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new TextToSpeechClient();
      const text = req.body.text;
      const lang = req.body.lang

      //https://cloud.google.com/text-to-speech/docs/voices?hl=ja
      const languageCode = lang == 'en' ? 'en-US' : 
                          lang == 'ja' ? 'ja-JP' : 'en-US'
                    
      const name = lang == 'en' ? 'en-US-Neural2-F' :  //女性：en-US-Neural2-F, G, H,  男性：en-US-Neural2-D, A, I, J
                          lang == 'ja' ? 'ja-JP-Neural2-B' : 'en-US-Neural2-F'

      const request = {
        input: { text: text },
        voice: { languageCode,  name},
        // voice: { languageCode, ssmlGender: 'NEUTRAL', name: 'en-US-Neural2-A' },
        audioConfig: { audioEncoding: 'MP3' },
      };

      const [response] = await client.synthesizeSpeech(request);
      res.status(200).json({ audioContent: response.audioContent });
    } catch (error) {
      console.error(error); // これを追加
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

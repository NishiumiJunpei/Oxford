// pages/api/common/synthesize.js
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new TextToSpeechClient();
      const text = req.body.text;
      const lang = req.body.lang || 'en'
      const gender = req.body.gender || 'female'

      //https://cloud.google.com/text-to-speech/docs/voices?hl=ja
      const languageCode = lang == 'en' ? 'en-US' : 
                          lang == 'ja' ? 'ja-JP' : 'en-US'
                    
      const name = (lang === 'en' && gender === 'male') ? 'en-US-Neural2-D' :
          (lang === 'en' && gender === 'female') ? 'en-US-Neural2-F' :
          (lang === 'ja' && gender === 'male') ? 'ja-JP-Neural2-C' : 
          (lang === 'ja' && gender === 'female') ? 'ja-JP-Neural2-B' : 
          'en-US-Neural2-F'; // デフォルト値
             

      const request = {
        input: { text: text },
        voice: { languageCode,  name},
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: 1.08
        }
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

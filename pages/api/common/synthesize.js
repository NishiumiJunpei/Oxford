// pages/api/common/synthesize.js
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = new TextToSpeechClient();
      const text = req.body.text;

      const request = {
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
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

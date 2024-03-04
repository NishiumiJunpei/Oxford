import { speakerImageUrls } from '@/utils/variables';
import { getGoogleSheetData } from '@/utils/googleapi-utils';

function getRandomImageUrl(gender) {
  const urls = speakerImageUrls[gender.toLowerCase()];
  return urls[Math.floor(Math.random() * urls.length)];
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const spreadsheetId = '1yF-G1zneVKaS2_WxKAwBqDjRQ49eFMlEUzn7s9zG3Eg';
      const range = 'sceneList'; // 読み込むシートと範囲
      const rawData = await getGoogleSheetData(spreadsheetId, range);


      const headers = rawData[0];
      const data = rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers[index];
          obj[key] = value;
        });
        return obj;
      });

      const sceneList = data
        .filter(row => row.pickForApp === '1')
        .map(scene => {
          if (scene.sentences) {
            scene.sentences = JSON.parse(scene.sentences);
            const uniqueImageUrls = {
              male: getRandomImageUrl('male'),
              female: getRandomImageUrl('female')
            };
            scene.sentences.forEach(sentence => {
              if (sentence?.speakerGender) {
                sentence.speakerAvatarImageUrl = uniqueImageUrls[sentence.speakerGender.toLowerCase()];
              }
            });
          }

          scene.phraseToLearn = [];
          return scene;
        });

      if (sceneList.length === 0) {
        return res.status(200).json({ error: 'SceneList not found' });
      }
      res.status(200).json({ sceneList });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

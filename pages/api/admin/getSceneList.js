import { speakerInfo } from '@/utils/variables';
import { getGoogleSheetData } from '@/utils/googleapi-utils';
import { convertToSSML } from '@/utils/utils';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const spreadsheetId = '1yF-G1zneVKaS2_WxKAwBqDjRQ49eFMlEUzn7s9zG3Eg';
      const range = 'sceneList'; // 読み込むシートと範囲
      const rawData = await getGoogleSheetData(spreadsheetId, range);
      const displayChunk = 1;


      const headers = rawData[0];
      const data = rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((value, index) => {
          let key = headers[index];
          obj[key] = value;
        });
        return obj;
      });


      const speakerSelection = {};
      const sceneList = data
        .filter(row => row.pickForApp === '1')
        .map(scene => {
          if (scene.sentences) {
            scene.sentences = JSON.parse(scene.sentences);
            if (!Array.isArray(scene.sentences)) {
              throw new TypeError("sentences is not an array");
            }

            const alreadySelected = []; // 選択済みのspeakerInfo要素を追跡
            scene.sentences = scene.sentences.map(item => {
              if (!speakerSelection[item.speakerName]) {
                const genderInfo = speakerInfo[item.speakerGender];
            
                // まだ選択されていない要素のみをフィルタリング
                const availableSelections = genderInfo.filter(info => !alreadySelected.includes(info));
            
                if (availableSelections.length > 0) {
                  // 利用可能な要素からランダムに選択
                  const randomIndex = Math.floor(Math.random() * availableSelections.length);
                  const randomSelection = availableSelections[randomIndex];
            
                  // 選択済み配列とspeakerSelectionに追加
                  alreadySelected.push(randomSelection);
                  speakerSelection[item.speakerName] = randomSelection;
                } else {
                  // すべての要素が既に選択されている場合（オプション：エラーハンドリングや代替ロジックをここに追加）
                  console.warn('All elements have been selected. Need to handle this scenario.');
                }
              }
            
                      
              return {
                ...item,
                speakerAvatarImageUrl: speakerSelection[item.speakerName].imageUrl,
                voice:speakerSelection[item.speakerName].voice,
              };
            });

          }

          if (scene.phraseToLearn) {
              let ptl = JSON.parse(scene.phraseToLearn);
          
              // 1. indexに基づいてptlの配列を昇順にソート
              ptl.sort((a, b) => parseInt(a.index) - parseInt(b.index));
          
              // 2. forEachでの処理をmapに変更して、新しいプロパティを追加
              ptl = ptl.map(phrase => {
                  if (phrase.index) {
                    phrase.originalSentenceE = scene.sentences[parseInt(phrase.index)].sentenceE;
                    // phrase.explanationSSML = convertToSSML(phrase.explanation)
                      
                  }
                  return phrase;
              });
          
              // 3. displayChunkのサイズで区切る
              const chunkedPtl = [];
              for (let i = 0; i < ptl.length; i += displayChunk) {
                  chunkedPtl.push(ptl.slice(i, i + displayChunk));
              }
          
              // 4. 結果をscene.phraseToLearnに代入
              scene.phraseToLearn = chunkedPtl;
          }

          return scene;
        });

      if (sceneList.length === 0) {
        return res.status(200).json({ error: 'SceneList not found' });
      }
      res.status(200).json({ sceneList });

    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

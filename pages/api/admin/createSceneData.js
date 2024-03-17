import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData, writeToGoogleSheet } from '@/utils/googleapi-utils';
import { generateSceneSentences, generatePhraseToLearnFromScene } from '@/utils/openai-utils';

// Assume these functions are defined elsewhere
// import { getGoogleSheetData, writeToGoogleSheet, generateScene, generatePhraseToLearnFromScene } from './yourHelpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await getUserFromSession(req, res);
    const spreadsheetId = '1yF-G1zneVKaS2_WxKAwBqDjRQ49eFMlEUzn7s9zG3Eg';
    const sheetName = 'sceneList'; // シート名を指定
    const rawData = await getGoogleSheetData(spreadsheetId, `${sheetName}!A:Z`);
    const headers = rawData[0];
    const data = rawData.slice(1).map((row, index) => ({
      ...row.reduce((obj, value, idx) => ({ ...obj, [headers[idx]]: value }), {}),
      rowIndex: index + 2 // スプレッドシート上の実際の行インデックス（ヘッダーを除く）
    }));

    const filteredData = data.filter(row => row.pickForApp === '1');
    const total = filteredData.length; // 総件数

    for (let [currentIndex, row] of filteredData.entries()) {
      console.log(`Processing row ${currentIndex + 1} of ${total}`); // 現在処理中の件数を表示

      if (!row.sentences) {
        const response = await generateSceneSentences(row.movieTitle, row.title, row.description, row.engLevel);
        row.sentences = JSON.stringify(response)
      }

      if (!row.phraseToLearn) {
        const response = await generatePhraseToLearnFromScene(row.sentences, row.engLevel);
        row.phraseToLearn = JSON.stringify(response)
      }

      const range = `${sheetName}!A${row.rowIndex}:Z${row.rowIndex}`; // 更新する行の範囲
      await writeToGoogleSheet(spreadsheetId, range, [
        [row.id, row.pickForApp, row.type, row.category, row.movieTitle, row.title, row.description, row.engLevel, row.sentences, row.phraseToLearn]
      ]);

      console.log(`Processed row ${currentIndex + 1} of ${total}`);
    }

    console.log('All rows have been processed.');
    res.status(200).json({ message: 'Processed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

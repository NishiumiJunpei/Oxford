import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData, writeToGoogleSheet } from '@/utils/googleapi-utils';
import { generateSpeakingTopicData } from '@/utils/openai-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // セッションからユーザー情報を取得
    const { userId } = await getUserFromSession(req, res);

    // Google Sheetsの情報
    const spreadsheetId = '1pfKfTmiF_H11qSRToHNX8qcE0ApN4RrDxlx5V9DkQ3M'; // あなたのスプレッドシートIDに置き換えてください
    const topicListSheetName = 'topicList'; // topicListシート名
    const topicDataSheetName = 'topicData'; // topicDataシート名

    // Google SheetsからtopicListシートのデータを取得
    const rawData = await getGoogleSheetData(spreadsheetId, topicListSheetName);

    // ヘッダーとデータを分離
    const headers = rawData[0];
    const data = rawData.slice(1).map((row, rowIndex) => {
      let obj = { rowIndex: rowIndex + 2 }; // 行番号を保存（ヘッダー行を除く）
      row.forEach((value, index) => {
        let key = headers[index];
        obj[key] = value;
      });
      return obj;
    });

    // Statusが空白かつ、FlagToCreateが1の行をフィルタ
    const rowsToProcess = data.filter(row => !row.Status && row.FlagToCreate === '1');

    // フィルタリング後の行数をログ出力
    console.log(`Rows to process: ${rowsToProcess.length}`);

    // 処理する行ごとにgenerateSpeakingTopicDataを実行
    for (const row of rowsToProcess) {
      const { Category, Topic, rowIndex } = row;

      // generateSpeakingTopicDataを呼び出してデータを生成
      const generatedData = await generateSpeakingTopicData(Category, Topic);

      // 処理内容のログ
      console.log(`Generated data for Category: ${Category}, Topic: ${Topic}`, generatedData);

      const dataToWrite = JSON.stringify(generatedData);

      // (1) topicListシートのStatus列に"Created"を書き込む
      const statusRange = `topicList!C${rowIndex}:C${rowIndex}`; // Status列は3列目
      await writeToGoogleSheet(spreadsheetId, statusRange, [['Created']], 'UPDATE');

      // (2) topicDataシートにデータをUPDATE
      const topicDataRange = `${topicDataSheetName}!A:C`; // topicDataシートのA列からC列まで
      const values = [[Category, Topic, dataToWrite]];

      // シート `topicData` にデータを書き込み
      await writeToGoogleSheet(spreadsheetId, topicDataRange, values, 'APPEND');
    }

    // 全ての処理が完了したら、成功メッセージを返す
    res.status(200).json({ message: 'Processed successfully.' });

  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).json({ error: error.message });
  }
}

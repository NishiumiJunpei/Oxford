import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData, writeToGoogleSheet } from '@/utils/googleapi-utils';
import { generateQuestionData, generateAnswerData } from '@/utils/openai-utils'; 

export default async function handler(req, res) {
  console.log('Request received with method:', req.method); // リクエストメソッドのログ出力

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    console.log('Invalid method:', req.method); // 許可されていないメソッドの場合のログ
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Fetching user session...'); // セッション取得開始のログ
    const { userId } = await getUserFromSession(req, res);
    console.log('User session fetched. User ID:', userId); // セッション取得成功のログ

    // Google Sheetsの情報
    const spreadsheetId = '1pfKfTmiF_H11qSRToHNX8qcE0ApN4RrDxlx5V9DkQ3M'; // あなたのスプレッドシートIDに置き換えてください
    const topicListSheetName = 'topicList'; // topicListシート名
    const questionDataSheetName = 'questionData'; // questionDataシート名

    console.log('Fetching data from Google Sheets...'); // Googleシートデータ取得開始のログ
    const rawData = await getGoogleSheetData(spreadsheetId, topicListSheetName);
    console.log('Data fetched from Google Sheets:', rawData); // Googleシートデータ取得成功のログ

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
    console.log('Parsed data:', data); // パースされたデータのログ

    // Statusが空白かつ、FlagToCreateが1の行をフィルタ
    const rowsToProcess = data.filter(row => !row.status && row.flagToCreate === '1');
    console.log(`Rows to process: ${rowsToProcess.length}`); // フィルタリングされた行数のログ

    // 処理する行ごとにgenerateQuestionDataとgenerateAnswerDataを実行
    for (const row of rowsToProcess) {
      const { category, topic, rowIndex } = row;
      console.log(`Processing row ${rowIndex} for category: ${category}, topic: ${topic}`); // 処理中の行のログ

      // generateQuestionDataを呼び出してダミーデータを生成
      const generatedData = await generateQuestionData(topic);
      console.log('Generated question data:', generatedData); // 質問データ生成成功のログ

      // questionDataに書き込むデータを整形
      const dataToWrite = [];

      // 各カテゴリ・質問ごとに処理
      for (const categoryData of generatedData.categories) {
        const { title: questionCategory, questions } = categoryData;

        for (const question of questions) {
          console.log(`Generating answer for question: ${question}`); // 質問に対する回答生成のログ
          // generateAnswerDataを呼び出してダミーの回答データを生成
          const answerData = await generateAnswerData(question);
          console.log('Generated answer data:', answerData); // 回答データ生成成功のログ

          // simpleAnswerとdetailedAnswerを取得
          const { simpleAnswer, detailedAnswer } = answerData;

          // データをフォーマットに合わせて整形
          dataToWrite.push([
            category,          // category
            topic,             // topic
            questionCategory,  // questionCategory
            question,          // question
            simpleAnswer,      // simpleAnswer
            detailedAnswer     // detailedAnswer
          ]);
        }
      }

      console.log('Writing data to Google Sheets:', dataToWrite); // 書き込むデータのログ

      // (1) topicListシートのStatus列に"Created"を書き込む
      const statusRange = `topicList!C${rowIndex}:C${rowIndex}`; // Status列は3列目
      await writeToGoogleSheet(spreadsheetId, statusRange, [['Created']], 'UPDATE');
      console.log(`Updated status to 'Created' for row ${rowIndex}`); // ステータス更新成功のログ

      // (2) questionDataシートにデータをAPPENDモードで書き込む
      const questionDataRange = `${questionDataSheetName}!A:F`; // questionDataシートのA列からF列まで
      await writeToGoogleSheet(spreadsheetId, questionDataRange, dataToWrite, 'APPEND');
      console.log('Appended data to questionData sheet'); // データ追記成功のログ
    }

    // 全ての処理が完了したら、成功メッセージを返す
    console.log('Processing completed successfully'); // 処理完了のログ
    res.status(200).json({ message: 'Processed successfully.' });

  } catch (error) {
    console.error('Error during processing:', error); // エラー時のログ
    res.status(500).json({ error: error.message });
  }
}

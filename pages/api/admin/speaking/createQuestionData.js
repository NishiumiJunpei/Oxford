import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData, writeToGoogleSheet } from '@/utils/googleapi-utils';
import { generateKnowledgeBase, generateQuestionData, generateAnswerData } from '@/utils/openai-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await getUserFromSession(req, res);

    const spreadsheetId = '1pfKfTmiF_H11qSRToHNX8qcE0ApN4RrDxlx5V9DkQ3M';
    const topicListSheetName = 'topicList';
    const questionDataSheetName = 'questionData';

    // Google Sheetsからデータ取得
    const rawData = await getGoogleSheetData(spreadsheetId, topicListSheetName);
    const headers = rawData[0];
    const data = rawData.slice(1).map((row, rowIndex) => {
      let obj = { rowIndex: rowIndex + 2 };
      row.forEach((value, index) => {
        let key = headers[index];
        obj[key] = value;
      });
      return obj;
    });

    // フィルタリング: status が空で、flagToCreate が 1 の行のみを対象に
    const rowsToProcess = data.filter(row => !row.status && row.flagToCreate === '1');

    for (const row of rowsToProcess) {
      const { category, topic, rowIndex } = row;

      // KnowledgeBase生成
      const { knowledgeBaseE, knowledgeBaseJ } = await generateKnowledgeBase(topic);

      // 状態更新準備: Statusを "Created" に設定
      const statusRange = `topicList!C${rowIndex}:F${rowIndex}`;

      // 問題データ生成
      const questionData = await generateQuestionData(topic, knowledgeBaseE);
      const questionEntries = [];

      for (let i = 0; i < questionData.questionsE.length; i++) {
        const questionE = questionData.questionsE[i];
        const questionJ = questionData.questionsJ[i];

        // 各質問に対して回答データ生成
        const { answerE, answerJ } = await generateAnswerData(questionE, knowledgeBaseE);

        // 書き込みデータ準備
        questionEntries.push([category, topic, questionE, questionJ, answerE, answerJ]);
      }

      // topicListへ書き込み
      await writeToGoogleSheet(spreadsheetId, statusRange, [['Created', '1', knowledgeBaseE, knowledgeBaseJ]], 'UPDATE');
      // questionData シートへの書き込み
      await writeToGoogleSheet(spreadsheetId, `${questionDataSheetName}!A:F`, questionEntries, 'APPEND');
    }

    res.status(200).json({ message: 'Processed successfully.' });
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).json({ error: error.message });
  }
}

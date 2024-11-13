import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData, writeToGoogleSheet } from '@/utils/googleapi-utils';
import { generateKnowledgeBase, generateQuestionData, generateAnswerData, generateInterstingBlog, generateSentenceData, enhanceKnowledgeBase } from '@/utils/openai-utils';

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


    // const rowsToProcess2 = data.filter(row => row.flagToCreate === '2');
    // for (const row of rowsToProcess2) {
    //   const { category, topic, rowIndex, knowledgeBaseE } = row

    //   const { knowledgeBaseEnew, knowledgeBaseJ } = await enhanceKnowledgeBase(knowledgeBaseE);
    //   const interestingBlog = await generateInterstingBlog(knowledgeBaseJ);
    //   const statusRange = `topicList!C${rowIndex}:G${rowIndex}`;

    //   // topicListへ書き込み
    //   await writeToGoogleSheet(spreadsheetId, statusRange, [['Created', '1', knowledgeBaseEnew, knowledgeBaseJ, interestingBlog]], 'UPDATE');

    // }
    


    // フィルタリング: status が空で、flagToCreate が 1 の行のみを対象に
    const rowsToProcess = data.filter(row => !row.status && row.flagToCreate === '1');

    for (const row of rowsToProcess) {
      const { category, topic, rowIndex } = row;

      // KnowledgeBase生成
      const { knowledgeBaseE, knowledgeBaseJ } = await generateKnowledgeBase(topic);
      const interestingBlog = await generateInterstingBlog(knowledgeBaseJ);

      // 状態更新準備: Statusを "Created" に設定
      const statusRange = `topicList!C${rowIndex}:G${rowIndex}`;

      // 問題データ生成
      const questionData = await generateQuestionData(topic, knowledgeBaseE);
      const questionEntries = [];

  
      const answerE_merged = []
      for (let i = 0; i < questionData.questionsE.length; i++) {
        const questionE = questionData.questionsE[i];
        const questionJ = questionData.questionsJ[i];

        // 各質問に対して回答データ生成
        const { answerE, answerJ } = await generateAnswerData(questionE, knowledgeBaseE);
        answerE_merged.push(answerE)

        // 書き込みデータ準備
        questionEntries.push([category, topic, questionE, questionJ, answerE, answerJ]);
      }



      const sentences = await generateSentenceData(answerE_merged.join('\n'));
      let no = 1; // 連番の初期値を1に設定
      // 書き込むデータを整形

      const sentenceDataToWrite = sentences.map(sentence => [
        category,          // category
        topic,             // topic
        no++,              // 連番（No）
        sentence.sentenceJ, // 日本語文
        sentence.sentenceE  // 英文
      ]);    

      // topicListへ書き込み
      await writeToGoogleSheet(spreadsheetId, statusRange, [['Created', '1', knowledgeBaseE, knowledgeBaseJ, interestingBlog]], 'UPDATE');
      // questionData シートへの書き込み
      await writeToGoogleSheet(spreadsheetId, `${questionDataSheetName}!A:F`, questionEntries, 'APPEND');
      // Google Sheetにデータを追加
      await writeToGoogleSheet(spreadsheetId, 'sentenceData', sentenceDataToWrite, 'APPEND');

    }

    res.status(200).json({ message: 'Processed successfully.' });
  } catch (error) {
    console.error('Error during processing:', error);
    res.status(500).json({ error: error.message });
  }
}

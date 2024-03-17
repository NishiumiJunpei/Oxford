import { getUserFromSession } from '@/utils/session-utils';
import { writeToGoogleSheet } from '@/utils/googleapi-utils';
import { generatePhraseSentences } from '@/utils/openai-utils';



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { userId } = await getUserFromSession(req, res);
    const numSentence = 3

    const { categoryList } = req.body;
    console.log('test10', categoryList)
    const spreadsheetId = '1JJCY9EkGzlQb-l_0zRiKxjYsVds3Y73beJtEATErWuw';
    const sheetName = 'phraseList'; // Googleシートのタブ名

    // createFlagが1の項目をフィルタリング
    const filteredCategories = categoryList.filter(cate => cate.createFlag === 1);

    console.log(`Total count: ${filteredCategories.length}`); // フィルタリング後のカテゴリ数のログ
    for (const [index, category] of filteredCategories.entries()) {
      console.log(`Processing category ${index + 1} of ${filteredCategories.length}: ${category.category1}, ${category.category2}`); // 各カテゴリ処理開始のログ

      // generatePhraseSentences関数を呼び出し
      const sentences = await generatePhraseSentences(category.category1, category.category2, category.category2_desc, category.engLevel, numSentence);
      console.log(`Generated ${sentences.length} sentences for category: ${category.category1}, ${category.category2}`); // 文生成成功のログ

      // 書き込むデータの配列を準備
      const values = sentences.map(sentence => [
        category.category1.trim(), category.category2.trim(), category.engLevel, sentence.sentenceE, sentence.sentenceJ
      ]);

      console.log('test3', values)
      // 最後の行を特定してデータを追加
      const appendDataResponse = await writeToGoogleSheet(spreadsheetId, `${sheetName}!A:E`, values, 'APPEND');
    }

    res.status(200).json({ message: 'Processed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

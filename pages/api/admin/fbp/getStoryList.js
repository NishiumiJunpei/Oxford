import { getUserFromSession } from '@/utils/session-utils';
import { getGoogleSheetData } from '@/utils/googleapi-utils';
import { getS3FileUrl } from '@/utils/aws-s3-utils';

export default async function handler(req, res) {
  if (req.method === 'GET') { 
    try {
      // クエリパラメータからcategoryを取得
      const { category } = req.query;

      // ユーザーのセッションからユーザーIDを取得
      const { userId } = await getUserFromSession(req, res);

      // Google Sheetsの情報
      const spreadsheetId = '1Tokf8NtzTSvgkuV5KCNmTfJWYjXePGOb0QmKA9nXp7w';
      const sheetRange = 'storyList!A2:D';  // カラムが4つあることを前提に範囲を設定

      // Google Sheetsからデータを取得
      const rawData = await getGoogleSheetData(spreadsheetId, sheetRange);

      // categoryが指定されている場合は、まずそれをフィルタリング
      const filteredData = rawData.filter(row => {
        const [rowCategory] = row;
        return !category || rowCategory === category;
      });

      // フィルタリングされたデータに対してのみ処理を行う
      const processedData = await Promise.all(
        filteredData.map(async (row) => {
          const [rowCategory, contentId, contentString, displayOrder] = row;
          const content = JSON.parse(contentString).content;  // JSONをパース

          // メインの画像URLを取得
          if (content.titleImageFilename) {
            const imageUrl = await getS3FileUrl(content.titleImageFilename);
            content.titleImageUrl = imageUrl;
          }

          // 各セクション内の単語に対する画像URLを補完
          if (content.sections) {
            content.sections = await Promise.all(
              content.sections.map(async (section) => {
                if (section.wordsExplanation) {
                  section.wordsExplanation = await Promise.all(
                    section.wordsExplanation.map(async (word) => {
                      if (word.wordImageFilename) {
                        const wordImageUrl = await getS3FileUrl(word.wordImageFilename);
                        word.imageUrl = wordImageUrl;
                      }
                      return word;
                    })
                  );
                }
                return section;
              })
            );
          }

          return {
            category: rowCategory,
            contentId,
            content,
            displayOrder,
          };
        })
      );

      // JSON形式でレスポンスを返す
      res.status(200).json(processedData);

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

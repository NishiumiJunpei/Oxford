// Import the necessary utility
import { getWordsFromNotion } from "../../utils/notion";

// Export the API handler function
export default async function handler(req, res) {
  // Check for the correct HTTP method (POST)
  if (req.method !== 'POST') {
    // If not POST, send a 405 Method Not Allowed response
    res.status(405).send({ error: 'Method Not Allowed', method: req.method });
    return;
  }

  // Execute the original function
  const stats = await getWordListByTheme();

  // Send the result as a JSON response
  res.status(200).json(stats);
}

async function getWordListByTheme() {
    // Notionからデータを取得
    const data = await getWordsFromNotion('EIKENSUB1_WORD_LIST');

    console.log('data', data.length)

  // カテゴリとブロックごとにデータを整理
  const categoriesBlocksMap = data.reduce((acc, item) => {
    const key = `${item.properties.Category.name}_${item.properties.Block.number}`;
    if (!acc[key]) {
      acc[key] = {
        category: item.properties.Category.name,
        block: item.properties.Block.number,
        totalWords: 0,
        memorizedWords: 0,
      };
    }
    acc[key].totalWords += 1;
    if (item.properties.Memorized.checkbox) {
      acc[key].memorizedWords += 1;
    }
    return acc;
  }, {});

  // 統計情報を計算
  const stats = Object.values(categoriesBlocksMap).map(item => ({
    category: item.category,
    block: item.block,
    totalWords: item.totalWords,
    memorizedWords: item.memorizedWords,
    memorizationRate: ((item.memorizedWords / item.totalWords) * 100).toFixed(2),
  }));

  return stats;
}


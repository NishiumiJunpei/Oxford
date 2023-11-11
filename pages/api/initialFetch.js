import { getWordsFromNotion } from "../../utils/notion";

export default async function initialFetchHandler(req, res) {
  // クエリパラメータからオプションを取得
  const { maxItems, lastChecked, includeMemorized } = req.query;
  
  const shouldIncludeMemorized = includeMemorized === 'true';

  // Notion APIから単語を取得
  let words = await getWordsFromNotion();

  // 日付のフィルタリングに使用する基準日を決定
  const today = new Date();
  const lastCheckedDate = new Date();
  switch (lastChecked) {
    case 'all':
      lastCheckedDate.setDate(today.getDate());
      break;
    case 'day':
      lastCheckedDate.setDate(today.getDate() - 1);
      break;
    case 'week':
      lastCheckedDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      lastCheckedDate.setMonth(today.getMonth() - 1);
      break;
    default:
      // デフォルトでは過去1週間に設定
      lastCheckedDate.setDate(today.getDate() - 7);
  }

  console.log(includeMemorized)

  // フィルタリング処理
  words = words.filter(word => {
    const checkDate = word.properties.CheckDate?.date?.start;
    const wordDate = checkDate ? new Date(checkDate) : null;
    const isMemorized = word.properties.Memorized?.checkbox || false;
    const isDateValid = wordDate ? wordDate <= lastCheckedDate : false;

    // 記憶された単語を含むかどうかをチェック
    // shouldIncludeMemorizedがtrueなら全ての単語、falseなら記憶されていない単語のみを抽出
    const memorizedCheck = shouldIncludeMemorized || !isMemorized;

    // 日付が基準に合っているかをチェック
    return memorizedCheck && isDateValid;
  });

  // 最大項目数に応じて単語を制限
  const limitedWords = words.slice(0, Math.min(words.length, maxItems));

  // レスポンスを返却
  res.json({ words: limitedWords });
}

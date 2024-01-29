import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export async function generateExampleSentences(english, japanese) {
  try{
    const content = `Given the English word '${english}' (${japanese}), create one example sentence using this word. Then provide a plain text translation of this sentence in Japanese and a list of up to three English synonyms for the word. Format your response as a JSON object with keys 'e' for the English sentence, 'j' for the Japanese translation, and 's' for the list of synonyms. Do not include labels such as 'Example' or 'Translation', and explicitly mark the list as synonyms.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      temperature: 0.2,
      response_format: { "type": "json_object" },
      max_tokens: 300,
    });

    const jsonResponse = JSON.parse(response.choices[0].message.content);
    let { e: exampleSentenceE, j: exampleSentenceJ, s: rawSynonyms } = jsonResponse;
    const synonyms = Array.isArray(rawSynonyms) ? rawSynonyms.join(', ') : rawSynonyms;

    return {exampleSentenceE, exampleSentenceJ, synonyms};

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}


// 画像を生成する関数
export async function generateImage(description) {
  try {
    const image = await openai.images.generate({
      model: "dall-e-3", 
      prompt: description ,
      n: 1,
      size: '1024x1024'
    });

    const ret = image ? image.data[0].url : ''
    return ret; // または適切なプロパティを使用
  } catch (error) {
    console.error('generateImage error:', error);
  }
}

export async function generateWordStory(wordList, length, genre, characters, levelKeyword) {

    const wordsString = wordList.map(word => `${word.english} (${word.japanese})`).join(', ');
    const lengthMapping = { 'Short': 50, 'Medium': 150, 'Long': 300 };
    const maxCharacters = lengthMapping[length];

    const content = `指定された単語を使用して、与えられた条件に基づき英語の物語を作成します。物語は、特に${genre}ジャンルに沿った内容でお願いします。各部分の日本語訳も含めてください。英語の文が2つ続いたら、その後に両方の日本語訳を挿入してください。物語の難易度は${levelKeyword}のレベルにしてください。
    #使用する単語: ${wordsString}    
    #物語の単語数上限: ${maxCharacters}字
    #ジャンル: ${genre}
    #登場人物: ${characters}`;

    // 以下に、APIへのリクエストを行うコードが続きます。        
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview", // gpt-4, gpt-3.5-turbo-1106
        messages: [{ role: 'assistant', content }],
        temperature: 0.7,
        max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
          
}


export async function generateExampleSentenceForUser(user, english, japanese, levelKeyword) {
  try{
    const { profileKeyword, interestKeyword } = user;

    const useProfile = Math.random() < 0.5; // 50%の確率でtrueかfalse

    // 選択されたカテゴリのキーワードを配列に変換し、ランダムに1つ選ぶ
    const selectedCategoryKeywords = useProfile ? profileKeyword.split(',') : interestKeyword.split(',');
    const selectedKeyword = selectedCategoryKeywords[Math.floor(Math.random() * selectedCategoryKeywords.length)].trim();

    const content = useProfile ? 
            `Given the English word '${english}' (${japanese}), create a detailed and longer example sentence using this word. The sentence should be relevant to a person whose profile matches '${selectedKeyword}' and be the level of ${levelKeyword}. After the example sentence, add two line breaks and then provide an explanation in Japanese about the usage of '${english}' in the sentence.`
            :
            `Given the English word '${english}' (${japanese}), create a detailed and longer example sentence using this word. The sentence should be related to the keyword '${selectedKeyword}' and be the level of ${levelKeyword}. After the example sentence, add two line breaks and then provide an explanation in Japanese about the usage of '${english}' in the sentence.`;

    console.log('keyword', selectedKeyword)
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      temperature: 0.5,
      max_tokens: 500,
    });

    const exampleSentenceForUser = response.choices[0].message.content
    // console.log('exampleSentenceForUser', exampleSentenceForUser, selectedKeyword)

    return exampleSentenceForUser;

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export async function generateReviewByAI(english, japanese, userSentence, levelKeyword) {
  try {
    // レビューのプロンプトを作成
    // const content = `Please review the following English sentence with the perspective of word usage accuracy. The user's English level is indicated by '${levelKeyword}'. Sentence: '${userSentence}'. Provide feedback on the usage of words and suggest a model answer if there are areas for improvement.`;
    const content = `次の英文を${english}(${japanese})の使い方の正確さの観点から、日本語でレビューしてください。レビューは'${levelKeyword}'のレベルに適した英文になっているかも見てください。文: '${userSentence}'。単語の使い方に関するフィードバックを提供し、改善の余地がある場合は${english}を使った文章を提案してください。`;

    // OpenAIのAPIを呼び出し
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // gpt-4, gpt-3.5-turbo-1106
      messages: [{ role: 'assistant', content }],
      temperature: 0.1,
      max_tokens: 500,
    });

    const reviewByAI = response.choices[0].message.content;
    return reviewByAI;

  } catch (error) {
    console.error('generateReviewByAI error:', error);
    throw error; // エラーを上位の関数に伝播させます
  }
}


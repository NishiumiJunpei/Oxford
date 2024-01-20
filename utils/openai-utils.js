import OpenAI from "openai";
import { getKanjiFromBirthday } from "./utils";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export async function generateExampleSentences(english, japanese, userProfile="", birthday="") {
  try{
    const content = `Given the English word '${english}' (${japanese}), create one example sentence using this word. Then provide a plain text translation of this sentence in Japanese and a list of synonyms for the word. Format your response as a JSON object with keys 'e' for the English sentence, 'j' for the Japanese translation, and 's' for the list of synonyms. Do not include labels such as 'Example' or 'Translation', and explicitly mark the list as synonyms.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      // model: "gpt-4",
      messages: [{role: 'assistant', content }],
      temperature: 0.5,
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

export async function generateWordStory(wordList, length, age, userProfile, genre, characters) {

    const wordsString = wordList.map(word => `${word.english} (${word.japanese})`).join(', ');
    const lengthMapping = { 'Short': 50, 'Medium': 150, 'Long': 300 };
    const maxCharacters = lengthMapping[length];
    // const content = `下記の単語を使い、プロフィールを考慮して、指定された条件に基づいて物語を作ってください。物語は英語で出力し、この年齢が理解できるレベルの言葉・漢字を使って日本語訳も書いてください。\n#プロフィール\n${userProfile}\n#単語:${wordsString}\n#条件\n物語の単語数上限：${maxCharacters}字\nジャンル：${genre}\n登場人物：${characters}`;
    const content = `指定された単語を使用して、与えられた条件に基づき英語の物語を作成します。各部分の日本語訳も含めてください。英語の文が2つ続いたら、その後に両方の日本語訳を挿入してください。
    #使用する単語: ${wordsString}    
    #物語の単語数上限: ${maxCharacters}字
    #ジャンル: ${genre}
    #登場人物: ${characters}`;
        

    // 以下に、APIへのリクエストを行うコードが続きます。        
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: 'assistant', content }],
        temperature: 0.5,
        max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
          
}


export async function generateExampleSentenceForUser(user, english, japanese) {
  try{
    const { profileKeyword, interestKeyword } = user;
    // キーワードのリストを作成し、ランダムに1つ選択します
    const keywords = [...profileKeyword.split(','), ...interestKeyword.split(',')];
    const selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)].trim();

    console.log('selectedKeyword', selectedKeyword)
    // プロンプトを作成します
    const content = `Given the English word '${english}' (${japanese}), create a detailed and longer example sentence using this word. The sentence should be related to the keyword '${selectedKeyword}' and elaborate on the context or situation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      // model: "gpt-4",
      messages: [{role: 'assistant', content }],
      temperature: 0.5,
      max_tokens: 100,
    });

    const exampleSentenceForuser = response.choices[0].message.content

    return exampleSentenceForuser;

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export async function generateReviewByAI(english, japanese, userSentence, levelKeyword) {
  try {
    // レビューのプロンプトを作成
    // const content = `Please review the following English sentence with the perspective of word usage accuracy. The user's English level is indicated by '${levelKeyword}'. Sentence: '${userSentence}'. Provide feedback on the usage of words and suggest a model answer if there are areas for improvement.`;
    const content = `次の英文を${english}(${japanese})の使い方の正確さの観点から、日本語でレビューしてください。ユーザーの英語レベルは'${levelKeyword}'と示されています。文: '${userSentence}'。単語の使い方に関するフィードバックを提供し、改善の余地がある場合は英語の模範文章を提案してください。`;

    // OpenAIのAPIを呼び出し
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: 'assistant', content }],
      temperature: 0.1,
      max_tokens: 300,
    });

    const reviewByAI = response.choices[0].message.content;
    return reviewByAI;

  } catch (error) {
    console.error('generateReviewByAI error:', error);
    throw error; // エラーを上位の関数に伝播させます
  }
}


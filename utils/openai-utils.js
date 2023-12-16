import OpenAI from "openai";
import { getKanjiFromBirthday } from "./utils";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export async function generateExampleSentences(english, japanese, userProfile, birthday) {
  try{

    let content = userProfile ? 
      `${english} (${japanese}) という英単語を使った例文を1つ作ってください。プロフィールを参考に私が使う例文(英語)とその例文の日本語訳も書いてください\n\n私のプロフィール\n${userProfile}\n最後にこの英単語の類語をいくつか教えてください` :
      `${english} (${japanese}) という英単語を使った例文を1つ作ってください。例文(英語)とその例文の日本語訳も書いてください\n\n最後にこの英単語の類語をいくつか教えてください` 
    
    // const kanjiArray = getKanjiFromBirthday(birthday)
    // if (kanjiArray.length > 0) {
    //   const kanjiString = kanjiArray.join(', ');
    //   content += `\n\n出力する日本語はひがらとカタカナなだけ使ってください。但し、下記の漢字は使っても良いです。\n${kanjiString}`;
    // }

    console.log('test', content)


    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      // model: "gpt-4",
      messages: [{role: 'assistant', content }],
      temperature: 0.5,
      max_tokens: 300,
    });

    return response.choices[0].message.content;

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

    // 生成された画像のURLまたはデータを返す
    const ret = image ? image.data[0].url : ''
    return ret; // または適切なプロパティを使用
  } catch (error) {
    console.error('generateImage error:', error);
    throw error;
  }
}

export async function generateWordStory(wordList, length, age, userProfile, genre, characters) {

    const wordsString = wordList.map(word => `${word.english} (${word.japanese})`).join(', ');
    const lengthMapping = { 'Short': 50, 'Medium': 100, 'Long': 200 };
    const maxCharacters = lengthMapping[length];
    const content = `下記の単語を使い、年齢・プロフィールを考慮して、指定された条件に基づいて物語を作ってください。物語は英語で出力し、この年齢が理解できるレベルの言葉・漢字を使って日本語訳も書いてください。\n#プロフィール\n${age}才、${userProfile}\n#単語:${wordsString}\n#条件\n物語の単語数上限：${maxCharacters}字\nジャンル：${genre}\n登場人物：${characters}`;
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: 'assistant', content }],
        temperature: 0.5,
        max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
          
}
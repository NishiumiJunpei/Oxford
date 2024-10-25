import OpenAI from "openai";
import { updateWordList } from "./prisma-utils";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function generateJapanese(english) {
  try{
    const content = `あなたは英語教師です。この英単語の日本語の意味を単語で教えてください。
    複数の意味があるときは最大2つまでカンマで区切って複数教えて。回答には日本語の意味以外は含めないでください。 
    ${english}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', //"gpt-4o", 
      messages: [{role: 'assistant', content }],
      temperature: 0.8,
      max_tokens: 100,
    });

    const res = response.choices[0].message.content

    return res;

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export async function generateExampleSentences(english, japanese) {
  try{
    const content = `Given the English word '${english}' (${japanese}), create one example sentence using this word. Then provide a plain text translation of this sentence in Japanese and a list of up to three English synonyms for the word. Format your response as a JSON object with keys 'e' for the English sentence, 'j' for the Japanese translation, and 's' for the list of English synonyms. Do not include labels such as 'Example' or 'Translation', and explicitly mark the list as synonyms.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", //"gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
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

export async function generateUsage(wordListId, english){

  const content = `Please create up to three different situation where the phrase '${english}' is used. 
  For each situation, provide an example sentence in English along with its Japanese translation. Write the situation in Japanese, the example sentences in English, and the Japanese translations of these sentences in Japanese. 
  Write "〜の場面" or "〜する時" in the "situation".
  Return the output in the following JSON format:
  {
  situations: [
  {
  situation: [Japanese description of the situation],
  exampleE: [Example sentence in English],
  exampleJ: [Japanese translation of the example sentence]
  },
  ...
  ]
  }`

  const response = await openai.chat.completions.create({
    model: "gpt-4o", //"gpt-4-0125-preview", 
    messages: [{role: 'assistant', content }],
    temperature: 0.2,
    response_format: { "type": "json_object" },

  });

  const usageJsonFormat = JSON.parse(response.choices[0].message.content);    
  const usage = usageJsonFormat.situations

  // レスポンスが期待するフォーマットかどうかをチェックする関数
  const isValidResponse = (response) => {
    if (!Array.isArray(response)) return false;
    return response.every(item => 
      item.hasOwnProperty('situation') &&
      item.hasOwnProperty('exampleE') &&
      item.hasOwnProperty('exampleJ')
    );
  }

  if (isValidResponse(usage)) {
    // JSON形式の文字列に変換してデータベースに格納
    const usageString = JSON.stringify(usage);

    await updateWordList(wordListId, { usage: usageString })
    return usageString

  } else {
    console.error(`Invalid response format for word ${english}`);
    return ''
  }
}


export async function generateExplanationScript(english) {
  try{
    const content = `${english}という英単語を楽しく解説する日本語のスクリプトを作ってください。「今日は」や「今回は」などではじめない、発音については言及しない、ですます調で、最大300字程度でスクリプトだけ回答して。`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', //"gpt-4o", 
      messages: [{role: 'assistant', content }],
      temperature: 0.8,
    });

    const res = response.choices[0].message.content

    return res;

  } catch (error) {
    console.error('generateExampleSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}


// 画像を生成する関数
export async function generateAudio(input) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: input,
    });
  
    return mp3; 
  } catch (error) {
    console.error('generateAudio error:', error);
  }
}



export async function generateWordStory(wordList, length, genre, characters, levelKeyword, user) {

    // const wordsString = wordList.map(word => `${word.english} (${word.japanese})`).join(', ');
    const wordsString = wordList.map(word => `${word.english}`).join(', ');
    const lengthMapping = { 'Short': 100, 'Medium': 500, 'Long': 1000 };
    const maxCharacters = lengthMapping[length];

    // const content = `指定された単語を使用して、与えられた条件に基づき英語の物語を作成します。物語は、特に${genre}ジャンルに沿った内容でお願いします。各部分の日本語訳も含めてください。英語の文が2つ続いたら、その後に両方の日本語訳を挿入してください。物語の難易度は${levelKeyword}のレベルにしてください。
    // #使用する単語: ${wordsString}    
    // #物語の単語数上限: ${maxCharacters}字
    // #ジャンル: ${genre}
    // #登場人物: ${characters}`;

    // const { profileKeyword, interestKeyword } = user;
    // const keywords = [...profileKeyword.split(',').map(k => k.trim()), ...interestKeyword.split(',').map(k => k.trim()), genre];    
    // const scene = selectRandomKeywords(keywords);

    const scene = genre

    const content = 
    `You are genious to create story using given words.
    First select one scene randomly relevant to "${scene}".
    Then create an English story related to the scene. using the specified words below. Create Japanese translation which is very natual for Japanese.
    Adjust the story's difficulty level to match the specified level (${levelKeyword}).
    # Words to use: ${wordsString}
    # Maximum character count for the story: ${maxCharacters}
    # Output format
    Japanese Story
    English Story
    # Remark for output format
    Japanese Story:
    After the Japanese phrase for the specified English word, insert the specified English word in the form (*XXXX*). For example, if the word "cure" is specified, the output should be like this:
    彼は問題の治療法(*cure*)を見つけました。    
    English Story:
    After the specified English word, insert its Japanese translation in the form (*YYYY*). For example, if the word "cure" is specified, the output should be like this:
    He found the cure(*治療法*) of the problem.
    `;

  
    const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview", // gpt-4, gpt-3.5-turbo-1106
        messages: [{ role: 'assistant', content }],
        temperature: 0.2,
        // max_tokens: 1000,
        stream: true,
      });
    
    return response
    // return response.choices[0].message.content;
          
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
      model: "gpt-4-0125-preview", // gpt-4, gpt-3.5-turbo-1106
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
      model: "gpt-4-0125-preview", // gpt-4, gpt-3.5-turbo-1106
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



function selectRandomKeywords(keywords) {

  // const count = Math.floor(Math.random() * 2) + 1;  // ランダムに1か2を選択
  const count  = 1
  const selectedKeywords = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * keywords.length);
    // 選ばれたキーワードが既に配列に含まれていないかチェック
    if (!selectedKeywords.includes(keywords[randomIndex])) {
      selectedKeywords.push(keywords[randomIndex]);
    } else {
      // 既に含まれている場合は、異なるキーワードを選択する
      i--; // ループカウンターをデクリメントして再選択
    }
  }

  // 選ばれたキーワードをカンマ区切りの文字列に変換
  return selectedKeywords.join(',');
}


export async function generateQuestionJE(english, japanese, user, levelKeyword) {
  try{
    const { profileKeyword, interestKeyword } = user;
    const keywords = [...profileKeyword.split(',').map(k => k.trim()), ...interestKeyword.split(',').map(k => k.trim())];
    
    const randomKeywords = selectRandomKeywords(keywords);


    // const content = `
    // Create one example sentence using the word, ${english}(${japanese}), in English that a person who is interested on ${randomKeywords} might use.
    // ${english} is required to use in the sentence.
    // Then, create a Japanese translation of that sentence. 
    // Provide just Japanese sentence, not include English sentence.
    // `;

    const content = `
    First select one scene randomly relevant to "${randomKeywords}"
    Then create one example sentence using the word, ${english}(${japanese}) used in the scene.
    ${english} is required to use in the sentence.
    Then, create a Japanese translation of that sentence. 
    Provide just Japanese sentence, not include English sentence.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-0125-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      stream: true,
      temperature: 1,

    });

    return response

  } catch (error) {
    console.error('generateQuestionJE error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export async function generateAnswerJE(english, japanese, questionJE, levelKeyword) {
  try{
    const content = `
    Please translate the following sentences into English. Please be sure to use the English word "${english}". 
    Also, please translate using English words that a person at the level of EIKEN Level 1 would understand.
    ${questionJE}
    Provide just translated English sentence.
    `;
        
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      stream: true,
      temperature: 0.2,

    });

    return response

  } catch (error) {
    console.error('generateAnswerJE error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}
export async function generateReviewScoreJE(english, japanese, questionJE, answerJE, userAnswerJE, levelKeyword) {
  try{

    const content = `Review the English translation of a Japanese question to assess its appropriateness and accuracy based on the provided level keyword. 
    Question in Japanese: "${questionJE}"
    English Translation (User's Answer): "${userAnswerJE}"
    Word required to be included: "${english}"
    Level Keyword: "${levelKeyword}"
    Provide a score between 1 and 4, where 1 is "Not at all appropriate", 2 is "Slightly inappropriate", 3 is "Appropriate", and 4 is "Very appropriate".
    Just provide the score number from 1 to 4.
    `;
    

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      temperature: 0.2,
    });

    return response.choices[0].message.content;



  } catch (error) {
    console.error('generateReviewScoreCommentJE error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}


export async function generateReviewCommentJE(english, japanese, questionJE, answerJE, userAnswerJE, levelKeyword) {
  try{

    const content = `Review the English translation of a Japanese question to assess its appropriateness and accuracy based on the provided level keyword. 
    Question in Japanese: "${questionJE}"
    English Translation (User's Answer): "${userAnswerJE}"
    Word required to be included: "${english}"
    Level Keyword: "${levelKeyword}"
    Provide comments in Japanese on the translation quality and how it can be improved. Model Answer in English: "${answerJE}".
    `;
    

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      stream: true,
      temperature: 0.2,
    });

    return response



  } catch (error) {
    console.error('generateReviewScoreCommentJE error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}



export async function generateSceneSentences(movieTitle, title, description, engLevel) {
  try{

    const content = `
    あなたは英語圏のあらゆる分野に精通した知識人で、人々の会話やプレゼンなどverval communicationに誰よりも詳しいです。
    下記のシーンについて、具体的かつリアリティのある英語の会話またはプレゼン・アナウンスを作成してください。各会話やプレゼンは、以下の4つの項目を含むオブジェクトで構成されます。固有名詞は架空のものをあてはめてください。
    利用する英語は${engLevel}のレベルにしてください。
    内容は実際にありそうなリアルなものにしてください。
    内容は少し込み入ったものにし、最低8つの発言や会話があるようにしてください。
    登場するスピーカは最大３名にしてください。ただし、アナウンス・発表のときは１名にしてください。
    回答は下記4つの項目を含むオブジェクトの配列で、JSON形式にしてください。その他のコメントは不要です。
    "speakerName": スピーカの名前（欧米人）
    "speakerGender": male or female
    "sentenceE": 英語の文章
    "sentenceJ": 日本語訳
    ＃シーン
    ${movieTitle} - ${title}
    ${description}
    #アウトプットフォーマット
    {
      scene:[
        {speakerName: XXXX, ...},
        {},
        ...
      ]
    }
    `;
    

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      response_format: { "type": "json_object" },
      temperature: 0.2,
    });

    const responseJSON  = JSON.parse(response.choices[0].message.content)

    return responseJSON.scene;



  } catch (error) {
    console.error('generateSceneSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export async function generatePhraseToLearnFromScene(sceneSentences, engLevel) {
  try{

    const content = `
    あなたは日本一人気がある英語を教える先生です。
    下記のJSON形式のインプットからsentenceEを抽出して、各sentenceEについて、相対的に難しいフレーズ(名詞だけではなく動詞や副詞も含む)を選んで解説文を作ってください。
    ${engLevel}のレベルの人向けに解説する英語フレーズを選んでください。
    回答はアウトプットフォーマットの通りJSON形式にしてください。
    phraseEは解説対象の英単語、またはフレーズ
    phraseJはphraseJの日本語訳
    explanationは解説文（日本語のみで、"必ず"英単語は含めないでください）
    indexには、解説文を抽出したインプットの配列の要素番号を入れてください。
    
    ＃インプット
    ${sceneSentences}
    
    
    ＃アウトプットフォーマット
    {
      phrases:
      [
        {""phraseE"": ""XXXX"",
        ""phraseJ"": ""XXXX"",
        ""explanation"": ""XXXX"",
        ""index"":""X""
        }
        ]
    
    }
    `;
    

    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content }],
      response_format: { "type": "json_object" },
      temperature: 0.5,
    });

    const responseJSON = JSON.parse(response.choices[0].message.content)
    
    return responseJSON.phrases;

  } catch (error) {
    console.error('generatePhraseToLearnFromScene error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}


export async function generatePhraseSentences(conditionData, numSentence) {
  try{
    const {category1, category2, category2_desc, engLevel, requiredExplanation = '1'} = conditionData

    const content1 = `
    あなたは日本一人気がある英語教師です。
    下記のテーマにおいて、ネイティブがよく使う英語フレーズを、${engLevel}のレベルで、${numSentence}個作ってください。
    回答はアウトプットフォーマットの通りJSON形式の配列にしてください。
    必ず${numSentence}個の作成して、${numSentence}個の要素数の配列になるようにしてください。
    
    ＃テーマ
    ${category1}
    ${category2}
    ${category2_desc}
    
    ＃アウトプットフォーマット
    {
      phrases:
      ["XXXXX", "XXXXX", "XXXXX", ...]    
    }
    `;
  
    console.log('gpt api called - 1', content1)
    const response1 = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", //"gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content: content1 }],
      response_format: { "type": "json_object" },
      temperature: 0.2,
    });

    console.log('gpt api result1: ', response1.choices[0].message.content)
    const responseJSON1 = JSON.parse(response1.choices[0].message.content)




    const sentenceEs = {
      phrases: responseJSON1.phrases.map(phrase => {
        // requiredExplanationが1なら、explanationフィールドを追加
        const phraseObject = {
          sentenceE: phrase,
          sentenceJ: ''
        };
        
        if (requiredExplanation === '1') {
          phraseObject.explanation = ''; // explanationフィールドを追加して、空文字列を設定
        }
        
        return phraseObject;
      })
    };

    const sentencesString = JSON.stringify(sentenceEs, null, 2)


    const content2 = requiredExplanation == 1 ? 
    `下記の英文JSONデータの各要素について、
    sentenceJに、sentenceEの自然な日本語訳を入れてください。
    explanationに、sentenceEで使われているフレーズを1つ選んで日本語の解説文を入れてください。
    アウトプットは構造を変えずに、JSON形式にしてください。

    #英文JSONデータ
    ${sentencesString}
    ` :
    `下記の英文JSONデータの各要素のsentenceJに、sentenceEの自然な日本語訳を埋めてください。
    アウトプットは構造を変えずに、JSON形式にしてください。

    #英文JSONデータ
    ${sentencesString}
    `

    

    console.log('gpt api called - 2', content2)
    const response2 = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", //"gpt-4-0125-preview", //"gpt-3.5-turbo-1106", // "gpt-4-1106-preview",gpt-4, gpt-3.5-turbo-1106
      messages: [{role: 'assistant', content: content2 }],
      response_format: { "type": "json_object" },
      temperature: 0.2,
    });

    console.log('gpt api result2: ', response2.choices[0].message.content)
    const responseJSON2 = JSON.parse(response2.choices[0].message.content)
    
    return responseJSON2.phrases;

  } catch (error) {
    console.error('generatePhraseSentences error:', error);
    throw error; // このエラーを上位の関数に伝播させます
  }
}

export async function generateSpeakingTopicData(category, topic) {
  try {
    // Task 1: Generate the knowledge base
    const generateKnowledgeBase = async () => {
      const content = `
        Create a knowledge framework for the given topic: "${topic}"
        Structure the output using headings (###) and bold text (**).

        Define and Contextualize
        Define the topic (e.g., Japan's role in global poverty) and explain its historical, social, or economic context. Why is this topic relevant today?

        Identify Key Issues
        Highlight 3+ key issues related to the topic. Explain how each issue arises, who it affects, and provide specific examples or data.

        Analyze Causes and Effects
        Explore the root causes behind each issue and explain how they are interconnected. Discuss the long-term consequences.

        Consider Multiple Perspectives
        Analyze the topic from different viewpoints (government, business, individuals, international organizations, environment, etc.).

        Propose Solutions
        Suggest solutions or policies addressing the key issues, and explain how they can be effective. Mention lessons from past successes or failures.

        Discuss Future Outlook
        Predict how the topic will evolve in the future. Discuss upcoming challenges, opportunities, and the impact of new technologies or ideas.

        Summarize and Conclude
        Provide a concise summary, highlighting the topic’s importance, long-term impact, and key actions or takeaways.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        temperature: 0.2,
      });

      return response.choices[0].message.content;
    };

    // Task 2: Generate the presentation script
    const generatePresentation = async () => {
      const content = `
          Create a compelling presentation script addressing the given social issue in English. Topic: "${topic}"

          Output the response in **Markdown** format. Use elements such as '**bold**', '*italic*', and lists '-'. You can use '###' for subheadings (H3), but avoid using '#' or '##' for H1 or H2.

          ### Introduction:
          Briefly introduce the social issue and explain its importance. Use data, statistics, or a real-life example to grab attention.

          ### Key Points Summary:
          Clearly state the main solution or approach to addressing the problem.

          ### Key Point 1 - [Insert a concise phrase summarizing the key point]:
          Explain one major cause or impact of the issue, supported by data or examples.

          ### Key Point 2 - [Insert a concise phrase summarizing the key point]:
          Provide a second cause or impact, backed with evidence or examples.

          ### Key Point 3 - [Insert a concise phrase summarizing the key point]:
          Discuss a third cause or impact, including supporting data or examples.

          ### Conclusion:
          Summarize the key points and present a strong call to action for the audience.

      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        temperature: 0.3,
      });

      return response.choices[0].message.content;
    };

    // Task 3: Generate the conversation
    const generateConversation = async () => {
      const content = `
        Generate a dialogue between two individuals discussing "${topic}". One person should take a more critical stance, questioning the current state or approach to the issue, while the other defends it but acknowledges areas for improvement. Both should offer creative suggestions for how to address the challenges or enhance the current strategy. The conversation should feel natural, with moments of agreement, disagreement, and thoughtful reflection. Include a mix of factual information and personal opinion, avoiding overly formal language.

        Assign random Western names to "Person A" and "Person B."

        output format (all English)
        ### [Random Name for Person A]
        XXXXX
        ### [Random Name for Person B]
        XXXXX

      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    };

    // 並列で各タスクを実行
    const [knowledgeBase, presentation, conversation] = await Promise.all([
      generateKnowledgeBase(),
      generatePresentation(),
      generateConversation(),
    ]);

    // 3つの結果を持つオブジェクトを返す
    return {
      knowledgeBase,
      presentation,
      conversation,
    };

  } catch (error) {
    console.error('generateSpeakingTopicData error:', error);
    throw error; // エラーを上位に伝播
  }
}

export async function generateQuestionData(topic) {
  try {
    const exam = "EIKEN Grade 1 exam"

    const content = `
    Theme: "${topic}"
    Instructions:
    Please generate a list of question categories and corresponding questions based on the provided theme. Each category should include no more than three key questions. The purpose is to ensure comprehensive coverage of the topic, with a focus on helping learners understand the most critical aspects. The questions should be concise, clear, and address important points related to the theme. Additionally, ensure the questions are relevant to ${exam} and help students prepare for the types of discussions and essays commonly encountered in it.

    Please tailor the content and examples specifically for Japanese learners, taking into account common challenges and cultural contexts.
    All responses must be in English.

    Output format: Provide the output in json format with the following structure:

    {
      "categories": [
        {
          "title": "Category 1 Title",
          "questions": [
            "Question 1",
            "Question 2",
            "Question 3"
          ]
        },
        {
          "title": "Category 2 Title",
          "questions": [
            "Question 1",
            "Question 2",
            "Question 3"
          ]
        },
        {
          "title": "Category 3 Title",
          "questions": [
            "Question 1",
            "Question 2",
            "Question 3"
          ]
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // GPT-4を利用
      messages: [{role: 'user', content }],
      temperature: 0.2,
      response_format: { "type": "json_object" },
      
    });

    const generatedData = response.choices[0].message.content;
    return JSON.parse(generatedData); // JSON形式にパースして返す

  } catch (error) {
    console.error('Error generating question data:', error);
    throw error;
  }
}


export async function generateAnswerData(question) {
  try {
    // 1. 質問に基づいて回答を生成（simpleとdetailedの両方を含む）
    const content = `
    **Question**: "${question}"

    **Instructions**:
    1. **Simple Version**  
       Please provide a concise answer to the question in no more than 200 words. Focus on clearly stating the key points.

    2. **Detailed Version (Structured)**  
       Please provide a detailed and structured answer to the question in markdown format using the following elements:
       - **Introduction**: Briefly explain the background and importance of the question.
       - **Main Points**: Break down the answer into 3 key points. For each key point, use the following structure:
         1. **First Key Point Title**
            - Provide an explanation for the first key point with 1-2 bullet points.
         2. **Second Key Point Title**
            - Provide an explanation for the second key point with 1-2 bullet points.
         3. **Third Key Point Title**
            - Provide an explanation for the third key point with 1-2 bullet points.
       - **Conclusion**: Summarize the answer and mention future relevance or impact.

    **Output Format**: Use markdown format with '###' for headers, '**' for bold, and '-' for bullet points. Follow this structure:

    ### Simple Version:
    [Provide a simple answer here]

    ### Detailed Version (Structured):
    **Introduction**: [Provide a brief introduction here]

    ### Main Points:
    1. **First Key Point Title**
       - [Explanation for the first key point]
       - [Additional supporting detail if needed]

    2. **Second Key Point Title**
       - [Explanation for the second key point]
       - [Additional supporting detail if needed]

    3. **Third Key Point Title**
       - [Explanation for the third key point]
       - [Additional supporting detail if needed]

    **Conclusion**: [Summarize the answer and mention future relevance or implications]
    `;

    // OpenAI APIにリクエストを送信し、simpleとdetailedを含む回答を取得
    const initialResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{role: 'assistant', content }],
      temperature: 0.3,
    });

    const generatedText = initialResponse.choices[0].message.content;

    // 2. Simple Versionの抽出
    const simpleExtractPrompt = `
    以下のテキストから「### Simple Version:」のセクションのみを抽出してください。ヘッダー「### Simple Version:」は含めないでください。

    ${generatedText}
    `;

    const simpleResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{role: 'assistant', content: simpleExtractPrompt }],
      temperature: 0.3,
    });
    const simpleAnswer = simpleResponse.choices[0].message.content;

    // 3. Detailed Versionの抽出
    const detailedExtractPrompt = `
    以下のテキストから「### Detailed Version (Structured):」のセクションのみを抽出してください。ヘッダー「### Detailed Version (Structured):」は含めないでください。

    ${generatedText}
    `;

      const detailedResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{role: 'assistant', content: detailedExtractPrompt }],
      temperature: 0.3,
    });
    const detailedAnswer = detailedResponse.choices[0].message.content;

    // simpleとdetailedをオブジェクトとして返す
    return {
      simpleAnswer: simpleAnswer,
      detailedAnswer: detailedAnswer,
    };

  } catch (error) {
    console.error('Error generating answer data:', error);
    throw error;
  }
}

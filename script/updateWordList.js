const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function updateWordList() {
    const wordLists = await prisma.wordList.findMany({
        where: {
          exampleSentence: {
            not: null,
          },
          exampleSentenceE: null,
        },
      });
        
    for (let i = 0; i < wordLists.length; i++) {
      const wordList = wordLists[i];
  
      try {
        // OpenAI APIを使用してデータを解析
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            // model: "gpt-4",
            messages: [{
              role: 'user',
              content: `Please analyze this sentence and provide the English example as a plain text sentence, the Japanese example as a plain text sentence, and a list of synonyms. Do not provide additional explanations or details. Format your response as a JSON object with keys 'e' for the English sentence, 'j' for the Japanese sentence, and 's' for the list of synonyms. Sentence: "${wordList.exampleSentence}"`,
            }],
            response_format: { "type": "json_object" },
            temperature: 1,
            max_tokens: 300,
          });
          
        const cleanedContent = response.choices[0].message.content.replace(/\n/g, '');
        const jsonResponse = JSON.parse(cleanedContent);

        // 必要な値を抽出
        let { e: exampleSentenceE, j: exampleSentenceJ, s: rawSynonyms } = jsonResponse;
        exampleSentenceE = exampleSentenceE.replace(/[()（）]/g, '');
        exampleSentenceJ = exampleSentenceJ.replace(/[()（）]/g, '');
        const synonyms = Array.isArray(rawSynonyms) ? rawSynonyms.join(', ') : rawSynonyms;


        // console.log('test', wordList.id)
        // console.log('analyzed data:', jsonResponse)
        // console.log('english:', exampleSentenceE)
        // console.log('japanese:', exampleSentenceJ)
        // console.log('synonyms:', synonyms)

        // Prismaを使用してデータベースを更新
        await prisma.wordList.update({
          where: { id: wordList.id },
          data: { exampleSentenceE, exampleSentenceJ, synonyms: synonyms },
        });

        const logMessage = `ID: ${wordList.id}, English: ${wordList.english}\n-- ${exampleSentenceE}\n-- ${exampleSentenceJ}\n-- ${synonyms}\n\n`;
        fs.appendFileSync(path.join(__dirname, 'success.txt'), logMessage);
      
      } catch (error) {
        // エラーをファイルに記録
        const errorFilePath = path.join(__dirname, '/error.txt');

        // ファイルが存在しない場合は作成
        if (!fs.existsSync(errorFilePath)) {
          fs.writeFileSync(errorFilePath, '');
        }
  
        // エラーをファイルに記録
        fs.appendFileSync(errorFilePath, `Error processing record with ID ${wordList.id}.${wordList.english}: ${error}\n`);
        
        console.error(`Error processing record with ID ${wordList.id}.${wordList.english}:`, error);
        // continue; // 次の単語の処理に移行
      }
  
      // 進行状況の表示
      console.log(`Processed ${i + 1} out of ${wordLists.length} words. - ${wordList.id}.${wordList.english}`);
    }
  }
  
  updateWordList();
  
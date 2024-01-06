const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


async function createExampleSentenceAndSynonyms() {
    const wordLists = await prisma.wordList.findMany({
        where: {
          exampleSentenceE: null,
        },
      });
        
    for (let i = 0; i < wordLists.length; i++) {
      const wordList = wordLists[i];
  
      try {
        // OpenAI APIを使用してデータを解析
        const english = wordList.english
        const japanese = wordList.japanese
        
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
    

        console.log('test', wordList.id)
        console.log('analyzed data:', jsonResponse)
        console.log('english:', exampleSentenceE)
        console.log('japanese:', exampleSentenceJ)
        console.log('synonyms:', synonyms)
        break

        // Prismaを使用してデータベースを更新
        // await prisma.wordList.update({
        //   where: { id: wordList.id },
        //   data: { exampleSentenceE, exampleSentenceJ, synonyms: synonyms },
        // });

        const logMessage = `ID: ${wordList.id}, English: ${wordList.english}\n-- ${exampleSentenceE}\n-- ${exampleSentenceJ}\n-- ${synonyms}\n\n`;
        fs.appendFileSync(path.join(__dirname, 'success.txt'), logMessage);
      
      } catch (error) {
        console.error(`Error processing record with ID ${wordList.id}.${wordList.english}:`, error);
      }
  
      // 進行状況の表示
      console.log(`Processed ${i + 1} out of ${wordLists.length} words. - ${wordList.id}.${wordList.english}`);
    }
}


createExampleSentenceAndSynonyms()
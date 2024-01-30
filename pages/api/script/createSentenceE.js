import { createExampleSentenceAndImageByGPT } from '@/utils/wordList-utils';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


export default async function handler(req, res) {
  try {
    const wordLists = await prisma.wordList.findMany({
      where: {
        exampleSentenceE: '',
      },
    });


    for (let i = 0; i < wordLists.length; i++) {
      const wordList = wordLists[i];

      if (!wordList.exampleSentenceE){
        // await createExampleSentenceAndImageByGPT(wordList.id)
        console.log(`Completed: ${i} / ${wordLists.length} --- ${wordList.id}.${wordList.english}`)  
      }

    }


    res.status(200).json('done');
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

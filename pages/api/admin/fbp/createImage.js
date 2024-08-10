// Prismaクライアントのインポート
import { PrismaClient } from '@prisma/client';
import { createImage } from '@/utils/book-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        // Return 405 Method Not Allowed if the request is not POST
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId;
    if (userId != 1 ) return res.status(403).json({ message: 'Forbidden' });

    const {type, fileId, sectionsIndex, wordsExplanationIndex, englishWord, prompt} = req.body;
    
    try {

        // JSONファイルのパスを構築
        const filePath = path.join(process.cwd(), 'data', 'firstBookProject', 'storyContents', `${fileId}.json`);

        // JSONデータを読み込み
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileData);

        // typeに応じてJSONデータを更新
        if (type === 'TITLE') {
            if (!jsonData.content.titleImageFilename){
                const imageFilename = await createImage(type, fileId, prompt, '');
                jsonData.content.titleImageFilename = imageFilename;
    
                console.log('Title imageFilename', imageFilename);
    
            }

            // 全てのsectionsを対象に処理を行う
            for (const section of jsonData.content.sections) {
                const wordsExplanation = section.wordsExplanation;

                for (let i = 0; i < wordsExplanation.length; i++) {
                    if (!wordsExplanation[i].wordImageFilename) {
                        const prompt = wordsExplanation[i].promptForImageGeneration;
                        const englishWord = wordsExplanation[i].englishWord;
                        const imageFilename = await createImage('WORD', fileId, prompt, englishWord);
                        wordsExplanation[i].wordImageFilename = imageFilename;
                    }
                }
            }

        } else if (type === 'WORD' && jsonData.content.sections[sectionsIndex]) {
            const imageFilename = await createImage(type, fileId, prompt, englishWord);
            jsonData.content.sections[sectionsIndex].wordsExplanation[wordsExplanationIndex].wordImageFilename = imageFilename;

            console.log('imageFilename', imageFilename);
    

        } else {
            return res.status(400).json({ message: 'Invalid type or sectionsIndex out of range' });
        }

        // 更新されたJSONデータをファイルに書き戻す
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
        console.log('craeteImage is completed. fileId: ', fileId)

        res.status(200).json("done");
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

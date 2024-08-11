import { PrismaClient } from '@prisma/client';
import { createImage } from '@/utils/book-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getGoogleSheetData, writeToGoogleSheet } from '@/utils/googleapi-utils'; // Google Sheets操作関数をインポート

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    const userId = session.userId;
    if (userId != 1) return res.status(403).json({ message: 'Forbidden' });

    const { type, contentId, sectionIndex, wordsExplanationIndex, englishWord, prompt } = req.body;

    try {
        // Google Sheetsの情報
        const spreadsheetId = '1Tokf8NtzTSvgkuV5KCNmTfJWYjXePGOb0QmKA9nXp7w';
        const sheetName = 'storyList';
        const sheetRange = `${sheetName}!A2:D`;  // storyListシートの全データを取得

        // Google Sheetsからデータを取得
        const sheetData = await getGoogleSheetData(spreadsheetId, sheetRange);

        // 対象のcontentIdを持つ行を検索
        const rowIndex = sheetData.findIndex(row => row[1] === contentId);
        if (rowIndex === -1) {
            return res.status(404).json({ message: 'Content ID not found' });
        }
 
        // contentカラム（3列目）のJSONデータを取得
        let jsonData = JSON.parse(sheetData[rowIndex][2]);
 
        // typeに応じてJSONデータを更新
        if (type === 'TITLE') {
            if (!jsonData.content.titleImageFilename) {
                const titleE = jsonData.content.titleE
                console.log('image creation started - imageFilename', type, englishWord);
                const imageFilename = await createImage(type, contentId, prompt, '', '', '', titleE);
                console.log('image creation is finished - imageFilename', imageFilename);
                jsonData.content.titleImageFilename = imageFilename;

            }

            for (const section of jsonData.content.sections) {
                const wordsExplanation = section.wordsExplanation;

                for (let i = 0; i < wordsExplanation.length; i++) {
                    if (!wordsExplanation[i].wordImageFilename) {
                        const prompt = wordsExplanation[i].promptForImageGeneration;
                        const englishWord = wordsExplanation[i].englishWord;
                        console.log('image creation started - imageFilename', type, englishWord);
                        const imageFilename = await createImage('WORD', contentId, prompt, englishWord, sectionIndex, wordsExplanationIndex, '');
                        console.log('image creation is finished - imageFilename', imageFilename);
                        wordsExplanation[i].wordImageFilename = imageFilename;
                    }
                }
            }

        } else if (type === 'WORD' && jsonData.content.sections[sectionIndex]) {
            console.log('image creation started - imageFilename', type, englishWord);
            const imageFilename = await createImage(type, contentId, prompt, englishWord, sectionIndex, wordsExplanationIndex, '');
            console.log('image creation is finished - imageFilename', imageFilename);

            jsonData.content.sections[sectionIndex].wordsExplanation[wordsExplanationIndex].wordImageFilename = imageFilename;

        } else {
            return res.status(400).json({ message: 'Invalid type or sectionIndex out of range' });
        }

        // 更新されたJSONデータをGoogle Sheetsに書き戻す
        const updateRange = `${sheetName}!C${rowIndex + 2}`; // rowIndexは0から始まるので2を足す
        await writeToGoogleSheet(spreadsheetId, updateRange, [[JSON.stringify(jsonData)]], 'UPDATE');
        console.log('createImage is completed. contentId: ', contentId);

        res.status(200).json("done");
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

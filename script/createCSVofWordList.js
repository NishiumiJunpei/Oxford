const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function generateCSV() {
    // Fetching data from the database
    const wordLists = await prisma.wordList.findMany({
        include: {
            blocks: {
                include: {
                    block: {
                        include: {
                            theme: true
                        }
                    }
                }
            }
        }
    });

    // Formatting data for CSV
    let csvContent = "wordListId,english,japanese,blockId,blockName,themeId,themeName\n";
    wordLists.forEach(wordList => {
        wordList.blocks.forEach(wlBlock => {
            const block = wlBlock.block;
            const theme = block.theme;
            csvContent += `${wordList.id},${wordList.english},${wordList.japanese},${block.id},${block.name},${theme.id},${theme.name}\n`;
        });
    });

    // Writing CSV to a file
    fs.writeFileSync('./wordLists.csv', csvContent);
}

generateCSV()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    });

const csv = require('csv-parser');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const results = [];

  fs.createReadStream('./script/eiken-data-4.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // CSVから読み込んだデータを整形
      const formattedData = results.map(row => ({
        theme: row.theme,
        block: parseInt(row.block),
        english: row.english,
        japanese: row.japanese,
        // 他のフィールド...
      }));

      // データをデータベースにバルクインサート
      // await prisma.wordListByTheme.createMany({
      //   data: formattedData,
      //   skipDuplicates: true, // 重複をスキップ
      // });

      console.log('データのインポートが完了しました');
    });
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


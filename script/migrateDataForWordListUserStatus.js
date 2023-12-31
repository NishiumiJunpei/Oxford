const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function updateWordListUserStatus() {
    try {
      const records = await prisma.wordListUserStatus.findMany();
  
      // 更新をバッチ処理するための関数
      async function processBatch(batch) {
        await Promise.all(
          batch.map(record =>
            prisma.wordListUserStatus.update({
              where: { id: record.id },
              data: {
                memorizeStatusEJ: record.memorizeStatus,
                lastMemorizedDateEJ: record.lastMemorizedDate,
              },
            })
          )
        );
      }
  
      // バッチサイズを設定（例：100）
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await processBatch(batch);
      }
  
      console.log('更新完了');
    } catch (error) {
      console.error('更新中にエラーが発生しました:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  updateWordListUserStatus();
  
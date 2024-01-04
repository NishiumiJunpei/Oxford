const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDisplayOrder() {
  try {
    // すべてのBlockレコードを取得
    const blocks = await prisma.block.findMany();

    // 各Blockレコードに対して処理
    for (const block of blocks) {
      const nameAsNumber = parseInt(block.name, 10);

      // nameが数値に変換可能かチェック
      if (!isNaN(nameAsNumber)) {
        // displayOrderを更新
        await prisma.block.update({
          where: { id: block.id },
          data: { displayOrder: nameAsNumber },
        });
      }
    }

    console.log('Display order updated successfully.');
  } catch (error) {
    console.error('Error updating display order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDisplayOrder();

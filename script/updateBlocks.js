const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBlocks() {
  try {
    // themeIdが3のすべてのBlockを取得
    const blocks = await prisma.block.findMany({
      where: {
        themeId: 3
      }
    });

    // 各Blockに対して更新処理を実行
    await Promise.all(blocks.map(async (block) => {
      const nameAsNumber = parseInt(block.name, 10);
      if (!isNaN(nameAsNumber)) {
        const updatedName = (nameAsNumber - 60).toString();
        await prisma.block.update({
          where: {
            id: block.id
          },
          data: {
            name: updatedName
          }
        });
      }
    }));

    console.log('更新が完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

updateBlocks();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userId = 3
const name = 'Rika'
const email = 'rika.nishiumi@gmail.com'



async function deleteUser(userId, name, email) {
    try {
      // まずユーザーを検索
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          name: name,
          email: email,
        },
      });
  
      // ユーザーが見つかった場合のみ削除
      if (user) {
        await prisma.user.delete({
          where: { id: userId },
        });
        console.log(`User with id ${userId}, name ${name}, and email ${email} has been deleted.`);
      } else {
        console.log('No user found with the specified id, name, and email.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
  
deleteUser(userId, name, email).catch(e => {
throw e
}).finally(async () => {
await prisma.$disconnect()
});
  
  
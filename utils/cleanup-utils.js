// utils/cleanup-utils.js
import prisma from '../prisma/prisma'; 

export async function deleteExpiredTokens() {
  const now = new Date();
  try {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: now, // "lt"は "less than"（未満）を意味します
        },
      },
    });
    console.log(`Deleted ${result.count} expired tokens.`);
  } catch (error) {
    console.error('deleteExpiredTokens Error:', error);
  }
}

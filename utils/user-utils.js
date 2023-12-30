import prisma from '../prisma/prisma';  
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

export async function findUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error('ユーザーが見つかりません。');
      }
      return user;
    } catch (error) {
      console.error('findUserByEmail Error:', error);
      throw error;
    }
}

export async function createPasswordResetToken(userId) {
    try {
      // 既存のトークンを削除
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: userId,
        },
      });
  
      // 新しいトークンを生成
      const token = randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // 有効期限を1時間後に設定
  
      // 新しいトークンをデータベースに保存
      await prisma.passwordResetToken.create({
        data: {
          userId: userId,
          token: token,
          expires: expires,
        },
      });
  
      return token;
    } catch (error) {
      console.error('createPasswordResetToken Error:', error);
      throw error;
    }
}
  

export async function updateUserPassword(userId, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      return updatedUser;
    } catch (error) {
      console.error('updateUserPassword Error:', error);
      throw error;
    }
}

export async function findUserByPasswordResetToken(token) {
  return await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function updateUserPasswordById(userId, newPassword) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function deletePasswordResetToken(id) {
  return await prisma.passwordResetToken.delete({
    where: { id },
  });
}

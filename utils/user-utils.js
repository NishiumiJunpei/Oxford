import prisma from '../prisma/prisma';  
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export async function getUserCurrentChallengeThemeId(id) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      currentChallengeThemeId: true,
    },
  });
}


export async function findUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        return null
      }
      return user;
    } catch (error) {
      console.error('findUserByEmail Error:', error);
      throw error;
    }
}

export async function createUser(userData) {
  return prisma.user.create({
    data: userData
  });
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


export async function createSignUpToken(email) {
  // JWTトークンの生成
  const token = jwt.sign(
    { email, timestamp: new Date().getTime() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // 1時間の有効期限
  );

  return token;
}

export function verifySignupToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, email: decoded.email };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, email: null };
  }
}


export async function updateUserProfileKeyword(userId, profileKeyword, action) {
  // ユーザーを検索
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let updatedKeywords = [];
  if (user.profileKeyword) {
    updatedKeywords = user.profileKeyword.split(',');
  }

  if (action === 'UPDATE') {
    // キーワードを追加
    updatedKeywords.push(profileKeyword);
  } else if (action === 'DELETE') {
    // キーワードを削除
    updatedKeywords = updatedKeywords.filter(kw => kw !== profileKeyword);
  }

  // キーワードを更新
  await prisma.user.update({
    where: { id: userId },
    data: { profileKeyword: updatedKeywords.join(',') },
  });
}

export async function updateUserInterestKeyword(userId, interestKeyword, action) {
  // ユーザーを検索
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let updatedKeywords = [];
  if (user.interestKeyword) {
    updatedKeywords = user.interestKeyword.split(',');
  }

  if (action === 'UPDATE') {
    // キーワードを追加
    updatedKeywords.push(interestKeyword);
  } else if (action === 'DELETE') {
    // キーワードを削除
    updatedKeywords = updatedKeywords.filter(kw => kw !== interestKeyword);
  }

  // キーワードを更新
  await prisma.user.update({
    where: { id: userId },
    data: { interestKeyword: updatedKeywords.join(',') },
  });
}


export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: {
      id: 'asc'  // Sort by 'id' in ascending order
    },
    select: {
      id: true,
      name: true,
      email: true,
      birthday: true,
      profile: true,
      profileKeyword: true,
      interestKeyword: true,
      googleId: true,
      currentChallengeThemeId: true,
      currentChallengeTheme: {
        select: {
          id: true,
          name: true
        }
      },
      // Uncomment below if you need to fetch related data
      // UserWordList: {
      //   select: {
      //     id: true
      //   }
      // },
      // WordListUserStatus: {
      //   select: {
      //     id: true
      //   }
      // },
      // WordStoryByGPT: {
      //   select: {
      //     id: true
      //   }
      // }
    }
  });
}

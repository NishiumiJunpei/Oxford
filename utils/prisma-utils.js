// utils/prisma-utils.js
import prisma from '../prisma/prisma';  // Assume prisma.js exports your Prisma client instance

// User related functions
export async function createUser(data) {
  return await prisma.user.create({
    data,
  });
}

export async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}


export async function updateUser(id, data) {
  return await prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id },
  });
}

// UserWordList related functions
export async function createUserWordList(data) {
  return await prisma.userWordList.create({
    data,
  });
}

export async function getUserWordListById(id) {
  return await prisma.userWordList.findUnique({
    where: { id },
  });
}

export async function updateUserWordList(id, data) {
  return await prisma.userWordList.update({
    where: { id },
    data,
  });
}

export async function deleteUserWordList(id) {
  return await prisma.userWordList.delete({
    where: { id },
  });
}


// WordListByTheme related functions
export async function createWordListByTheme(data) {
  return await prisma.wordListByTheme.create({
    data,
  });
}

export async function getWordListByThemeById(id) {
  return await prisma.wordListByTheme.findUnique({
    where: { id },
  });
}


export async function getWordListByCriteria(criteria) {
  const query = {};

  if (criteria.theme) {
    query.theme = criteria.theme;
  }

  if (criteria.block !== undefined) {
    query.block = criteria.block;
  }

  return await prisma.wordListByTheme.findMany({
    where: query,
  });
}


export async function updateWordListByTheme(id, data) {
  return await prisma.wordListByTheme.update({
    where: { id },
    data,
  });
}

export async function deleteWordListByTheme(id) {
  return await prisma.wordListByTheme.delete({
    where: { id },
  });
}

// UserWordListByThemeStatus related functions
export async function createUserWordListByThemeStatus(data) {
  return await prisma.userWordListByThemeStatus.create({
    data,
  });
}

export async function getUserWordListByThemeStatusById(id) {
  return await prisma.userWordListByThemeStatus.findUnique({
    where: { id },
  });
}

export async function getUserWordStatusByTheme(userId, theme) {
  return await prisma.userWordListByThemeStatus.findMany({
    where: {
      userId: userId,
      wordListByTheme: {
        theme: theme
      }
    },
    include: {
      wordListByTheme: true
    }
  });
}


export async function getUserWordListStatus(userId, wordListByThemeId) {
  const status = await prisma.userWordListByThemeStatus.findUnique({
    where: {
      userId_wordListByThemeId: {
        userId,
        wordListByThemeId
      }
    }
  });
  return status ? status.memorizeStatus : 'UNKNOWN';
}


export async function updateUserWordListByThemeStatus(id, data) {
  return await prisma.userWordListByThemeStatus.update({
    where: { id },
    data,
  });
}

export async function updateUserWordStatus(userId, wordListByThemeId, memorizeStatus) {
  const existingRecord = await prisma.userWordListByThemeStatus.findUnique({
    where: {
      userId_wordListByThemeId: {
        userId,
        wordListByThemeId
      }
    }
  });

  if (existingRecord) {
    // レコードが存在する場合は、numMemorized または numNotMemorized を更新
    const updatedData = {};
    if (memorizeStatus === 'MEMORIZED') {
      updatedData.numMemorized = existingRecord.numMemorized + 1;
    } else if (memorizeStatus === 'NOT_MEMORIZED') {
      updatedData.numNotMemorized = existingRecord.numNotMemorized + 1;
    }
    updatedData.memorizeStatus = memorizeStatus;
    updatedData.lastCheckDate = new Date();

    return await prisma.userWordListByThemeStatus.update({
      where: { id: existingRecord.id },
      data: updatedData,
    });
  } else {
    // レコードが存在しない場合は新しいレコードを作成
    const newData = {
      userId,
      wordListByThemeId,
      memorizeStatus,
      lastCheckDate: new Date(),
      numMemorized: memorizeStatus === 'MEMORIZED' ? 1 : 0,
      numNotMemorized: memorizeStatus === 'NOT_MEMORIZED' ? 1 : 0
    };

    return await prisma.userWordListByThemeStatus.create({
      data: newData,
    });
  }
}

export async function deleteUserWordListByThemeStatus(id) {
  return await prisma.userWordListByThemeStatus.delete({
    where: { id },
  });
}


// utils/prisma-utils.js
import prisma from '../prisma/prisma';  // Assume prisma.js exports your Prisma client instance
import { timeAgo } from './utils';

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

export async function getBlock(blockId) {
  return await prisma.block.findUnique({
    where: { id: parseInt(blockId) }, // ここではモデルのフィールド名を使用
    include: { theme: true } // theme を含める場合
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


export async function getWordListByCriteria(criteria) {
  const query = {};

  if (criteria.blockId) {
    query.blocks = {
      some: {
        blockId: parseInt(criteria.blockId)
      }
    };
  } else if (criteria.themeId) {
    query.blocks = {
        some: { 
          block: {
            themeId: parseInt(criteria.themeId)
          }
      }
    };
  }

  return await prisma.wordList.findMany({
    where: query,
    include: {
      blocks: {
        include: {
          block: true  // Block の詳細を含める
        }
      }
    }
  
  });
}


export async function getWordListUserStatus(userId, themeId) {
  // themeId が指定されている場合のクエリ条件を設定
  const whereClause = themeId 
    ? {
        userId: userId,
        wordList: {
          blocks: {
            some: {
              block: {themeId: parseInt(themeId)}
            }
          }
        }
      } 
    : {
        userId: userId
      };

  // Prisma クエリを使用して WordListUserStatus データを取得
  return await prisma.wordListUserStatus.findMany({
    where: whereClause,
    include: {
      wordList: true  // WordList の詳細を含める
    }
  });
}

export async function getWordListUserStatusByWordListId(userId, wordListId) {
  const statusRecord = await prisma.wordListUserStatus.findUnique({
    where: {
      userId: userId,
      wordListId: wordListId
    }
  });

  if (!statusRecord) {
    return {
      memorizeStatus: 'UNKNOWN',
      exampleSentence: null,
      lastMemorizedTimeAgo: null,
      lastNotMemorizedTimeAgo: null
    };
  }

  return {
    ...statusRecord,
    lastMemorizedTimeAgo: statusRecord.lastMemorizedDate ? timeAgo(statusRecord.lastMemorizedDate) : null,
    lastNotMemorizedTimeAgo: statusRecord.lastNotMemorizedDate ? timeAgo(statusRecord.lastNotMemorizedDate) : null
  };
}

export async function updateUserWordStatus(userId, wordListId, memorizeStatus) {
  const existingRecord = await prisma.wordListUserStatus.findUnique({
    where: {
      userId_wordListId: {
        userId: userId,
        wordListId: wordListId
      }
    }
  });
  
  const currentTime = new Date();

  if (existingRecord) {
    const updatedData = {
      memorizeStatus: memorizeStatus,
      lastCheckDate: currentTime,
    };

    if (memorizeStatus === 'MEMORIZED') {
      updatedData.numMemorized = existingRecord.numMemorized + 1;
      updatedData.lastMemorizedDate = currentTime;
    } else if (memorizeStatus === 'NOT_MEMORIZED') {
      updatedData.numNotMemorized = existingRecord.numNotMemorized + 1;
      updatedData.lastNotMemorizedDate = currentTime;
    }

    return await prisma.wordListUserStatus.update({
      where: { id: existingRecord.id },
      data: updatedData,
    });
  } else {
    const newData = {
      userId,
      wordListId,
      memorizeStatus,
      lastCheckDate: currentTime,
      numMemorized: 0,
      numNotMemorized: 0,
    };

    if (memorizeStatus === 'MEMORIZED') {
      newData.numMemorized = 1;
      newData.lastMemorizedDate = currentTime;
    } else if (memorizeStatus === 'NOT_MEMORIZED') {
      newData.numNotMemorized = 1;
      newData.lastNotMemorizedDate = currentTime;
    }

    return await prisma.wordListUserStatus.create({
      data: newData,
    });
  }
}

export async function saveExampleSentence(userId, wordListId, exampleSentence, imageFilename = '') {
  // Prisma Client を使用して例文を保存
  await prisma.WordListUserStatus.upsert({
    where: {
      userId_wordListId: { // 修正: userId_wordListId を使用
        userId: userId,
        wordListId: wordListId // 修正: wordListId を使用
      }
    },
    update: {
      exampleSentence: exampleSentence,
      imageFilename: imageFilename || null
    },
    create: {
      userId: userId,
      wordListId: wordListId, // 修正: wordListId を使用
      exampleSentence: exampleSentence,
      imageFilename: imageFilename || null
    }
  });
}

export async function deleteUserWordListStatus(id) {
  return await prisma.wordListUserStatus.delete({
    where: { id },
  });
}


export const getWordStoriesByUserIdAndBlockId = async (userId, blockId) => {
  return await prisma.wordStoryByGPT.findMany({
    where: {
      userId: userId,
      blockId: blockId,
    },
    include: {block: true}
  });
};

export async function saveWordStoryByGPT(userId, blockId, length, genre, characters, storyContent, words) {

  return await prisma.wordStoryByGPT.create({
    data: {
      userId,
      blockId: parseInt(blockId),
      storyTitle: '',
      storyContent,
      lengthCategory: length,
      genre,
      characters,
      words,
      // imageUrl: 'AWSのパス', // 必要に応じて設定
    },
  });
}


// 特定のWordStoryByGPTレコードを削除する関数
export const deleteWordStoryByGPT = async (id) => {
  return await prisma.wordStoryByGPT.delete({
    where: {
      id: id,
    },
  });
};

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
  const statusRecord = await prisma.userWordListByThemeStatus.findUnique({
    where: {
      userId_wordListByThemeId: {
        userId,
        wordListByThemeId
      }
    },
    select: {
      memorizeStatus: true,
      exampleSentence: true // 例文を取得
    }
  });

  // statusRecordが存在しない場合、既定の値を返す
  if (!statusRecord) {
    return {
      memorizeStatus: 'UNKNOWN',
      exampleSentence: null
    };
  }

  return statusRecord;
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

export async function saveExampleSentence(userId, wordListByThemeId, exampleSentence) {
  // Prisma Client を使用して例文を保存
  await prisma.userWordListByThemeStatus.upsert({
    where: {
      userId_wordListByThemeId: {
        userId: userId,
        wordListByThemeId: wordListByThemeId
      }
    },
    update: {
      exampleSentence: exampleSentence
    },
    create: {
      userId: userId,
      wordListByThemeId: wordListByThemeId,
      exampleSentence: exampleSentence
    }
  });
}


export async function deleteUserWordListByThemeStatus(id) {
  return await prisma.userWordListByThemeStatus.delete({
    where: { id },
  });
}


// userIdに一致するWordStoryByGPTを取得する関数
export const getWordStoriesByUserIdAndTheme = async (userId, theme) => {
  return await prisma.wordStoryByGPT.findMany({
    where: {
      userId: userId,
      theme: theme,
    },
  });
};



export async function saveWordStoryByGPT(userId, theme, block, length, genre, characters, storyData) {
  // const storyTitle = storyData.title; // 仮定: storyDataにtitle属性が存在する
  const storyContent = storyData.story; // 仮定: storyDataにstory属性が存在する
  const words = storyData.words; // 仮定: storyDataにwords属性が存在する
  const updatedWords = words.map(word => `${word.english} (${word.japanese})`)

  return await prisma.wordStoryByGPT.create({
    data: {
      userId,
      theme,
      block,
      storyTitle: '',
      storyContent,
      lengthCategory: length,
      genre,
      characters,
      words: updatedWords,
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

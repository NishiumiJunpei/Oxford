// utils/prisma-utils.js
import prisma from '../prisma/prisma';  // Assume prisma.js exports your Prisma client instance
import { timeAgo } from './utils';

export async function getThemes(){
  return await prisma.theme.findMany()
}

export async function getBlocks(themeId){
  return await prisma.block.findMany({
    where: {
      themeId: themeId
    },
    orderBy: {
      displayOrder: 'asc' // 'asc' は昇順を意味します
    }
  })
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

export async function getTheme(themeId) {
  return await prisma.theme.findUnique({
    where: { id: parseInt(themeId) }
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

export async function getWordListById(id) {
  return await prisma.WordList.findUnique({
    where: { id },
    include: {
      blocks: {
        include: {
          block: {
            include: {
              theme: true,
            },
          },
        },
      },
    },
  });
}


export async function getWordListByEnglish(searchTerm) {
  return await prisma.WordList.findMany({
    where: {
      english: {
        contains: searchTerm,
      },
    },
    include: {
      blocks: {
        include: {
          block: {
            include: {
              theme: true,
            },
          },
        },
      },
    },
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
      blocks: true
      }
  });
}


// export async function getWordListUserStatus(userId, themeId, blockId = '') {
//   let whereClause = {
//     userId: userId
//   };

//   // themeId が指定されている場合のクエリ条件を設定
//   if (themeId && !blockId) {
//     whereClause.wordList = {
//       blocks: {
//         some: {
//           block: { themeId: parseInt(themeId) }
//         }
//       }
//     };
//   }

//   // blockId が指定されている場合のクエリ条件を設定
//   if (blockId) {
//     whereClause.wordList = {
//       blocks: {
//         some: {
//           blockId: parseInt(blockId)
//         }
//       }
//     };
//   }

//   // Prisma クエリを使用して WordListUserStatus データを取得
//   return await prisma.wordListUserStatus.findMany({
//     where: whereClause,
//     include: {
//       wordList: {
//         include: {
//           blocks: true
//         }
//       }
//     }
//   });
// }

export async function getWordListUserStatus(userId, themeId, blockId = '') {
  let whereClause = {
    userId: userId
  };

  // themeId が指定されている場合
  if (themeId && !blockId) {
    // まず関連するBlockのIDを取得
    const relatedBlockIds = await prisma.block.findMany({
      where: {
        themeId: parseInt(themeId),
      },
      select: {
        id: true, // ここではBlockのIDのみが必要
      }
    }).then(blocks => blocks.map(block => block.id));

    // 取得したBlockのIDを使用してWordListUserStatusを検索
    whereClause.wordList = {
      blocks: {
        some: {
          blockId: {
            in: relatedBlockIds // 取得したIDのリストを使用
          }
        }
      }
    };
  }

  // blockId が指定されている場合のクエリ条件を設定
  if (blockId) {
    whereClause.wordList = {
      blocks: {
        some: {
          blockId: parseInt(blockId)
        }
      }
    };
  }

  // Prisma クエリを使用して WordListUserStatus データを取得
  return await prisma.wordListUserStatus.findMany({
    where: whereClause,
    include: {
      wordList: {
        include: {
          blocks: true
        }
      }
    }
  });
}


export async function getWordListUserStatusByWordListId(userId, wordListId) {
  const statusRecord = await prisma.wordListUserStatus.findUnique({
    where: {
      userId_wordListId: {
        userId: userId,
        wordListId: wordListId
      }
    }
  });

  if (!statusRecord) {
    return {
      memorizeStatusEJ: 'NOT_MEMORIZED',
      memorizeStatusJE: 'NOT_MEMORIZED',
      lastMemorizedTimeAgo: null,
      lastNotMemorizedTimeAgo: null
    };
  }

  return statusRecord
}

export async function updateUserWordStatus(userId, wordListId, languageDirection, memorizeStatus) {
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
      lastCheckDate: currentTime,
    };

    if (languageDirection === 'EJ') {
      updatedData.memorizeStatusEJ = memorizeStatus;
      if (memorizeStatus === 'MEMORIZED') {
        //24時間以内に２連続正解すると、その後、MEMORIZED2になりづらくなるので、更新しない
        if (existingRecord.memorizeStatusEJ === 'NOT_MEMORIZED' || 
        (existingRecord.memorizeStatusEJ === 'MEMORIZED' && !existingRecord.lastMemorizedDateEJ) ||
        (existingRecord.memorizeStatusEJ === 'MEMORIZED' && (existingRecord.lastMemorizedDateEJ.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000))) {
          updatedData.lastMemorizedDateEJ = currentTime;
        }

        if (existingRecord.lastMemorizedDateEJ &&
            currentTime - existingRecord.lastMemorizedDateEJ > 24 * 60 * 60 * 1000 &&
            existingRecord.memorizeStatusEJ === 'MEMORIZED') {
            updatedData.memorizeStatusEJ = 'MEMORIZED2';
        }
      }
    } else if (languageDirection === 'JE') {
      updatedData.memorizeStatusJE = memorizeStatus;
      if (memorizeStatus === 'MEMORIZED') {
        //24時間以内に２連続正解すると、その後、MEMORIZED2になりづらくなるので、更新しない
        if (existingRecord.memorizeStatusJE === 'NOT_MEMORIZED' || 
        (existingRecord.memorizeStatusJE === 'MEMORIZED' && !existingRecord.lastMemorizedDateJE) ||
        (existingRecord.memorizeStatusJE === 'MEMORIZED' && (existingRecord.lastMemorizedDateJE.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000))) {
          updatedData.lastMemorizedDateJE = currentTime;
        }

        if (existingRecord.lastMemorizedDateJE &&
            currentTime - existingRecord.lastMemorizedDateJE > 24 * 60 * 60 * 1000 &&
            existingRecord.memorizeStatusJE === 'MEMORIZED') {
          updatedData.memorizeStatusJE = 'MEMORIZED2';
        }
      }
    }

    return await prisma.wordListUserStatus.update({
      where: { id: existingRecord.id },
      data: updatedData,
    });
  } else {
    const newData = {
      userId,
      wordListId,
      lastCheckDate: currentTime,
      memorizeStatusEJ: 'NOT_MEMORIZED',
      memorizeStatusJE: 'NOT_MEMORIZED',
    };

    if (languageDirection === 'EJ') {
      newData.memorizeStatusEJ = memorizeStatus;
      if (memorizeStatus === 'MEMORIZED') {
        newData.lastMemorizedDateEJ = currentTime;
      }
    } else if (languageDirection === 'JE') {
      newData.memorizeStatusJE = memorizeStatus;
      if (memorizeStatus === 'MEMORIZED') {
        newData.lastMemorizedDateJE = currentTime;
      }
    }

    return await prisma.wordListUserStatus.create({
      data: newData,
    });
  }
}

export async function saveExampleSentenceAndImageForUser(userId, wordListId, exampleSentence, imageFilename = '') {
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

export async function updateWordList(wordListId, data) {
  await prisma.WordList.update({
    where: {
      id: wordListId, // 更新するWordListレコードを特定
    },
    data: data, // dataオブジェクトの内容で更新
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

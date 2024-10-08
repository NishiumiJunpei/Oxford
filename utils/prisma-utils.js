// utils/prisma-utils.js
import prisma from '../prisma/prisma';  // Assume prisma.js exports your Prisma client instance
import { timeAgo } from './utils';
import { addMinutesToDate } from './utils';
import { srTiming } from './variables';

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

export async function findBlockByDisplayOrderAndThemeId(displayOrder, themeId) {
  return await prisma.block.findFirst({
    where: {
      themeId: themeId,
      displayOrder: displayOrder
    },
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
  return await prisma.wordList.findUnique({
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

export async function getWordListByBlockIds(blockIds) {
  // blockIdsが数値の配列でない場合（例えば、文字列の配列の場合）、数値に変換
  const numericBlockIds = blockIds.map(id => parseInt(id));

  // データベースから取得
  const wordLists = await prisma.wordList.findMany({
    where: {
      // blocksリレーションに紐づくblockIdが、指定されたblockIds配列内のいずれかに一致するレコードを取得
      blocks: {
        some: {
          blockId: {
            in: numericBlockIds
          }
        }
      }
    },
    include: {
      blocks: true // blocksリレーションを結果に含める
    }
  });

  // JavaScript でソート
  const sortedWordLists = wordLists.sort((a, b) => {
    // 指定された blockIds の中で最初の block の displayOrder を使ってソート
    const aBlock = a.blocks.find(block => numericBlockIds.includes(block.blockId));
    const bBlock = b.blocks.find(block => numericBlockIds.includes(block.blockId));

    const aOrder = aBlock ? aBlock.displayOrder : Infinity; // 見つからない場合は最後に
    const bOrder = bBlock ? bBlock.displayOrder : Infinity; // 見つからない場合は最後に

    return aOrder - bOrder;
  });


  return sortedWordLists;
}

export async function getWordListByEnglish(searchTerm) {
  return await prisma.wordList.findMany({
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

  // データベースから取得
  const wordLists = await prisma.wordList.findMany({
    where: query,
    include: {
      blocks: {
        include: {
          block: true
        }
      }
    }
  });

  // ソート処理
  if (criteria.blockId) {
    const targetBlockId = parseInt(criteria.blockId);
    const sortedWordLists = wordLists.sort((a, b) => {
      // WordListBlock の displayOrder を基にソート
      const aBlock = a.blocks.find(block => block.blockId === targetBlockId);
      const bBlock = b.blocks.find(block => block.blockId === targetBlockId);

      // ここで WordListBlock の displayOrder を使用
      const aOrder = aBlock ? aBlock.displayOrder : Infinity;
      const bOrder = bBlock ? bBlock.displayOrder : Infinity;

      return aOrder - bOrder;
    });

    return sortedWordLists;
  }

  return wordLists;
}

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

export async function getWordListUserStatusByWordListIds(userId, wordListIds) {
  let whereClause = {
    userId: userId,
    wordListId: {
      in: wordListIds
    }
  };
    
  const statusRecords = await prisma.wordListUserStatus.findMany({
    where: whereClause
  });
  
  
  return statusRecords
}

export async function updateUserWordStatus(userId, wordListId, languageDirection, memorizeStatus) {
  const existingRecord = await prisma.wordListUserStatus.findUnique({
    where: {
      userId_wordListId: {
        userId: userId,
        wordListId: wordListId,
      },
    },
  });

  const currentTime = new Date();

  const updatedData = {
    lastCheckDate: currentTime,
  };

  if (languageDirection === 'EJ') {
    updatedData.memorizeStatusEJ = memorizeStatus;
    updatedData.lastMemorizedDateEJ = currentTime;
  } else if (languageDirection === 'JE') {
    updatedData.memorizeStatusJE = memorizeStatus;
    updatedData.lastMemorizedDateJE = currentTime;
  }

  if (existingRecord) {
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
      ...updatedData,
    };

    return await prisma.wordListUserStatus.create({
      data: newData,
    });
  }
}

export async function updateUserWordStatusForAssessment(userId, wordListId, languageDirection, memorizeStatus) {
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
        //lastMemorizedDateEJ - 24時間以内に２連続正解すると、その後、MEMORIZED2になりづらくなるので、lastMemorizedDateEJを更新しない
        if (existingRecord.memorizeStatusEJ === 'NOT_MEMORIZED' || 
        (existingRecord.memorizeStatusEJ === 'MEMORIZED' && !existingRecord.lastMemorizedDateEJ) ||
        (existingRecord.memorizeStatusEJ === 'MEMORIZED' && (existingRecord.lastMemorizedDateEJ?.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000))) {
          updatedData.lastMemorizedDateEJ = currentTime;
        }

        //memorizeStatusEJ - 前回正解後、24時間以上たっている場合、MEMORIZED2にする。または、MEMORIZED2の場合はMEMORIZED2のまま
        if (existingRecord.lastMemorizedDateEJ &&
            currentTime - existingRecord.lastMemorizedDateEJ > 24 * 60 * 60 * 1000 &&
            existingRecord.memorizeStatusEJ === 'MEMORIZED') {
              updatedData.memorizeStatusEJ = 'MEMORIZED2';
        }else if(existingRecord.memorizeStatusEJ === 'MEMORIZED2'){
          updatedData.memorizeStatusEJ = 'MEMORIZED2';

        }
      }
    } else if (languageDirection === 'JE') {
      updatedData.memorizeStatusJE = memorizeStatus;
      if (memorizeStatus === 'MEMORIZED') {
        //lastMemorizedDateEJ - 24時間以内に２連続正解すると、その後、MEMORIZED2になりづらくなるので、lastMemorizedDateEJを更新しない
        if (existingRecord.memorizeStatusJE === 'NOT_MEMORIZED' || 
        (existingRecord.memorizeStatusJE === 'MEMORIZED' && !existingRecord.lastMemorizedDateJE) ||
        (existingRecord.memorizeStatusJE === 'MEMORIZED' && (existingRecord.lastMemorizedDateJE?.getTime() < currentTime.getTime() - 24 * 60 * 60 * 1000))) {
          updatedData.lastMemorizedDateJE = currentTime;
        }

        //memorizeStatusEJ - 前回正解後、24時間以上たっている場合、MEMORIZED2にする。または、MEMORIZED2の場合はMEMORIZED2のまま
        if (existingRecord.lastMemorizedDateJE &&
            currentTime - existingRecord.lastMemorizedDateJE > 24 * 60 * 60 * 1000 &&
            existingRecord.memorizeStatusJE === 'MEMORIZED') {
          updatedData.memorizeStatusJE = 'MEMORIZED2';
        }else if(existingRecord.memorizeStatusEJ === 'MEMORIZED2'){
          updatedData.memorizeStatusEJ = 'MEMORIZED2';

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

export async function updateExampleSentenceForUser(userId, wordListId, exampleSentenceForUser) {
  try {
    const existingRecord = await prisma.wordListUserStatus.findUnique({
      where: {
        userId_wordListId: {
          userId: userId,
          wordListId: wordListId
        }
      }
    });

    if (existingRecord) {
      return await prisma.wordListUserStatus.update({
        where: {
          id: existingRecord.id
        },
        data: {
          exampleSentenceForUser: exampleSentenceForUser
        }
      });
    } else {
      return await prisma.wordListUserStatus.create({
        data: {
          userId: userId,
          wordListId: wordListId,
          exampleSentenceForUser: exampleSentenceForUser
        }
      });
    }
  } catch (error) {
    console.error('Error in updateExampleSentenceForUser:', error);
    throw error;
  }
}

export async function updateUserSentenceReviewByAI(userId, wordListId, userSentence, reviewByAI) {
  try {
    const existingRecord = await prisma.wordListUserStatus.findUnique({
      where: {
        userId_wordListId: {
          userId: userId,
          wordListId: wordListId
        }
      }
    });

    if (existingRecord) {
      return await prisma.wordListUserStatus.update({
        where: {
          id: existingRecord.id
        },
        data: {
          userSentence: userSentence,
          reviewByAI: reviewByAI
        }
      });
    } else {
      return await prisma.wordListUserStatus.create({
        data: {
          userId: userId,
          wordListId: wordListId,
          userSentence: userSentence,
          reviewByAI: reviewByAI
        }
      });
    }
  } catch (error) {
    console.error('Error in updateUserSentenceReviewByAI:', error);
    throw error;
  }
}


export async function updateWordList(wordListId, data) {
  await prisma.wordList.update({
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

export const setSrForWordListUserStatus = async(userId, wordListId, srStartTime, srLanguageDirection) =>{
  try {
    await prisma.wordListUserStatus.upsert({
      where: {
        userId_wordListId: {
          userId: userId,
          wordListId: wordListId,
        }
      },
      update: {
        srCount: 0,
        srStartTime: srStartTime,
        srNextTime: addMinutesToDate(new Date(srStartTime), srTiming[0]),
        srLanguageDirection: srLanguageDirection,
        srStatus: "ACTIVE",
      },
      create: {
        userId: userId,
        wordListId: wordListId,
        srCount: 0,
        srStartTime: srStartTime,
        srNextTime: addMinutesToDate(new Date(srStartTime), srTiming[0]),
        srLanguageDirection: srLanguageDirection,
        srStatus: "ACTIVE",
      }
    });
  } catch (error) {
    throw new Error(`Failed to upsert WordListUserStatus: ${error.message}`);
  }
}



export async function getActiveSrWordListsForUser(userId) {
  const activeWordListUserStatuses = await prisma.wordListUserStatus.findMany({
    where: {
      userId: userId,
      srStatus: 'ACTIVE',
    },
    include: {
      wordList: true, // WordListも取得する
    }
  });

  // WordListとWordListUserStatusのデータを組み合わせる
  return activeWordListUserStatuses.map(({ wordList, ...userWordListStatus }) => ({
    ...wordList,
    userWordListStatus: {
      ...userWordListStatus,
      wordList: undefined, // 重複を避けるため、このプロパティは除去
    }
  })).filter(item => item !== null);
}


export async function updateSrWordListUserStatus(ids, action, currentTime) {
  if (action === 'PROGRESS') {
    for (const id of ids) {
      const status = await prisma.wordListUserStatus.findUnique({
        where: { id }
      });

      if (status) {
        let srNextTime;
        let srStatus = 'ACTIVE';
        const srCount = (status.srCount ?? 0) + 1;

        if (srCount >= srTiming.length) {
          srNextTime = null;
          srStatus = 'NOT_ACTIVE';
        } else {
          
          srNextTime = addMinutesToDate(currentTime, srTiming[srCount] - srTiming[srCount - 1]);
        }

        await prisma.wordListUserStatus.update({
          where: { id },
          data: { srNextTime, srCount, srStatus }
        });
      }
    }
  } else if (action === 'DELETE') {
    for (const id of ids) {
      await prisma.wordListUserStatus.update({
        where: { id },
        data: {
          srStartTime: null,
          srNextTime: null,
          srStatus: null,
          srLanguageDirection: null,
          srCount: null
        }
      });
    }
  }
}


export async function updateQuestionJE(userId, wordListId, questionJE) {
  try {
    const existingRecord = await prisma.wordListUserStatus.findUnique({
      where: {
        userId_wordListId: {
          userId: userId,
          wordListId: wordListId
        }
      }
    });

    if (existingRecord) {
      // 既存のレコードがある場合は、questionJEとanswerJEを更新します。
      return await prisma.wordListUserStatus.update({
        where: {
          id: existingRecord.id
        },
        data: {
          questionJE: questionJE, // 更新するフィールドをquestionJEに設定
          answerJE: '',
          userAnswerJE: '',
          reviewScoreJE: 0,
          reviewCommentJE: '',
        }
      });
    } else {
      // 既存のレコードがない場合は、新しくレコードを作成します。
      return await prisma.wordListUserStatus.create({
        data: {
          userId: userId,
          wordListId: wordListId,
          questionJE: questionJE, // 登録するフィールドにquestionJEを設定
          answerJE: '',
          userAnswerJE: '',
          reviewScoreJE: 0,
          reviewCommentJE: '',

        }
      });
    }
  } catch (error) {
    console.error('Error in updateQuestionAnswerJE:', error);
    throw error;
  }
}

export async function updatewordListUserStatusById(wordListId, userId, data) {
  try {
    // `data`オブジェクトから受け取ったキーと値をそのまま更新データとして使用
    return await prisma.wordListUserStatus.update({
      where: {
        userId_wordListId: {
          userId: userId,
          wordListId: wordListId
        }
      },
      data: data // 直接dataオブジェクトを使用
    });
  } catch (error) {
    console.error('Error in updatewordListUserStatusById:', error);
    throw error;
  }
}


export async function updateReviewScoreCommentJE(wordListUserStatusId, reviewScoreJE, reviewCommentJE) {
  try {

    return await prisma.wordListUserStatus.update({
      where: {
        id: wordListUserStatusId
      },
      data: {
        reviewScoreJE: reviewScoreJE,
        reviewCommentJE: reviewCommentJE 
      }
    });


    } catch (error) {
    console.error('Error in updateReviewScoreCommentJE:', error);
    throw error;
  }
}

export async function deleteSrWordList(userId) {
  return await prisma.wordListUserStatus.updateMany({
    where: {
      userId: userId
    },
    data: {
      srStartTime: null,
      srNextTime: null,
      srCount: null,
      srLanguageDirection: null,
      srStatus: null
    }
  });
}



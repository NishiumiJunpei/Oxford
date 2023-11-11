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

export async function updateUserWordListByThemeStatus(id, data) {
  return await prisma.userWordListByThemeStatus.update({
    where: { id },
    data,
  });
}

export async function deleteUserWordListByThemeStatus(id) {
  return await prisma.userWordListByThemeStatus.delete({
    where: { id },
  });
}

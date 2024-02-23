import { getServerSession } from 'next-auth';
import { getUserById } from '@/utils/prisma-utils';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getUserCurrentChallengeThemeId } from './user-utils';

export async function getUserFromSession(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const userId = session.userId;
  let currentChallengeThemeId = ''

  if (!session.currentChallengeThemeId) {
    const user = await getUserCurrentChallengeThemeId(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    currentChallengeThemeId = user.currentChallengeThemeId;
    // session.currentChallengeThemeId = user.currentChallengeThemeId;
  }else{
    currentChallengeThemeId = session.currentChallengeThemeId
  }

  return {userId, currentChallengeThemeId}
}

import { prisma } from "@/infrastructure/database/prisma";

export async function syncUserProfile(
  userId: string,
  userEmail: string,
  displayName?: string,
  avatarUrl?: string | null
) {
  const email = userEmail.toLowerCase().trim();
  const name = displayName || email.split("@")[0];

  const profileById = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (profileById) {
    const updateData: { email?: string; displayName?: string; avatarUrl?: string } = {};

    if (profileById.email !== email) {
      updateData.email = email;
    }
    // Jangan timpa foto profil yang sudah diunggah user; metadata auth hanya dipakai sebagai seed awal.
    if (avatarUrl && !profileById.avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }
    if (displayName && profileById.displayName !== displayName && !profileById.displayName) {
      updateData.displayName = displayName;
    }

    if (Object.keys(updateData).length > 0) {
      return await prisma.profile.update({
        where: { id: userId },
        data: updateData,
      }).catch(() => profileById);
    }
    return profileById;
  }

  const profileByEmail = await prisma.profile.findUnique({
    where: { email },
  });

  if (profileByEmail && profileByEmail.id !== userId) {
    const tempEmail = `${userId.slice(0, 8)}_${Date.now()}@temp.ramu.id`;
    const finalAvatarUrl = avatarUrl || profileByEmail.avatarUrl || null;

    await prisma.profile.create({
      data: {
        id: userId,
        email: tempEmail,
        displayName: profileByEmail.displayName || name,
        avatarUrl: finalAvatarUrl,
        bio: profileByEmail.bio,
      },
    });

    await prisma.actor.updateMany({
      where: { ownerUserId: profileByEmail.id },
      data: { ownerUserId: userId },
    });

    await prisma.profile.delete({
      where: { id: profileByEmail.id },
    });

    return await prisma.profile.update({
      where: { id: userId },
      data: { 
        email,
        ...(finalAvatarUrl ? { avatarUrl: finalAvatarUrl } : {}),
      },
    });
  }

  return await prisma.profile.create({
    data: {
      id: userId,
      email,
      displayName: name,
      avatarUrl: avatarUrl || null,
    },
  });
}

import { prisma } from "@/infrastructure/database/prisma";

export async function syncUserProfile(
  userId: string,
  userEmail: string,
  displayName?: string
) {
  const email = userEmail.toLowerCase().trim();
  const name = displayName || email.split("@")[0];

  const profileById = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (profileById) {
    if (profileById.email !== email) {
      await prisma.profile.update({
        where: { id: userId },
        data: { email },
      }).catch(() => {});
    }
    return profileById;
  }

  const profileByEmail = await prisma.profile.findUnique({
    where: { email },
  });

  if (profileByEmail && profileByEmail.id !== userId) {
    const tempEmail = `${userId.slice(0, 8)}_${Date.now()}@temp.ramu.id`;
    await prisma.profile.create({
      data: {
        id: userId,
        email: tempEmail,
        displayName: profileByEmail.displayName || name,
        bio: profileByEmail.bio,
      },
    });

    // Pindahkan referensi kepemilikan aktor ke userId baru
    await prisma.actor.updateMany({
      where: { ownerUserId: profileByEmail.id },
      data: { ownerUserId: userId },
    });

    // Hapus profile lama
    await prisma.profile.delete({
      where: { id: profileByEmail.id },
    });

    // Kembalikan email asli ke profile baru
    return await prisma.profile.update({
      where: { id: userId },
      data: { email },
    });
  }

  // 3. Buat baru jika belum ada
  return await prisma.profile.create({
    data: {
      id: userId,
      email,
      displayName: name,
    },
  });
}

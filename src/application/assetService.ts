import { prisma } from "@/infrastructure/database/prisma";
import { AssetCategory, AssetStatus, ConfidenceLevel, SourceType, Prisma } from "@prisma/client";

export interface CreateAssetInput {
  actorId: string;
  category: AssetCategory;
  subtype: string;
  name: string;
  description?: string;
  attributes?: Record<string, unknown>;
  sourceType?: SourceType;
  confidenceLevel?: ConfidenceLevel;
}

export interface UpdateAssetInput {
  category?: AssetCategory;
  subtype?: string;
  name?: string;
  description?: string;
  attributes?: Record<string, unknown>;
  status?: AssetStatus;
  confidenceLevel?: ConfidenceLevel;
}

export async function createAsset(input: CreateAssetInput) {
  return prisma.asset.create({
    data: {
      actorId: input.actorId,
      category: input.category,
      subtype: input.subtype,
      name: input.name,
      description: input.description,
      attributes: (input.attributes ?? {}) as Prisma.InputJsonValue,
      sourceType: input.sourceType ?? SourceType.SELF_REPORTED,
      confidenceLevel: input.confidenceLevel ?? ConfidenceLevel.MEDIUM,
      status: AssetStatus.ACTIVE,
    }
  });
}

export async function getAssetById(id: string) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) throw new Error("Asset not found");
  return asset;
}

export async function getAssetsByActorId(actorId: string, category?: AssetCategory) {
  return prisma.asset.findMany({
    where: { 
      actorId, 
      status: AssetStatus.ACTIVE,
      ...(category ? { category } : {})
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateAsset(id: string, actorId: string, input: UpdateAssetInput) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) throw new Error("Asset not found");
  if (asset.actorId !== actorId) throw new Error("Unauthorized to update this asset");

  return prisma.asset.update({
    where: { id },
    data: {
      category: input.category,
      subtype: input.subtype,
      name: input.name,
      description: input.description,
      attributes: input.attributes ? (input.attributes as Prisma.InputJsonValue) : undefined,
      status: input.status,
      confidenceLevel: input.confidenceLevel
    }
  });
}

export async function deleteAsset(id: string, actorId: string) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) throw new Error("Asset not found");
  if (asset.actorId !== actorId) throw new Error("Unauthorized to delete this asset");

  return prisma.asset.delete({ where: { id } });
}

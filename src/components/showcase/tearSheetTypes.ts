export type HotspotCategory = "wardrobe" | "photography" | "hmua" | "talent" | "art_direction";

export interface HotspotPin {
  id: string;
  category: HotspotCategory;
  title: string;
  role: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarBg?: string;
  creatorId?: string;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  details: {
    label: string;
    value: string;
  }[];
  notes?: string;
}

export interface TearSheetCredit {
  role: string;
  category: HotspotCategory;
  name: string;
  handle: string;
  actorId?: string;
  location?: string;
  details: string;
  verified: boolean;
  verificationTimestamp?: string;
  verifiedBy?: string;
  verificationMethod?: "PEER_CONFIRMED" | "CONTRACT_MATCHED" | "DIRECT_CLAIM";
  status?: "VERIFIED" | "PENDING";
}

export interface TearSheetTechnicalSpecs {
  camera?: string;
  lens?: string;
  shutter?: string;
  aperture?: string;
  iso?: string;
  lighting?: string;
  location?: string;
}

export interface TearSheetData {
  issueNumber: string;
  edition: string;
  title: string;
  category: string;
  concept: string;
  credits: TearSheetCredit[];
  hotspots: HotspotPin[];
  technicalSpecs?: TearSheetTechnicalSpecs;
  tags: string[];
  antiCatfishingCertificateId: string;
  verificationRate: string;
  verifiedDate: string;
}

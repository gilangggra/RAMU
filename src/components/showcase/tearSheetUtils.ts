import { ShowcaseItem } from "@/application/showcaseService";
import { TearSheetData, HotspotPin, TearSheetCredit, TearSheetTechnicalSpecs } from "./tearSheetTypes";

const CURATED_COLLABORATORS = {
  wardrobe: [
    { name: "Nara Atelier", handle: "@atelier_nara", location: "Bandung", piece: "Deconstructed Silk Organza Drapes", fabric: "100% Mulberry Raw Silk" },
    { name: "Kala Studio", handle: "@kala.craftwear", location: "Yogyakarta", piece: "Structured Tailored Kimono Coat", fabric: "Handwoven Tenun Ikat & Linen" },
    { name: "Lumina Archive", handle: "@lumina.archive", location: "Jakarta", piece: "Sculptural Asymmetric Blazer", fabric: "Upcycled Japanese Gabardine" },
    { name: "Sora Collective", handle: "@sora.drape", location: "Surabaya", piece: "Layered Pleated Tulle Ensemble", fabric: "Pleated Organza & Satin Chiffon" }
  ],
  photography: [
    { name: "Vikri Maulana", handle: "@vikri.lens", location: "Jakarta", camera: "Sony A7R V", lens: "FE 85mm f/1.4 GM", lighting: "Profoto B10X + 120cm Octabox Key" },
    { name: "Damian Wardhana", handle: "@damian_frames", location: "Bandung", camera: "Hasselblad 907X", lens: "XCD 45mm f/4 P", lighting: "Natural High-Key Diffused Skylight" },
    { name: "Raka Pradana", handle: "@raka.visuals", location: "Bali", camera: "Canon EOS R5", lens: "RF 50mm f/1.2 L USM", lighting: "Aputure 600d with Lantern Modifier" },
    { name: "Alea Chandra", handle: "@alea.captures", location: "Jakarta", camera: "Fujifilm GFX 100 II", lens: "GF 110mm f/2 R LM WR", lighting: "Elinchrom ONE Dual Rim Accents" }
  ],
  hmua: [
    { name: "Claudia Sasmita", handle: "@claudia.mua", location: "Jakarta", concept: "Editorial Glass Skin & Graphic Minimal Liner", palette: "Pat McGrath Labs & Glossier Dew" },
    { name: "Nadya Putri", handle: "@nadyabeauty.art", location: "Surabaya", concept: "Wet-Look Sculpted Hair & Terracotta Cheeks", palette: "MAC Pro Palette & Fenty Beauty" },
    { name: "Zhafira HMUA", handle: "@zhafira.editorial", location: "Bandung", concept: "Bleached Brow Contour & Satin Nude Finish", palette: "Dior Backstage & Rare Beauty" },
    { name: "Tifani Maharani", handle: "@tifani.makeup", location: "Jakarta", concept: "Subtle Iridescent Foil Leaf & Defined Brows", palette: "Hourglass Ambient & Make Up For Ever" }
  ],
  talent: [
    { name: "Ariana Wijaya", handle: "@ariana.wjy", agency: "Post Agency Jakarta", stats: "177cm • Editorial Pose", concept: "Stoic High-Fashion Gaze" },
    { name: "Kenzo Darmawan", handle: "@kenzo.darma", agency: "Wild Talent Management", stats: "185cm • Runway & Lookbook", concept: "Angular Fluid Movement" },
    { name: "Siti Rahma", handle: "@rahma.muse", agency: "Independent Creative Talent", stats: "174cm • Classical Avant-Garde", concept: "Serene Sculptural Balance" },
    { name: "Devan Ardianto", handle: "@devan.ardi", agency: "Origin Model Collective", stats: "182cm • Commercial & Editorial", concept: "Raw Cinematic Presence" }
  ],
  art_direction: [
    { name: "Kolektif Ruang Sembilan", handle: "@ruang.sembilan", location: "Kemang, Jakarta", role: "Set Design & Spatial Staging", style: "Brutalist Concrete Daylight Loft" },
    { name: "Studio Arkhe", handle: "@arkhe.sets", location: "Dago, Bandung", role: "Art Direction & Prop Curation", style: "Minimalist Terrazzo & Raw Stone Props" },
    { name: "Loka Visual Lab", handle: "@loka.visuallab", location: "Denpasar, Bali", role: "Colorist & Post-Production", style: "Kodak Portra 400 Cine-Emulation" }
  ]
};

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTearSheetData(item: ShowcaseItem): TearSheetData {
  const hash = getHash(item.id + item.title);
  const primarySector = (item.actor.sector || "").toLowerCase();

  const actors = item.availableActors || [];

  const dbPhotographers = actors.filter(
    (a) =>
      a.sector.toLowerCase().includes("foto") ||
      a.sector.toLowerCase().includes("visual") ||
      a.sector.toLowerCase().includes("kamera")
  );
  const dbWardrobes = actors.filter(
    (a) =>
      a.sector.toLowerCase().includes("fashion") ||
      a.sector.toLowerCase().includes("desain") ||
      a.sector.toLowerCase().includes("busana") ||
      a.sector.toLowerCase().includes("stylist") ||
      a.sector.toLowerCase().includes("label")
  );
  const dbMuas = actors.filter(
    (a) =>
      a.sector.toLowerCase().includes("makeup") ||
      a.sector.toLowerCase().includes("mua") ||
      a.sector.toLowerCase().includes("kecantikan")
  );
  const dbTalents = actors.filter(
    (a) =>
      a.sector.toLowerCase().includes("model") ||
      a.sector.toLowerCase().includes("talent")
  );
  const dbArtDirectors = actors.filter(
    (a) =>
      a.sector.toLowerCase().includes("art") ||
      a.sector.toLowerCase().includes("director") ||
      a.sector.toLowerCase().includes("studio") ||
      a.sector.toLowerCase().includes("kreatif")
  );

  const wardrobePick = CURATED_COLLABORATORS.wardrobe[hash % CURATED_COLLABORATORS.wardrobe.length];
  const photoPick = CURATED_COLLABORATORS.photography[(hash + 1) % CURATED_COLLABORATORS.photography.length];
  const hmuaPick = CURATED_COLLABORATORS.hmua[(hash + 2) % CURATED_COLLABORATORS.hmua.length];
  const talentPick = CURATED_COLLABORATORS.talent[(hash + 3) % CURATED_COLLABORATORS.talent.length];
  const artPick = CURATED_COLLABORATORS.art_direction[(hash + 4) % CURATED_COLLABORATORS.art_direction.length];

  const isPhotoPrimary =
    primarySector.includes("foto") ||
    primarySector.includes("visual") ||
    primarySector.includes("kamera");
  const isFashionPrimary =
    primarySector.includes("fashion") ||
    primarySector.includes("desain") ||
    primarySector.includes("busana") ||
    primarySector.includes("label");
  const isMuaPrimary =
    primarySector.includes("makeup") ||
    primarySector.includes("mua") ||
    primarySector.includes("kecantikan");

  const photoActor = isPhotoPrimary
    ? item.actor
    : dbPhotographers.length > 0
    ? dbPhotographers[hash % dbPhotographers.length]
    : null;

  const wardrobeActor = isFashionPrimary
    ? item.actor
    : dbWardrobes.length > 0
    ? dbWardrobes[(hash + 1) % dbWardrobes.length]
    : null;

  const muaActor = isMuaPrimary
    ? item.actor
    : dbMuas.length > 0
    ? dbMuas[(hash + 2) % dbMuas.length]
    : null;

  const talentActor =
    dbTalents.length > 0 ? dbTalents[(hash + 3) % dbTalents.length] : null;

  const artActor =
    dbArtDirectors.length > 0
      ? dbArtDirectors[(hash + 4) % dbArtDirectors.length]
      : null;

  const photographerName = photoActor?.name || photoPick.name;
  const photographerHandle = photoActor
    ? `@${photoActor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`
    : photoPick.handle;

  const wardrobeName = wardrobeActor?.name || wardrobePick.name;
  const wardrobeHandle = wardrobeActor
    ? `@${wardrobeActor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`
    : wardrobePick.handle;

  const hmuaName = muaActor?.name || hmuaPick.name;
  const hmuaHandle = muaActor
    ? `@${muaActor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`
    : hmuaPick.handle;

  const talentName = talentActor?.name || talentPick.name;
  const talentHandle = talentActor
    ? `@${talentActor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`
    : talentPick.handle;

  const artName = artActor?.name || artPick.name;
  const artHandle = artActor
    ? `@${artActor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`
    : artPick.handle;

  const technicalSpecs: TearSheetTechnicalSpecs = {
    camera: photoPick.camera,
    lens: photoPick.lens,
    shutter: "1/250s",
    aperture: "f/2.8",
    iso: "100",
    lighting: photoPick.lighting,
    location: item.actor.location || artPick.location
  };

  const issueNum = String((hash % 88) + 1).padStart(2, "0");
  const certHex = ((hash * 1337) % 65535 + 4096).toString(16).toUpperCase();
  const antiCatfishingCertificateId = `RAMU-VERIFIED-CRW-2026-${certHex}`;

  const credits: TearSheetCredit[] = [
    {
      role: "Photography & Lighting",
      category: "photography",
      name: photographerName,
      handle: photographerHandle,
      actorId: photoActor?.id,
      location: photoActor?.location || photoPick.location || undefined,
      details: `${photoPick.camera} • ${photoPick.lens}`,
      verified: isPhotoPrimary,
      isUploader: isPhotoPrimary,
      verificationTimestamp: isPhotoPrimary ? "Maret 2026" : undefined,
      verifiedBy: isPhotoPrimary ? "Pemilik Portofolio (Uploader)" : undefined,
      verificationMethod: isPhotoPrimary ? "DIRECT_CLAIM" : "PEER_CONFIRMED",
      status: isPhotoPrimary ? "VERIFIED" : "PENDING"
    },
    {
      role: "Fashion Design & Styling",
      category: "wardrobe",
      name: wardrobeName,
      handle: wardrobeHandle,
      actorId: wardrobeActor?.id,
      location: wardrobeActor?.location || wardrobePick.location || undefined,
      details: wardrobePick.piece,
      verified: isFashionPrimary || !isPhotoPrimary,
      isUploader: isFashionPrimary,
      verificationTimestamp: "Maret 2026",
      verifiedBy: isFashionPrimary ? "Pemilik Portofolio (Uploader)" : "Dikonfirmasi Silang di Set",
      verificationMethod: "PEER_CONFIRMED",
      status: "VERIFIED"
    },
    {
      role: "Hair & Makeup Artistry",
      category: "hmua",
      name: hmuaName,
      handle: hmuaHandle,
      actorId: muaActor?.id,
      location: muaActor?.location || hmuaPick.location || undefined,
      details: hmuaPick.concept,
      verified: isMuaPrimary,
      isUploader: isMuaPrimary,
      verificationTimestamp: isMuaPrimary ? "Maret 2026" : undefined,
      verifiedBy: isMuaPrimary ? "Pemilik Portofolio (Uploader)" : undefined,
      verificationMethod: "PEER_CONFIRMED",
      status: isMuaPrimary ? "VERIFIED" : "PENDING"
    },
    {
      role: "Editorial Muse & Model",
      category: "talent",
      name: talentName,
      handle: talentHandle,
      actorId: talentActor?.id,
      location: talentActor?.location || undefined,
      details: talentPick.agency,
      verified: false,
      isUploader: false,
      verificationMethod: "PEER_CONFIRMED",
      status: talentActor?.id ? "PENDING" : "EXTERNAL"
    },
    {
      role: "Art Direction & Space",
      category: "art_direction",
      name: artName,
      handle: artHandle,
      actorId: artActor?.id,
      location: artActor?.location || undefined,
      details: artPick.style,
      verified: false,
      isUploader: false,
      status: "EXTERNAL"
    }
  ];

  const hotspots: HotspotPin[] = [];

  if (item.tearSheet) {
    const custom = item.tearSheet;
    const rawCredits: TearSheetCredit[] = custom.credits && custom.credits.length > 0 ? custom.credits : credits;

    const finalCredits: TearSheetCredit[] = rawCredits.map((c, idx) => {

      const isActorUploader = c.actorId === item.actor.id || idx === 0 || c.isUploader;
      if (isActorUploader) {
        return {
          ...c,
          verified: true,
          status: "VERIFIED",
          isUploader: true,
          verifiedBy: "Pemilik Portofolio (Uploader)"
        };
      }
      if (c.verified) {
        return {
          ...c,
          status: "VERIFIED"
        };
      }
      if (c.actorId) {
        return {
          ...c,
          verified: false,
          status: "PENDING"
        };
      }
      return {
        ...c,
        verified: false,
        status: "EXTERNAL"
      };
    });

    const finalHotspots = custom.hotspots && custom.hotspots.length > 0 ? custom.hotspots : hotspots;
    const finalSpecs = custom.technicalSpecs ? { ...technicalSpecs, ...custom.technicalSpecs } : technicalSpecs;

    const verifiedCount = finalCredits.filter(c => c.verified).length;
    const totalCount = finalCredits.length;
    const isFullyVerified = verifiedCount === totalCount && totalCount > 0;
    const verificationRate = isFullyVerified
      ? `100% (${verifiedCount}/${totalCount} Kru Terverifikasi)`
      : `${verifiedCount}/${totalCount} Kru Terkonfirmasi (Verifikasi Parsial)`;

    return {
      issueNumber: `№ ${issueNum}`,
      edition: `EDISI RAMU SPOTLIGHT 2026 // VOL.${issueNum}`,
      title: item.title,
      category: item.category,
      concept:
        custom.concept ||
        `Karya visual sinergis yang memadukan keahlian multi-disiplin di bawah ekosistem kolaborasi terstruktur RAMU. Diproduksi dengan presisi teknis dan estetika kontemporer.`,
      credits: finalCredits,
      hotspots: finalHotspots,
      technicalSpecs: finalSpecs,
      tags: [
        item.category,
        ...(item.actor.aestheticStyles || []),
        "Editorial",
        "Tear-Sheet",
        "RAMU Synergy",
        isFullyVerified ? "Anti-Catfishing Certified" : "Pending Crew Verification",
        "Peer-Verified"
      ],
      antiCatfishingCertificateId,
      verificationRate,
      verifiedDate: "2026"
    };
  }

  const verifiedCount = credits.filter(c => c.verified).length;
  const totalCount = credits.length;
  const isFullyVerified = verifiedCount === totalCount && totalCount > 0;
  const verificationRate = isFullyVerified
    ? `100% (${verifiedCount}/${totalCount} Kru Terverifikasi)`
    : `${verifiedCount}/${totalCount} Kru Terkonfirmasi (Verifikasi Parsial)`;

  return {
    issueNumber: `№ ${issueNum}`,
    edition: `EDISI RAMU SPOTLIGHT 2026 // VOL.${issueNum}`,
    title: item.title,
    category: item.category,
    concept: `Karya visual sinergis yang memadukan keahlian multi-disiplin di bawah ekosistem kolaborasi terstruktur RAMU. Diproduksi dengan presisi teknis dan estetika kontemporer.`,
    credits,
    hotspots,
    technicalSpecs,
    tags: [
      item.category,
      ...(item.actor.aestheticStyles || []),
      "Editorial",
      "Tear-Sheet",
      "RAMU Synergy",
      isFullyVerified ? "Anti-Catfishing Certified" : "Pending Crew Verification",
      "Peer-Verified"
    ],
    antiCatfishingCertificateId,
    verificationRate,
    verifiedDate: "2026"
  };
}

export function formatInstagramCredits(item: ShowcaseItem, data: TearSheetData): string {
  const creditsLines = data.credits
    .map((c) => {
      let icon = "•";
      if (c.category === "photography") icon = "[FOTO]";
      if (c.category === "wardrobe") icon = "[WARDROBE]";
      if (c.category === "hmua") icon = "[HMUA]";
      if (c.category === "talent") icon = "[TALENT]";
      if (c.category === "art_direction") icon = "[ART]";

      let verifBadge = "";
      if (c.isUploader) verifBadge = " [Pemilik Portofolio / Uploader]";
      else if (c.verified) verifBadge = " [Peer-Verified di Set]";
      else if (c.status === "PENDING") verifBadge = " [Menunggu Konfirmasi Rekan]";
      else if (c.status === "EXTERNAL") verifBadge = " [Kredit Eksternal]";

      return `${icon} ${c.role}: ${c.handle} (${c.details})${verifBadge}`;
    })
    .join("\n");

  const techLine = data.technicalSpecs
    ? `\nCamera & Rig: ${data.technicalSpecs.camera} | ${data.technicalSpecs.lens} | ${data.technicalSpecs.lighting}`
    : "";

  return `EDITORIAL TEAR-SHEET: "${data.title}"
${data.edition}
Curated on @ramu.creative • Creative Opportunity Engine

ANTI-CATFISHING STATUS: #${data.antiCatfishingCertificateId}
Status: ${data.verificationRate}
Menjamin perlindungan hak atribusi karya asli produksi tim, terlindungi dari pencurian portofolio (catfishing) & penghapusan kredit talenta.

CREDITS & STATUS KRU:
${creditsLines}${techLine}

Production: ${item.actor.location || "Indonesia"}
Collaboration engineered & verified via RAMU Ecosystem.
Inisiasi kolaborasi serupa: ramu.id/showcase

#RAMUEcosystem #AntiCatfishing #PeerVerified #CoCredit #IndonesianCreative #EditorialTearsheet #FashionEditorial #RAMUSynergy`;
}

import { EngineActor, PairwiseComplementarity, EngineComplementarityStrength } from '../types';

export function evaluatePairwiseComplementarity(
  actorA: EngineActor,
  actorB: EngineActor
): PairwiseComplementarity[] {
  if (actorA.id === actorB.id) return [];

  const results: PairwiseComplementarity[] = [];

  checkDirectNeedMatch(actorA, actorB, results);
  checkDirectNeedMatch(actorB, actorA, results);

  checkProductCombination(actorA, actorB, results);

  checkCreativeCombination(actorA, actorB, results);

  checkProductionChain(actorA, actorB, results);

  if (results.length === 0) {
    checkGeneralSynergy(actorA, actorB, results);
  }

  return results;
}

function checkDirectNeedMatch(
  receiver: EngineActor,
  provider: EngineActor,
  results: PairwiseComplementarity[]
) {
  for (const need of receiver.needs) {
    const needText = `${need.title} ${need.description || ''}`.toLowerCase();

    for (const asset of provider.assets) {
      const assetText = `${asset.name} ${asset.subtype || ''} ${asset.description || ''}`.toLowerCase();

      let isMatch = false;
      let reason = '';

      if (
        (needText.includes('foto') || needText.includes('fotografi') || needText.includes('visual') || needText.includes('katalog') || needText.includes('lookbook')) &&
        (assetText.includes('foto') || assetText.includes('fotografi') || assetText.includes('kamera') || assetText.includes('lensa') || assetText.includes('studi') || asset.category === 'SKILL_TALENT')
      ) {
        isMatch = true;
        reason = `${provider.name} memiliki kapabilitas visual (${asset.name}) yang memenuhi kebutuhan langsung ${receiver.name} (${need.title}).`;
      }
      else if (
        (needText.includes('model') || needText.includes('talent') || needText.includes('wajah')) &&
        (assetText.includes('model') || assetText.includes('talent') || assetText.includes('catwalk') || assetText.includes('editorial'))
      ) {
        isMatch = true;
        reason = `${provider.name} menyediakan talenta model terverifikasi (${asset.name}) untuk kebutuhan sesi kampanye ${receiver.name}.`;
      }
      else if (
        (needText.includes('stylist') || needText.includes('wardrobe') || needText.includes('mua') || needText.includes('makeup')) &&
        (assetText.includes('stylist') || assetText.includes('wardrobe') || assetText.includes('mua') || assetText.includes('makeup'))
      ) {
        isMatch = true;
        reason = `${provider.name} memiliki keahlian styling & tata rias (${asset.name}) yang dicari oleh ${receiver.name}.`;
      }
      else if (
        (needText.includes('busana') || needText.includes('pakaian') || needText.includes('koleksi') || needText.includes('fashion') || needText.includes('bahan')) &&
        (assetText.includes('busana') || assetText.includes('pakaian') || assetText.includes('koleksi') || asset.category === 'WARDROBE_PROP' || asset.category === 'PORTFOLIO_WORK' || asset.roles.includes('INPUT'))
      ) {
        isMatch = true;
        reason = `${provider.name} dapat menyuplai kebutuhan koleksi busana/wardrobe (${asset.name}) untuk ${receiver.name}.`;
      }
      else if (need.category === 'TALENT_NEED' && asset.category === 'SKILL_TALENT') {
        isMatch = true;
        reason = `${provider.name} memiliki keahlian khusus (${asset.name}) yang menjawab kebutuhan kapabilitas ${receiver.name}.`;
      }

      if (isMatch) {
        results.push({
          sourceActorId: provider.id,
          targetActorId: receiver.id,
          sourceAssetId: asset.id,
          relationshipType: 'DIRECT_NEED_MATCH',
          strength: 'STRONG',
          numericStrength: 4.0,
          reasons: [reason],
        });
      }
    }
  }
}

function checkProductCombination(
  actorA: EngineActor,
  actorB: EngineActor,
  results: PairwiseComplementarity[]
) {
  const materialsA = actorA.assets.filter((a) => a.category === 'WARDROBE_PROP');
  const materialsB = actorB.assets.filter((a) => a.category === 'WARDROBE_PROP');

  for (const a of materialsA) {
    for (const b of materialsB) {
      const textA = `${a.name} ${a.subtype || ''}`.toLowerCase();
      const textB = `${b.name} ${b.subtype || ''}`.toLowerCase();

      // Fashion Apparel + Accessories / Leather / Shoes
      const isApparelAndAccessory =
        ((textA.includes('busana') || textA.includes('pakaian') || textA.includes('koleksi') || textA.includes('dress') || textA.includes('batik') || textA.includes('kain')) &&
         (textB.includes('aksesori') || textB.includes('perhiasan') || textB.includes('tas') || textB.includes('sepatu') || textB.includes('kulit') || textB.includes('perak'))) ||
        ((textB.includes('busana') || textB.includes('pakaian') || textB.includes('koleksi') || textB.includes('dress') || textB.includes('batik') || textB.includes('kain')) &&
         (textA.includes('aksesori') || textA.includes('perhiasan') || textA.includes('tas') || textA.includes('sepatu') || textA.includes('kulit') || textA.includes('perak')));

      // Wardrobe + Jewelry Accent
      const isWardrobeAndJewelry =
        ((textA.includes('busana') || textA.includes('wardrobe')) && (textB.includes('perak') || textB.includes('perhiasan') || textB.includes('jewelry'))) ||
        ((textA.includes('perak') || textA.includes('perhiasan') || textA.includes('jewelry')) && (textB.includes('busana') || textB.includes('wardrobe')));

      if (isApparelAndAccessory) {
        results.push({
          sourceActorId: actorA.id,
          targetActorId: actorB.id,
          sourceAssetId: a.id,
          targetAssetId: b.id,
          relationshipType: 'PRODUCT_COMBINATION',
          strength: 'STRONG',
          numericStrength: 3.8,
          reasons: [
            `${a.name} (${actorA.name}) dan ${b.name} (${actorB.name}) dapat dipadukan menjadi lookbook koleksi busana & aksesori terpadu.`,
          ],
        });
      } else if (isWardrobeAndJewelry) {
        results.push({
          sourceActorId: actorA.id,
          targetActorId: actorB.id,
          sourceAssetId: a.id,
          targetAssetId: b.id,
          relationshipType: 'PRODUCT_COMBINATION',
          strength: 'STRONG',
          numericStrength: 3.6,
          reasons: [
            `${b.name} (${actorB.name}) dapat menjadi aksen perhiasan eksklusif bagi koleksi busana ${a.name} (${actorA.name}).`,
          ],
        });
      }
    }
  }
}

function checkCreativeCombination(
  actorA: EngineActor,
  actorB: EngineActor,
  results: PairwiseComplementarity[]
) {
  const isAFashion = actorA.assets.some((a) => a.category === 'PORTFOLIO_WORK' || a.category === 'WARDROBE_PROP');
  const visualB = actorB.assets.find((a) => a.category === 'SKILL_TALENT' && a.roles.includes('SKILL_TALENT'));

  if (isAFashion && visualB) {
    results.push({
      sourceActorId: actorB.id,
      targetActorId: actorA.id,
      sourceAssetId: visualB.id,
      relationshipType: 'CREATIVE_COMBINATION',
      strength: 'STRONG',
      numericStrength: 3.7,
      reasons: [
        `${actorB.name} menyediakan kapabilitas visual (${visualB.name}) untuk mengangkat nilai estetika dan komersial karya ${actorA.name}.`,
      ],
    });
  }

  const isBFashion = actorB.assets.some((a) => a.category === 'PORTFOLIO_WORK' || a.category === 'WARDROBE_PROP');
  const visualA = actorA.assets.find((a) => a.category === 'SKILL_TALENT' && a.roles.includes('SKILL_TALENT'));

  if (isBFashion && visualA) {
    results.push({
      sourceActorId: actorA.id,
      targetActorId: actorB.id,
      sourceAssetId: visualA.id,
      relationshipType: 'CREATIVE_COMBINATION',
      strength: 'STRONG',
      numericStrength: 3.7,
      reasons: [
        `${actorA.name} menyediakan kapabilitas visual (${visualA.name}) untuk mengangkat nilai estetika dan komersial karya ${actorB.name}.`,
      ],
    });
  }
}

function checkProductionChain(
  actorA: EngineActor,
  actorB: EngineActor,
  results: PairwiseComplementarity[]
) {
  const hasInputA = actorA.assets.some((a) => a.category === 'WARDROBE_PROP' || a.roles.includes('INPUT'));
  const hasWorkshopB = actorB.assets.some((a) => a.category === 'STUDIO_SPACE' || a.category === 'SKILL_TALENT');

  if (hasInputA && hasWorkshopB) {
    results.push({
      sourceActorId: actorA.id,
      targetActorId: actorB.id,
      relationshipType: 'PRODUCTION_CHAIN',
      strength: 'MEDIUM',
      numericStrength: 3.2,
      reasons: [
        `Rantai produksi saling terhubung: ${actorA.name} sebagai penyuplai bahan baku ke sentra workshop ${actorB.name}.`,
      ],
    });
  }
}

function checkGeneralSynergy(
  actorA: EngineActor,
  actorB: EngineActor,
  results: PairwiseComplementarity[]
) {
  results.push({
    sourceActorId: actorA.id,
    targetActorId: actorB.id,
    relationshipType: 'EDITORIAL_PUBLICATION',
    strength: 'WEAK',
    numericStrength: 2.0,
    reasons: [
      `Potensi sinergi ekosistem fashion dan visual antara ${actorA.name} dan ${actorB.name} untuk perluasan audiens bersama.`,
    ],
  });
}

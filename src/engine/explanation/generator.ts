import {
  OpportunityPatternDef,
  EngineParticipantAssignment,
  EngineAssetUsage,
  PairwiseComplementarity,
  FeasibilityEvaluation,
  OpportunityExplanationDef,
} from '../types';

export function generateOpportunityExplanation(params: {
  pattern: OpportunityPatternDef;
  title: string;
  participants: EngineParticipantAssignment[];
  assetsUsed: EngineAssetUsage[];
  complementarities: PairwiseComplementarity[];
  feasibility: FeasibilityEvaluation;
  goalsSupportedTitles: string[];
  needsAddressedTitles: string[];
}): OpportunityExplanationDef {
  const {
    pattern,
    title,
    participants,
    assetsUsed,
    complementarities,
    feasibility,
    goalsSupportedTitles,
    needsAddressedTitles,
  } = params;

  const why: string[] = [];
  for (const comp of complementarities) {
    for (const r of comp.reasons) {
      if (!why.includes(r)) why.push(r);
    }
  }

  if (goalsSupportedTitles.length > 0) {
    why.push(`Mendukung sasaran strategis: ${goalsSupportedTitles.slice(0, 3).join(', ')}.`);
  }

  if (needsAddressedTitles.length > 0) {
    why.push(`Menjawab kebutuhan nyata: ${needsAddressedTitles.slice(0, 3).join(', ')}.`);
  }

  // 2. Who list
  const who = participants.map((p) => {
    const actorAssets = assetsUsed
      .filter((a) => a.actorId === p.actorId)
      .map((a) => a.name);

    return {
      actorId: p.actorId,
      actorName: p.actorName,
      role: p.roleLabel || p.roleCode,
      contribution: p.contribution || 'Menyediakan aset dan kapabilitas pendukung kolaborasi.',
      assets: actorAssets,
    };
  });

  // 3. What (Concrete Outputs)
  const what = pattern.expectedOutputs.join(' • ');

  // 4. How (Action Steps)
  const how: string[] = [
    'Penyelarasan konsep desain, spesifikasi teknis, dan sampel produk awal.',
    'Pembagian porsi kerja, peran produksi, dan penentuan skema pembagian nilai.',
    'Penyusunan jadwal produksi terpadu dan sesi dokumentasi visual komersial.',
    'Peluncuran bersama ke kanal pasar terpilih (pameran, e-commerce, atau pembeli korporat).',
  ];

  // 5. Can (Feasibility Notes)
  const canNotes: string[] = [];
  if (feasibility.notes.length > 0) canNotes.push(...feasibility.notes);
  if (feasibility.warnings.length > 0) canNotes.push(...feasibility.warnings);
  if (feasibility.missingRoles.length > 0) {
    canNotes.push(`Peran yang masih perlu dilengkapi: ${feasibility.missingRoles.join(', ')}.`);
  }

  const summary = `Peluang "${title}" terbentuk berdasarkan pola "${pattern.name}" yang menggabungkan kekuatan ${participants.map((p) => p.actorName).join(' dan ')}. Sinergi ini mengonversi aset terpisah menjadi penawaran produk bernilai tambah tinggi.`;

  return {
    summary,
    why,
    who,
    what,
    how,
    can: {
      feasibilityStatus: feasibility.status,
      notes: canNotes,
    },
  };
}

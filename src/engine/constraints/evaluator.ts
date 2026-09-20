import {
  EngineActor,
  OpportunityPatternDef,
  EngineParticipantAssignment,
  FeasibilityEvaluation,
  EngineFeasibilityStatus,
} from '../types';

export function evaluateOpportunityFeasibility(
  pattern: OpportunityPatternDef,
  actors: EngineActor[],
  assignedParticipants: EngineParticipantAssignment[]
): FeasibilityEvaluation {
  const hardFailures: string[] = [];
  const warnings: string[] = [];
  const missingRoles: string[] = [];
  const unknowns: string[] = [];
  const notes: string[] = [];

  for (const requiredRole of pattern.requiredRoles) {
    const isCovered = assignedParticipants.some((p) => p.roleCode === requiredRole.code);
    if (!isCovered) {
      missingRoles.push(`${requiredRole.label} (${requiredRole.code})`);
      hardFailures.push(`Peran wajib "${requiredRole.label}" belum terpenuhi oleh partisipan yang ada.`);
    }
  }

  // 2. Location & Logistical Feasibility
  const locations = actors
    .map((a) => a.location?.toLowerCase().trim())
    .filter((loc): loc is string => Boolean(loc));

  const uniqueCities = Array.from(new Set(locations));
  if (uniqueCities.length > 1) {
    warnings.push(
      `Partisipan berlokasi di wilayah berbeda (${uniqueCities.join(', ')}). Diperlukan alokasi waktu dan biaya logistik pengiriman sampel/produk.`
    );
  } else if (uniqueCities.length === 1) {
    notes.push(`Seluruh partisipan berada di klaster wilayah yang sama (${uniqueCities[0]}), memudahkan koordinasi fisik dan produksi.`);
  } else {
    unknowns.push('Sebagian lokasi partisipan belum terverifikasi secara lengkap.');
  }

  // 3. Actor Constraints Inspection
  for (const actor of actors) {
    for (const constraint of actor.constraints) {
      const type = constraint.type.toUpperCase();
      const severity = constraint.severity;
      const valStr = typeof constraint.value === 'object' ? JSON.stringify(constraint.value) : String(constraint.value);

      if (type === 'BUDGET' || type === 'MINIMUM_ORDER') {
        if (severity === 'HARD') {
          // Verify negotiability
          if (constraint.negotiability === 'FIXED') {
            warnings.push(`${actor.name} memiliki batasan anggaran/minimum order kaku: ${valStr} ${constraint.unit || ''}.`);
          }
        } else {
          notes.push(`${actor.name} menetapkan panduan ${type.toLowerCase()}: ${valStr} (bersifat fleksibel/dapat dinegosiasikan).`);
        }
      } else if (type === 'LEAD_TIME' || type === 'TIME') {
        notes.push(`${actor.name} memerlukan estimasi lead time pengerjaan (${valStr} ${constraint.unit || ''}).`);
      } else if (type === 'CAPACITY') {
        notes.push(`Kapasitas produksi ${actor.name}: ${valStr} ${constraint.unit || ''}.`);
      }
    }
  }

  // 4. Determine Overall Feasibility Status
  let status: EngineFeasibilityStatus = 'FEASIBLE';

  if (missingRoles.length > 0) {
    status = 'PARTIAL';
  } else if (hardFailures.length > 0) {
    status = 'BLOCKED';
  } else if (unknowns.length > 0) {
    status = 'PROMISING';
  } else {
    status = 'FEASIBLE';
  }

  const passed = status === 'FEASIBLE' || status === 'PROMISING';

  return {
    status,
    passed,
    hardFailures,
    warnings,
    missingRoles,
    unknowns,
    notes,
  };
}

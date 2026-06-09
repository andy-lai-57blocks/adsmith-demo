import { RFPBrief, RFPWithResult, Proposal, ValidationError, AgentTrace, TraceStage } from './types';
import { INVENTORY } from './inventory';

/**
 * Three RFPs, each demonstrating a different failure mode.
 *
 * rfp_001 — segment_not_found + volume_exceeds_capacity
 * rfp_002 — budget constrained, valid but partial match
 * rfp_003 — no matching inventory at all (empty proposal)
 */
const DEMO_RFPS: RFPBrief[] = [
  {
    id: "rfp_001",
    advertiser: "Acme Mattress Co",
    audience: {
      description: "25-34 sports enthusiasts",
      segments: ["sports_enthusiasts_25_34", "premium_sports_fans"],
    },
    budget: 50_000,
    formats: ["video", "display"],
    flightStart: "2026-06-01",
    flightEnd: "2026-08-31",
    kpis: ["reach", "completion_rate"],
  },
  {
    id: "rfp_002",
    advertiser: "TurboCar Insurance",
    audience: {
      description: "business professionals 25-54, auto intenders",
      segments: ["business_professionals_25_54", "auto_intenders"],
    },
    budget: 75_000,
    formats: ["display"],
    flightStart: "2026-06-15",
    flightEnd: "2026-09-15",
    kpis: ["reach", "ctr"],
  },
  {
    id: "rfp_003",
    advertiser: "FreshBloom Organic Foods",
    audience: {
      description: "health-conscious adults 25-49",
      segments: ["health_wellness_25_49", "organic_buyers"],
    },
    budget: 35_000,
    formats: ["video", "display"],
    flightStart: "2026-07-01",
    flightEnd: "2026-07-31",
    kpis: ["brand_awareness", "reach"],
  },
];

export function getDemoRFPs(): RFPBrief[] {
  return DEMO_RFPS;
}

export function getRFPById(id: string): RFPBrief | undefined {
  return DEMO_RFPS.find((r) => r.id === id);
}

// ============================================================
// Helpers
// ============================================================

function matchSegment(requested: string) {
  let match = INVENTORY.segments.find((s) => s.name === requested);
  if (match) return match;
  const reqTokens = new Set(requested.toLowerCase().split(/[_ ]/));
  for (const inv of INVENTORY.segments) {
    const invTokens = new Set(inv.name.toLowerCase().split(/[_ ]/));
    const overlap = [...reqTokens].filter((t) => invTokens.has(t)).length;
    if (overlap >= 2) return inv;
  }
  return undefined;
}

function fmt$(n: number) { return `$${n.toLocaleString()}`; }
function fmtN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function pickPlacement(fmt: string, exclude?: string): { id: string; availableImpressions: number } | undefined {
  const candidates = INVENTORY.placements
    .filter((p) => p.format === fmt && p.id !== exclude)
    .sort((a, b) => b.availableImpressions - a.availableImpressions);
  return candidates[0];
}

// ============================================================
// Raw Agent — intentionally ungrounded
// ============================================================

function simulateRawAgent(rfp: RFPBrief): { proposal: Proposal; trace: AgentTrace } {
  const matched = rfp.audience.segments.map((s) => ({ requested: s, inv: matchSegment(s) }));
  const hallucinated = matched.filter((m) => !m.inv).map((m) => m.requested);
  const valid = matched.filter((m) => m.inv).map((m) => m.inv!);

  // Raw agent always produces line items, even for non-existent segments
  const lineItems: Array<{
    segmentId: string; placementId: string; format: string;
    budget: number; impressions: number; cpm: number;
  }> = [];
  const errors: ValidationError[] = [];

  let totalBudget = 0;
  let totalImps = 0;

  for (const seg of rfp.audience.segments) {
    const invMatch = matchSegment(seg);
    const cpm = invMatch ? invMatch.cpmFloor : (seg.includes('premium') ? 32.50 : 22.00);
    const segId = invMatch ? invMatch.id : seg;

    for (const fmt of rfp.formats) {
      const placement = pickPlacement(fmt);
      if (!placement) continue;

      // Raw agent: overallocate — doesn't check capacity
      const share = Math.ceil(rfp.audience.segments.length * rfp.formats.length);
      const allocBudget = Math.round(rfp.budget / share);
      const imps = Math.ceil((allocBudget * 1000) / cpm / 10000) * 10000;
      const cost = Math.round(imps * cpm / 1000);

      lineItems.push({
        segmentId: segId,
        placementId: placement.id,
        format: fmt,
        budget: cost,
        impressions: imps,
        cpm: Math.round(cpm * 100) / 100,
      });
      totalBudget += cost;
      totalImps += imps;

      // Check if this segment is hallucinated
      if (!invMatch) {
        errors.push({
          stage: "commitment_validation",
          type: "segment_not_found",
          detail: `Segment '${seg}' does not exist in the publisher's inventory catalog.`,
        });
      }

      // Check if impressions exceed placement capacity
      if (imps > placement.availableImpressions) {
        errors.push({
          stage: "commitment_validation",
          type: "volume_exceeds_capacity",
          detail: `Placement '${placement.id}' only has ${fmtN(placement.availableImpressions)} available impressions; proposal commits ${fmtN(imps)}.`,
        });
      }
    }
  }

  const totalCPM = totalImps > 0 ? Math.round((totalBudget / totalImps) * 1000 * 100) / 100 : 0;

  const stages: TraceStage[] = [
    {
      name: "Intent Parsing",
      status: "success",
      inputs: `RFP from ${rfp.advertiser}\nAudience: ${rfp.audience.description}\nSegments: ${rfp.audience.segments.join(', ')}\nBudget: ${fmt$(rfp.budget)}`,
      reasoning: `Parsed intent: reach ${rfp.audience.description} with ${rfp.formats.join(' and ')} format(s). Budget ${fmt$(rfp.budget)}. Mapping to available segments...`,
      outputs: `Mapped to candidate segments: ${rfp.audience.segments.join(', ')}\n[WARNING] Segments ${hallucinated.join(', ')} not verified against catalog.`,
    },
    {
      name: "Inventory Packaging",
      status: "success",
      inputs: `Candidate segments: ${rfp.audience.segments.join(', ')}`,
      reasoning: `Selecting placements and pricing. Assuming all segments are available. Pricing based on audience quality and format.`,
      outputs: `Proposed: ${lineItems.map((li) => `${fmtN(li.impressions)} via ${li.placementId} at ${fmt$(li.cpm)} CPM`).join(', ')}.\nTotal: ${fmt$(totalBudget)}.`,
    },
    {
      name: "Commitment Validation",
      status: errors.length > 0 ? "failed" : "success",
      inputs: `Line items generated:\n${lineItems.map((li) => `  ${li.segmentId} → ${li.placementId}: ${fmtN(li.impressions)} imps @ ${fmt$(li.cpm)} CPM = ${fmt$(li.budget)}`).join('\n')}`,
      reasoning: "[NO VALIDATION — raw agent sends without checking inventory catalog]",
      outputs: `VALIDATION SKIPPED — proposal sent.\nErrors that would have been caught: ${errors.length} issue(s).`,
    },
    {
      name: "Negotiation",
      status: "success",
      inputs: "Proposal sent to buyer.",
      reasoning: "Awaiting buyer response.",
      outputs: "Proposal in 'sent' status.",
    },
    {
      name: "Feedback",
      status: "success",
      inputs: "No feedback received.",
      reasoning: "—",
      outputs: "Pending buyer review.",
    },
  ];

  return {
    proposal: {
      id: `prop_raw_${rfp.id}`,
      rfpId: rfp.id,
      lineItems,
      totalCPM,
      projectedReach: totalImps,
      status: "sent",
      validationErrors: errors,
    },
    trace: { stages },
  };
}

// ============================================================
// AdSmith Agent — grounded with commitment validation
// ============================================================

function simulateAdSmithAgent(rfp: RFPBrief): { proposal: Proposal; trace: AgentTrace } {
  const matched = rfp.audience.segments
    .map((s) => ({ requested: s, inv: matchSegment(s) }));

  const valid: Array<{ requested: string; inv: NonNullable<ReturnType<typeof matchSegment>> }> = [];
  const invalid: string[] = [];

  for (const m of matched) {
    if (m.inv) {
      valid.push({ requested: m.requested, inv: m.inv });
    } else {
      invalid.push(m.requested);
    }
  }

  const lineItems: Array<{
    segmentId: string; placementId: string; format: string;
    budget: number; impressions: number; cpm: number;
  }> = [];
  let totalImps = 0;
  let totalSpend = 0;
  const targetSpend = Math.round(rfp.budget * 0.88);

  // Deep-copy placements so we can deduct capacity
  const placements = INVENTORY.placements.map((p) => ({ ...p }));

  for (const v of valid) {
    const seg = v.inv;
    for (const fmt of rfp.formats) {
      const fmtPlacements = placements
        .filter((p) => p.format === fmt)
        .sort((a, b) => b.availableImpressions - a.availableImpressions);

      for (const pl of fmtPlacements) {
        if (totalSpend >= targetSpend) break;
        if (pl.availableImpressions < 10000) continue;

        const maxCostFromCapacity = Math.round((pl.availableImpressions * seg.cpmFloor) / 1000);
        const budgetRemaining = targetSpend - totalSpend;
        const maxCost = Math.min(maxCostFromCapacity, budgetRemaining);

        if (maxCost < 1000) continue;

        let imps = Math.floor((maxCost * 1000) / seg.cpmFloor);
        imps = Math.floor(imps / 1000) * 1000;
        if (imps < 10000) continue;
        if (imps > pl.availableImpressions) imps = pl.availableImpressions;
        imps = Math.floor(imps / 1000) * 1000;

        const cost = Math.round((imps * seg.cpmFloor) / 1000);
        if (cost < 1000) continue;

        lineItems.push({
          segmentId: seg.id,
          placementId: pl.id,
          format: fmt,
          budget: cost,
          impressions: imps,
          cpm: seg.cpmFloor,
        });
        totalSpend += cost;
        totalImps += imps;
        pl.availableImpressions -= imps;
      }
    }
  }

  const totalCPM = totalImps > 0 ? Math.round((totalSpend / totalImps) * 1000 * 100) / 100 : 0;
  const isEmpty = lineItems.length === 0;

  // Build validation summary
  const checkLines: string[] = [];
  checkLines.push(`CHECK 1: All segment IDs in catalog?`);
  if (valid.length > 0) {
    checkLines.push(`       ✅ ${valid.map((v) => v.inv.name).join(', ')} found.`);
  }
  if (invalid.length > 0) {
    checkLines.push(`       ❌ ${invalid.join(', ')} NOT found — excluded.`);
  }
  if (isEmpty) {
    checkLines.push(`       ❌ No valid segments remain — cannot build proposal.`);
  }

  checkLines.push(`CHECK 2: Volume within placement capacity?`);
  if (!isEmpty) {
    checkLines.push(`       ✅ All ${lineItems.length} line item(s) within available inventory.`);
  } else {
    checkLines.push(`       — Skipped (no line items).`);
  }

  checkLines.push(`CHECK 3: Budget reconciliation?`);
  if (!isEmpty) {
    checkLines.push(`       ✅ ${fmt$(totalSpend)} ≤ ${fmt$(rfp.budget)} (${Math.round((totalSpend / rfp.budget) * 100)}% utilization).`);
  } else {
    checkLines.push(`       — N/A (no spend).`);
  }
  if (!isEmpty) checkLines.push(``);
  checkLines.push(isEmpty ? `VALIDATION: Blocked — no viable inventory for this RFP.` : `All checks passed. Proposal ready.`);

  const validationSummary = checkLines.join('\n');

  const traceStages: TraceStage[] = [
    {
      name: "Intent Parsing",
      status: "success",
      inputs: `RFP from ${rfp.advertiser}\nAudience: ${rfp.audience.description}\nSegments: ${rfp.audience.segments.join(', ')}\nBudget: ${fmt$(rfp.budget)}`,
      reasoning: `Grounded parsing against inventory catalog.\nValid matches: ${valid.length > 0 ? valid.map((v) => `${v.requested} → ${v.inv.name}`).join(', ') : '(none)'}.\n${invalid.length > 0 ? `Invalid (not in catalog): ${invalid.join(', ')} — flagged.` : ''}${isEmpty ? '\n⚠ All requested segments are invalid — no proposal possible.' : ''}`,
      outputs: isEmpty
        ? `No valid segments found. Proposal cannot be generated.`
        : `Valid segments: [${valid.map((v) => v.inv.name).join(', ')}].\n${invalid.length > 0 ? `Excluded: [${invalid.join(', ')}].` : ''}\nAdjusted target to available inventory.`,
    },
    {
      name: "Inventory Packaging",
      status: isEmpty ? "failed" : "success",
      inputs: isEmpty
        ? "No valid segments to package."
        : `Valid segments: ${valid.map((v) => `${v.inv.name} (reach: ${fmtN(v.inv.reach)}, CPM floor: ${fmt$(v.inv.cpmFloor)})`).join(', ')}\nAvailable placements: ${INVENTORY.placements.map((p) => `${p.id} (${fmtN(p.availableImpressions)} avail)`).join(', ')}`,
      reasoning: isEmpty
        ? "No valid audience segments available. Cannot create line items. Buyer must redefine audience targeting."
        : `Optimizing allocation across ${rfp.formats.join(' and ')} formats to maximize reach while respecting capacity. Targeting ~88% budget utilization.`,
      outputs: isEmpty
        ? "No line items generated. Proposal is empty."
        : `Proposed ${lineItems.length} line item(s):\n${lineItems.map((li) => `  ${li.segmentId} / ${li.format} / ${li.placementId}: ${fmtN(li.impressions)} imps @ ${fmt$(li.cpm)} CPM = ${fmt$(li.budget)}`).join('\n')}\nTotal: ${fmtN(totalImps)} imps, ${fmt$(totalSpend)} spend (${Math.round((totalSpend / rfp.budget) * 100)}% of budget)`,
    },
    {
      name: "Commitment Validation",
      status: isEmpty ? "failed" : "success",
      inputs: isEmpty ? "No line items to validate." : `${lineItems.length} line item(s) generated. Running checks against ground truth...`,
      reasoning: validationSummary,
      outputs: isEmpty
        ? `VALIDATION BLOCKED 🚫 — Proposal not sent.\nReason: No audience segments from the RFP match available inventory.\nAction required: Buyer must adjust targeting or explore other publishers.`
        : `VALIDATION PASSED ✅ — Proposal locked.\n${lineItems.length} valid line item(s) ready for delivery.`,
    },
    {
      name: "Negotiation",
      status: isEmpty ? "failed" : "success",
      inputs: isEmpty ? "No proposal to negotiate." : "Validated proposal ready. Awaiting buyer response.",
      reasoning: isEmpty ? "Skipped — no proposal generated." : "Proposal within expected ranges. Ready for negotiation round.",
      outputs: isEmpty ? "-" : `Proposal in 'validated' status. Spend: ${fmt$(totalSpend)} / ${fmt$(rfp.budget)}.`,
    },
    {
      name: "Feedback",
      status: isEmpty ? "failed" : "success",
      inputs: "—",
      reasoning: "—",
      outputs: isEmpty ? "Blocked — no feedback pending." : "Pending buyer review.",
    },
  ];

  // For empty proposals, we still need to show the trace but the proposal should reflect blockage
  return {
    proposal: {
      id: `prop_adsmith_${rfp.id}`,
      rfpId: rfp.id,
      lineItems,
      totalCPM,
      projectedReach: totalImps,
      status: isEmpty ? "blocked" : "validated",
      validationErrors: isEmpty ? [{
        stage: "commitment_validation",
        type: "segment_not_found",
        detail: `No matching inventory for any requested audience segment. Proposal blocked.`,
      }] : [],
    },
    trace: { stages: traceStages },
  };
}

// ============================================================
// Public API
// ============================================================

export function simulateRFP(rfpId: string): RFPWithResult | null {
  const rfp = getRFPById(rfpId);
  if (!rfp) return null;

  const raw = simulateRawAgent(rfp);
  const adSmith = simulateAdSmithAgent(rfp);

  return {
    rfp,
    rawProposal: raw.proposal,
    rawTrace: raw.trace,
    adSmithProposal: adSmith.proposal,
    adSmithTrace: adSmith.trace,
  };
}

export function simulateAllRFPs(): RFPWithResult[] {
  return DEMO_RFPS.map((rfp) => simulateRFP(rfp.id)!);
}

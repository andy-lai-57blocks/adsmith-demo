import { RFPBrief, RFPWithResult, Proposal, ValidationError, AgentTrace, TraceStage } from './types';
import { INVENTORY } from './inventory';

/**
 * Pre-loaded RFPs for the demo.
 * The first one is designed to trigger a hallucination.
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
// Agent Simulation
// ============================================================

/**
 * Raw agent — intentionally ungrounded. It hallucinates.
 * Generates a proposal without checking against the real inventory catalog.
 */
function simulateRawAgent(rfp: RFPBrief): { proposal: Proposal; trace: AgentTrace } {
  const stages: TraceStage[] = [
    {
      name: "Intent Parsing",
      status: "success",
      inputs: `RFP from ${rfp.advertiser}\nAudience: ${rfp.audience.description}\nSegments: ${rfp.audience.segments.join(', ')}\nBudget: $${rfp.budget.toLocaleString()}`,
      reasoning: `Parsed intent: reach ${rfp.audience.description} with ${rfp.formats.join(' and ')} format(s). Budget $${rfp.budget.toLocaleString()}. Mapping to available segments...`,
      outputs: `Mapped to candidate segments: premium_sports_fans (not in catalog), sports_enthusiasts_25_34 (exists)`,
    },
    {
      name: "Inventory Packaging",
      status: "success",
      inputs: "Candidate segments: premium_sports_fans, sports_enthusiasts_25_34",
      reasoning: "Selecting placements and pricing. premium_sports_fans has a premium CPM of $32.50. Sports enthusiasts at $18.50. Video placements have higher impact.",
      outputs: `Proposed: 800K impressions via premium_sports_fans at $32.50 CPM + 200K via sports_enthusiasts_25_34 at $18.50 CPM. Total: $29,500.`,
    },
    {
      name: "Commitment Validation",
      status: "failed",
      inputs: "Line items generated. Ready for validation.",
      reasoning: "[NO VALIDATION — raw agent sends without checking]",
      outputs: "VALIDATION SKIPPED — proposal sent without ground truth check.",
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

  // Raw agent produces a proposal that includes a non-existent segment
  const lineItems = [
    {
      segmentId: "premium_sports_fans",
      placementId: "pl_video_sports",
      format: "video",
      budget: 26000,
      impressions: 800_000,
      cpm: 32.50,
    },
    {
      segmentId: "seg_sports_25_34",
      placementId: "pl_display_banner",
      format: "display",
      budget: 3700,
      impressions: 200_000,
      cpm: 18.50,
    },
  ];

  const errors: ValidationError[] = [
    {
      stage: "commitment_validation",
      type: "segment_not_found",
      detail: "Segment 'premium_sports_fans' does not exist in the publisher's inventory catalog.",
    },
    {
      stage: "commitment_validation",
      type: "volume_exceeds_capacity",
      detail: "Video placement 'pl_video_sports' only has 150,000 available impressions; proposal commits 800,000.",
    },
  ];

  return {
    proposal: {
      id: `prop_raw_${rfp.id}`,
      rfpId: rfp.id,
      lineItems,
      totalCPM: 30.50,
      projectedReach: 1_000_000,
      status: "sent",
      validationErrors: errors,
    },
    trace: { stages },
  };
}

/**
 * AdSmith agent — grounded, with deterministic validation.
 * Uses the inventory catalog to validate before sending.
 */
function simulateAdSmithAgent(rfp: RFPBrief): { proposal: Proposal; trace: AgentTrace } {
  // Map requested segments to ones that actually exist
  const validSegments = rfp.audience.segments
    .map((s) => INVENTORY.segments.find((inv) => inv.name.includes(s) || s.includes(inv.name)))
    .filter(Boolean);

  const stages: TraceStage[] = [
    {
      name: "Intent Parsing",
      status: "success",
      inputs: `RFP from ${rfp.advertiser}\nAudience: ${rfp.audience.description}\nSegments: ${rfp.audience.segments.join(', ')}\nBudget: $${rfp.budget.toLocaleString()}`,
      reasoning: `Grounded parsing against inventory catalog. Found match: sports_enthusiasts_25_34 (reach: 450K, CPM floor: $18.50). Segment 'premium_sports_fans' NOT found in catalog — flagged.`,
      outputs: `Valid segments: [sports_enthusiasts_25_34]. Invalid: [premium_sports_fans]. Adjusted target to available segments.`,
    },
    {
      name: "Inventory Packaging",
      status: "success",
      inputs: `Valid segments: sports_enthusiasts_25_34 (reach: 450K). Available placements: video_sports (150K), display_banner (800K).`,
      reasoning: "Checking placement capacity. Video sports has 150K impressions max. Display banner has 800K. Budget $50K across both formats.",
      outputs: `Proposed: 150K impressions via video_sports at $18.50 CPM ($2,775) + 350K via display_banner at $12.00 CPM ($4,200). Total: $6,975. Remaining budget: $43,025.`,
    },
    {
      name: "Commitment Validation",
      status: "success",
      inputs: "Line items generated. Running checks against ground truth...",
      reasoning: `CHECK 1: All segment IDs exist in catalog? ✅ sports_enthusiasts_25_34 found.\nCHECK 2: Volume within placement capacity? ✅ 150K ≤ 150K (exact). 350K ≤ 800K.\nCHECK 3: Budget reconciliation? ✅ $6,975 ≤ $50,000.\n\nAll checks passed.`,
      outputs: "VALIDATION PASSED ✅ — Proposal ready to send.",
    },
    {
      name: "Negotiation",
      status: "success",
      inputs: "Validated proposal ready. Awaiting buyer response.",
      reasoning: "Proposal within expected ranges. Ready for negotiation round.",
      outputs: "Proposal in 'validated' status. Ready for human review.",
    },
    {
      name: "Feedback",
      status: "success",
      inputs: "—",
      reasoning: "—",
      outputs: "Pending buyer review.",
    },
  ];

  const errors: ValidationError[] = [];

  return {
    proposal: {
      id: `prop_adsmith_${rfp.id}`,
      rfpId: rfp.id,
      lineItems: [
        {
          segmentId: "seg_sports_25_34",
          placementId: "pl_video_sports",
          format: "video",
          budget: 2775,
          impressions: 150_000,
          cpm: 18.50,
        },
        {
          segmentId: "seg_sports_25_34",
          placementId: "pl_display_banner",
          format: "display",
          budget: 4200,
          impressions: 350_000,
          cpm: 12.00,
        },
      ],
      totalCPM: 14.60,
      projectedReach: 500_000,
      status: "validated",
      validationErrors: errors,
    },
    trace: { stages },
  };
}

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

/**
 * Simulate a list of RFPs with results (for the dashboard).
 */
export function simulateAllRFPs(): RFPWithResult[] {
  return DEMO_RFPS.map((rfp) => simulateRFP(rfp.id)!);
}

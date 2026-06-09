// ============================================================
// Data Models — AdSmith Demo
// ============================================================

export interface RFPBrief {
  id: string;
  advertiser: string;
  audience: {
    description: string;
    segments: string[];
  };
  budget: number;
  formats: string[];
  flightStart: string;
  flightEnd: string;
  kpis: string[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  reach: number;
  cpmFloor: number;
}

export interface Placement {
  id: string;
  format: string;
  availableImpressions: number;
}

export interface InventoryCatalog {
  segments: AudienceSegment[];
  placements: Placement[];
}

export interface LineItem {
  segmentId: string;
  placementId: string;
  format: string;
  budget: number;
  impressions: number;
  cpm: number;
}

export interface ValidationError {
  stage: string;
  type: 'segment_not_found' | 'volume_exceeds_capacity' | 'inconsistency';
  detail: string;
}

export interface Proposal {
  id: string;
  rfpId: string;
  lineItems: LineItem[];
  totalCPM: number;
  projectedReach: number;
  status: 'draft' | 'validated' | 'blocked' | 'sent';
  validationErrors: ValidationError[];
}

export interface TraceStage {
  name: string;
  status: 'success' | 'failed' | 'running';
  inputs: string;
  reasoning: string;
  outputs: string;
}

export interface AgentTrace {
  stages: TraceStage[];
}

export interface RFPWithResult {
  rfp: RFPBrief;
  rawProposal: Proposal;
  rawTrace: AgentTrace;
  adSmithProposal: Proposal;
  adSmithTrace: AgentTrace;
}

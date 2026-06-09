import { InventoryCatalog } from './types';

/**
 * Publisher Inventory Catalog — the single source of truth.
 * All segments and placements that actually exist in this publisher's inventory.
 */
export const INVENTORY: InventoryCatalog = {
  segments: [
    {
      id: "seg_sports_25_34",
      name: "sports_enthusiasts_25_34",
      reach: 450_000,
      cpmFloor: 18.50,
    },
    {
      id: "seg_gamers_18_34",
      name: "gamers_18_34",
      reach: 620_000,
      cpmFloor: 22.00,
    },
    {
      id: "seg_news_daily",
      name: "daily_news_readers",
      reach: 890_000,
      cpmFloor: 12.00,
    },
    {
      id: "seg_business_professionals",
      name: "business_professionals_25_54",
      reach: 340_000,
      cpmFloor: 28.00,
    },
    {
      id: "seg_entertainment_18_49",
      name: "entertainment_all_18_49",
      reach: 1_200_000,
      cpmFloor: 9.50,
    },
  ],
  placements: [
    { id: "pl_video_homepage", format: "video", availableImpressions: 200_000 },
    { id: "pl_video_sports", format: "video", availableImpressions: 150_000 },
    { id: "pl_display_sidebar", format: "display", availableImpressions: 500_000 },
    { id: "pl_display_banner", format: "display", availableImpressions: 800_000 },
    { id: "pl_video_gaming", format: "video", availableImpressions: 300_000 },
  ],
};

/**
 * Get a segment by name (case-insensitive fuzzy match).
 */
export function findSegment(name: string): typeof INVENTORY.segments[0] | undefined {
  const normalized = name.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return INVENTORY.segments.find(
    (s) => s.name.toLowerCase().replace(/[^a-z0-9_]/g, '') === normalized
  );
}

/**
 * Check if a segment ID exists in the catalog.
 */
export function segmentExists(segmentId: string): boolean {
  return INVENTORY.segments.some((s) => s.id === segmentId);
}

/**
 * Check if a placement can fulfill a given impression count.
 */
export function canFulfill(placementId: string, impressions: number): boolean {
  const placement = INVENTORY.placements.find((p) => p.id === placementId);
  if (!placement) return false;
  return impressions <= placement.availableImpressions;
}

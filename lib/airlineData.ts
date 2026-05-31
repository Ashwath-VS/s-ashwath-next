// Airline Revenue Intelligence Engine — cascade data model
// Mirrors the BFS cascade pattern from lib/macroData.ts but applied to airline P&L economics

export type AirlineNodeId =
  | 'PASSENGER_DEMAND'
  | 'LOAD_FACTOR'
  | 'YIELD_MGT'
  | 'ANCILLARY'
  | 'CARGO'
  | 'FUEL_COST'
  | 'LABOR_COST'
  | 'DISTRIBUTION'
  | 'RASK'
  | 'CASK'
  | 'OPERATING_MARGIN'
  | 'NETWORK_EFFECTS';

export type AirlineLayer = 'demand' | 'revenue' | 'cost' | 'margin' | 'network';

export interface AirlineNode {
  id: AirlineNodeId;
  label: string;
  sublabel: string;
  color: string;
  layer: AirlineLayer;
  isRevenueSide: boolean; // true = negative impact is bad; false (cost) = positive impact is bad
  description: string;
}

export const AIRLINE_NODES: Record<AirlineNodeId, AirlineNode> = {
  PASSENGER_DEMAND: {
    id: 'PASSENGER_DEMAND',
    label: 'Passenger Demand',
    sublabel: 'Traffic · Booking Curve',
    color: '#00acc1',
    layer: 'demand',
    isRevenueSide: true,
    description:
      'Total passenger volumes and booking curve trajectory. Primary demand signal driving yield management decisions. Corporate travel leads leisure in recovery speed.',
  },
  LOAD_FACTOR: {
    id: 'LOAD_FACTOR',
    label: 'Load Factor',
    sublabel: 'Seat Occupancy %',
    color: '#00bcd4',
    layer: 'demand',
    isRevenueSide: true,
    description:
      'Revenue passenger km as % of available seat km. Industry breakeven circa 78%. Below 70% triggers capacity cut decisions — fleet parking or frequency reduction.',
  },
  YIELD_MGT: {
    id: 'YIELD_MGT',
    label: 'Yield Management',
    sublabel: 'Avg Fare · Rev/Pax',
    color: '#26c6da',
    layer: 'revenue',
    isRevenueSide: true,
    description:
      'Average fare per pax, booking class mix, revenue per passenger km. PROS RM and Sabre Mosaic/CRO both operate here — optimising booking class availability against demand signals.',
  },
  ANCILLARY: {
    id: 'ANCILLARY',
    label: 'Ancillary Revenue',
    sublabel: 'Bags · Upgrades · F&B',
    color: '#4dd0e1',
    layer: 'revenue',
    isRevenueSide: true,
    description:
      'Non-ticket revenue per pax. Baggage, seat upgrades, F&B, partnerships. Typically 15–25% of total revenue on LCCs; 8–14% on network carriers. Tracks pax volumes directly.',
  },
  CARGO: {
    id: 'CARGO',
    label: 'Cargo Revenue',
    sublabel: 'Belly · Freight',
    color: '#80deea',
    layer: 'revenue',
    isRevenueSide: true,
    description:
      'Belly cargo and dedicated freight. Volatile — highly sensitive to trade flows, route frequency, and widebody vs narrowbody mix. Became critical P&L lever post-COVID.',
  },
  FUEL_COST: {
    id: 'FUEL_COST',
    label: 'Fuel & Energy',
    sublabel: 'Jet-A · Hedge Book',
    color: '#ff7043',
    layer: 'cost',
    isRevenueSide: false,
    description:
      'Largest variable cost — typically 25–35% of CASK. Hedge book determines near-term insulation: 12-month rolling hedges at 40–80% cover. Unhedged exposure amplifies immediately.',
  },
  LABOR_COST: {
    id: 'LABOR_COST',
    label: 'Labor Costs',
    sublabel: 'Crew · Ground · MRO',
    color: '#ff8a65',
    layer: 'cost',
    isRevenueSide: false,
    description:
      'Crew, ground handling, and maintenance labor — typically 25–30% of operating costs. Largest fixed cost item. IRROP events create material overtime and reaccommodation spikes.',
  },
  DISTRIBUTION: {
    id: 'DISTRIBUTION',
    label: 'Distribution Costs',
    sublabel: 'GDS Fees · NDC · Commission',
    color: '#ffab91',
    layer: 'cost',
    isRevenueSide: false,
    description:
      'GDS booking fees ($8–15/segment), agency commissions, NDC direct costs. Airlines migrating to NDC to escape GDS dependency — each 1% shift saves ~$3.50/booking. Migration is 18–24 months.',
  },
  RASK: {
    id: 'RASK',
    label: 'RASK',
    sublabel: 'Revenue / ASK',
    color: '#66bb6a',
    layer: 'margin',
    isRevenueSide: true,
    description:
      'Revenue per Available Seat Kilometre — primary top-line efficiency metric. Aggregate of yield, load factor, ancillary, and cargo per unit capacity deployed.',
  },
  CASK: {
    id: 'CASK',
    label: 'CASK',
    sublabel: 'Cost / ASK',
    color: '#ef5350',
    layer: 'margin',
    isRevenueSide: false,
    description:
      'Cost per Available Seat Kilometre — total operating cost divided by capacity. RASK − CASK = unit margin. Industry average spread is thin: 0.3–0.8 US cents/ASK in good years.',
  },
  OPERATING_MARGIN: {
    id: 'OPERATING_MARGIN',
    label: 'Operating Margin',
    sublabel: 'RASK − CASK Spread',
    color: '#ff9100',
    layer: 'margin',
    isRevenueSide: true,
    description:
      'Net RASK minus CASK. Industry average 5–8% in good years — highly leveraged to load factor and fuel. A 1pt load factor move on a widebody route can swing margin by 0.5–0.8pp.',
  },
  NETWORK_EFFECTS: {
    id: 'NETWORK_EFFECTS',
    label: 'Network Effects',
    sublabel: 'Routes · Slots · Codeshare',
    color: '#ce93d8',
    layer: 'network',
    isRevenueSide: true,
    description:
      'Downstream network impact: route suspension, slot reallocation, codeshare partner disruption, hub bank re-timing. GDS IROPS Manager and Amadeus handle this today — but slowly.',
  },
};

// Layer layout order for the cascade flow display
export const LAYER_ORDER: AirlineLayer[] = ['demand', 'revenue', 'cost', 'margin', 'network'];

export const LAYER_LABELS: Record<AirlineLayer, string> = {
  demand: 'DEMAND LAYER',
  revenue: 'REVENUE STREAMS',
  cost: 'COST DRIVERS',
  margin: 'UNIT ECONOMICS',
  network: 'NETWORK',
};

export function nodesInLayer(layer: AirlineLayer): AirlineNode[] {
  return (Object.values(AIRLINE_NODES) as AirlineNode[]).filter(n => n.layer === layer);
}

export interface AirlineEdge {
  from: AirlineNodeId;
  to: AirlineNodeId;
  weight: number;
}

export const AIRLINE_EDGES: AirlineEdge[] = [
  { from: 'PASSENGER_DEMAND', to: 'LOAD_FACTOR',      weight: 0.90 },
  { from: 'PASSENGER_DEMAND', to: 'YIELD_MGT',        weight: 0.80 },
  { from: 'PASSENGER_DEMAND', to: 'ANCILLARY',        weight: 0.70 },
  { from: 'PASSENGER_DEMAND', to: 'CARGO',            weight: 0.40 },
  { from: 'LOAD_FACTOR',      to: 'RASK',             weight: 0.85 },
  { from: 'YIELD_MGT',        to: 'RASK',             weight: 0.90 },
  { from: 'ANCILLARY',        to: 'RASK',             weight: 0.60 },
  { from: 'CARGO',            to: 'RASK',             weight: 0.40 },
  { from: 'FUEL_COST',        to: 'CASK',             weight: 0.90 },
  { from: 'LABOR_COST',       to: 'CASK',             weight: 0.80 },
  { from: 'DISTRIBUTION',     to: 'CASK',             weight: 0.45 },
  { from: 'RASK',             to: 'OPERATING_MARGIN', weight: 1.00 },
  { from: 'CASK',             to: 'OPERATING_MARGIN', weight: 1.00 },
  { from: 'OPERATING_MARGIN', to: 'NETWORK_EFFECTS',  weight: 0.70 },
];

export type TriggerId =
  | 'FUEL_SPIKE'
  | 'DEMAND_COLLAPSE'
  | 'CAPACITY_DUMP'
  | 'ROUTE_CANCELLATION'
  | 'EXCHANGE_RATE'
  | 'DISRUPTION_EVENT';

export interface TriggerShock {
  id: TriggerId;
  label: string;
  sublabel: string;
  color: string;
  description: string;
  realWorldRef: string; // e.g. "2022 Ukraine invasion · Jet-A +70% YoY"
  seeds: Partial<Record<AirlineNodeId, number>>;
}

export const AIRLINE_TRIGGERS: Record<TriggerId, TriggerShock> = {
  FUEL_SPIKE: {
    id: 'FUEL_SPIKE',
    label: 'Fuel Spike',
    sublabel: 'Jet-A +30% YoY',
    color: '#ff7043',
    description:
      'Sustained fuel price surge — OPEC supply cut, refinery disruption, or geopolitical premium. Unhedged airlines absorb the full impact within 90 days as the hedge book rolls.',
    realWorldRef: '2022 Ukraine invasion · Jet-A +70% · IAG hedge ratio: 68%',
    seeds: { FUEL_COST: 0.30 },
  },
  DEMAND_COLLAPSE: {
    id: 'DEMAND_COLLAPSE',
    label: 'Demand Collapse',
    sublabel: 'Traffic −20% shock',
    color: '#ef5350',
    description:
      'Severe demand shock — pandemic-scale, deep recession, or geopolitical closure. Load factors collapse first. Yield dilution follows as airlines fight for remaining pax.',
    realWorldRef: 'COVID-19 Q2 2020 · IATA global pax −94% · all carriers capacity cut',
    seeds: { PASSENGER_DEMAND: -0.28, LOAD_FACTOR: -0.22 },
  },
  CAPACITY_DUMP: {
    id: 'CAPACITY_DUMP',
    label: 'Capacity Dump',
    sublabel: 'Competitor +15% capacity',
    color: '#7e57c2',
    description:
      'Competitor injects 15%+ capacity on key routes. Revenue management forced to dilute yield to defend load factor. PROS RM and Sabre Mosaic respond — but with lag.',
    realWorldRef: 'Ryanair Europe expansion 2023 · 550+ routes added · LH group yield -4%',
    seeds: { YIELD_MGT: -0.18, DISTRIBUTION: 0.08 },
  },
  ROUTE_CANCELLATION: {
    id: 'ROUTE_CANCELLATION',
    label: 'Route Cancellation',
    sublabel: 'Hub route suspended',
    color: '#26c6da',
    description:
      'Key hub route suspension — slot forfeiture risk, codeshare disruption, connecting traffic loss. GDS IROPS Manager handles recovery but is slow; connecting pax are stranded.',
    realWorldRef: 'Flybe collapse Feb 2023 · 80+ routes dropped · regional slot redistribution',
    seeds: { PASSENGER_DEMAND: -0.15, CARGO: -0.22, NETWORK_EFFECTS: -0.28 },
  },
  EXCHANGE_RATE: {
    id: 'EXCHANGE_RATE',
    label: 'Exchange Rate Shock',
    sublabel: 'USD/local −15%',
    color: '#66bb6a',
    description:
      'Local currency devaluation vs USD. Fuel, leases, and debt are dollar-denominated; revenues are in local currency. Margin compression is immediate and structural.',
    realWorldRef: 'Turkish lira crisis 2021-22 · Turkish Airlines FX loss $1.2B · capacity cuts',
    seeds: { FUEL_COST: 0.15, LABOR_COST: -0.05, YIELD_MGT: -0.12 },
  },
  DISRUPTION_EVENT: {
    id: 'DISRUPTION_EVENT',
    label: 'IRROP Cascade',
    sublabel: 'Weather · ATC · Infra',
    color: '#ff9100',
    description:
      'Major operational disruption — severe weather, ATC strike, or infrastructure failure. IROPs cascade through the network: crew hours, ground costs, reaccommodation spend. GDS IROPS Manager handles this today — slowly.',
    realWorldRef: 'SWA Dec 2022 meltdown · 16,700 cancellations · $825M cost · IT failure',
    seeds: { LABOR_COST: 0.22, DISTRIBUTION: 0.14, LOAD_FACTOR: -0.12 },
  },
};

// ── BFS Cascade ────────────────────────────────────────────────────────────────

export interface AirlineImpact {
  impact: number;       // positive for cost nodes = cost increased; negative for revenue = revenue dropped
  conf: number;         // 0-1 confidence
  daysToEffect: number; // T+N days
  mechanism: string;
  recovery: string;
}

const MECHANISMS: Record<AirlineNodeId, string> = {
  PASSENGER_DEMAND:
    'Demand shock propagates through booking curve within 7 days. Corporate accounts freeze first; leisure follows with 2-4 week lag.',
  LOAD_FACTOR:
    'Revenue management adjusts booking class opens to fill seats, accepting yield dilution. Capacity cuts follow at 6-week lead time.',
  YIELD_MGT:
    'Yield management recalibrates booking class availability within 48 hours. PROS RM and Sabre CRO both see the demand signal simultaneously — competitive pricing response accelerates.',
  ANCILLARY:
    'Ancillary revenue tracks pax volume directly. Fewer passengers, fewer bags, fewer upgrades. Premium ancillary (WiFi, lounge) also declines.',
  CARGO:
    'Belly cargo constrained by frequency reduction decisions. Dedicated freighter operators absorb displaced demand but at higher shipper cost.',
  FUEL_COST:
    'Fuel represents 28–35% of CASK. Unhedged exposure amplifies unit cost immediately. Airlines with <50% hedge ratio absorb full spot price within 90 days.',
  LABOR_COST:
    'Crew disruption, IRROP overtime, and ground reaccommodation costs. Structural labor cost changes require negotiation cycle — union contracts limit flexibility.',
  DISTRIBUTION:
    'GDS segment fees ($8–15/booking) become more painful as revenue per booking falls. NDC direct migration accelerates — every 1% shift saves ~$3.50/booking.',
  RASK:
    'Top-line unit revenue — aggregate of yield, load factor, ancillary, and cargo per ASK. Compressed by demand-side and capacity-side shocks simultaneously.',
  CASK:
    'Unit cost metric — fuel, labor, and distribution changes flow through within 30–90 days. CASK only improves via fleet efficiency or traffic growth against fixed capacity.',
  OPERATING_MARGIN:
    'Net RASK minus CASK spread. Industry average 5–8%; small shocks cascade to large margin moves due to high fixed cost base and thin spread.',
  NETWORK_EFFECTS:
    'Hub bank re-timing, codeshare disruption, slot reallocation. GDS IROPS Manager handles recovery coordination — but at 47-minute average resolution time per pax.',
};

const RECOVERY_HORIZONS: Record<AirlineNodeId, string> = {
  PASSENGER_DEMAND:  'Corporate: 12–18 months. Leisure: 6–9 months. Route-specific demand may not fully restore if competitor fills the gap.',
  LOAD_FACTOR:       'Capacity cuts (6-week lead time) restore load factor fastest. Full frequency restoration: 6–12 months post-demand recovery.',
  YIELD_MGT:         'Yield management recalibrates within 30 days. Fare restoration to pre-shock levels: 6–12 months as demand rebuilds.',
  ANCILLARY:         'Tracks pax recovery. New revenue streams (premium WiFi, dynamic bundling) can accelerate by 2–3 months.',
  CARGO:             'Hedged cargo contracts provide 90-day floor. Trade flow recovery tied to macroeconomic timeline — 12–24 months.',
  FUEL_COST:         'Hedge book roll: 12–18 months to fully reprice at new rates. Fleet renewal (LEAP/GTF engines) delivers 15–20% efficiency over 5+ years.',
  LABOR_COST:        'IRROP overtime normalises in 30–60 days. Structural labor cost reduction requires negotiation cycle — 18–36 months.',
  DISTRIBUTION:      'NDC migration: 18–24 months for full transition. Near-term GDS cost reduction via direct-connect mandates (BA, AF/KL precedent).',
  RASK:              'RASK recovery via yield management, ancillary growth, and load optimization — 12–18 months to pre-shock levels.',
  CASK:              'CASK reduction requires fleet efficiency (multi-year), labor productivity (cycle-dependent), and distribution migration (18 months).',
  OPERATING_MARGIN:  'Margin restoration requires concurrent RASK and CASK improvement — typically 18–24 months from shock trough.',
  NETWORK_EFFECTS:   'Network restructure takes 12–18 months. Slot recovery at congested airports (LHR, JFK, CDG) may require regulatory intervention.',
};

const DAYS_BASE: Record<AirlineNodeId, number> = {
  PASSENGER_DEMAND: 7,
  LOAD_FACTOR:      14,
  YIELD_MGT:        7,
  ANCILLARY:        21,
  CARGO:            14,
  FUEL_COST:        3,
  LABOR_COST:       7,
  DISTRIBUTION:     30,
  RASK:             30,
  CASK:             30,
  OPERATING_MARGIN: 45,
  NETWORK_EFFECTS:  60,
};

export function runAirlineCascade(
  triggerId: TriggerId
): Record<AirlineNodeId, AirlineImpact> {
  const trigger = AIRLINE_TRIGGERS[triggerId];
  const seeds = trigger.seeds;
  const DECAY = 0.72;
  const MAX_HOPS = 4;

  const raw: Partial<Record<AirlineNodeId, { value: number; hops: number; conf: number }>> = {};

  // Seed
  for (const [id, v] of Object.entries(seeds) as [AirlineNodeId, number][]) {
    raw[id] = { value: v, hops: 0, conf: 0.93 };
  }

  // BFS
  const queue = (Object.keys(seeds) as AirlineNodeId[]).slice();
  const visited = new Set<AirlineNodeId>();

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    const cur = raw[nodeId];
    if (!cur || cur.hops >= MAX_HOPS) continue;

    for (const edge of AIRLINE_EDGES.filter(e => e.from === nodeId)) {
      const propagated = cur.value * edge.weight * DECAY;
      const existing = raw[edge.to];
      if (!existing || Math.abs(propagated) > Math.abs(existing.value)) {
        raw[edge.to] = {
          value: propagated,
          hops: cur.hops + 1,
          conf: Math.max(0.30, cur.conf * (0.86 - cur.hops * 0.07)),
        };
        queue.push(edge.to);
      }
    }
  }

  // OPERATING_MARGIN special case: net RASK change minus net CASK change
  const raskV = raw['RASK']?.value ?? 0;
  const caskV = raw['CASK']?.value ?? 0;
  if (raskV !== 0 || caskV !== 0) {
    // RASK going down hurts margin; CASK going up hurts margin
    const marginMove = raskV - caskV;
    raw['OPERATING_MARGIN'] = {
      value: marginMove,
      hops: 2,
      conf: Math.min(
        raw['RASK']?.conf ?? 0.70,
        raw['CASK']?.conf ?? 0.70
      ),
    };
  }

  // Build final result
  const result = {} as Record<AirlineNodeId, AirlineImpact>;
  for (const id of Object.keys(AIRLINE_NODES) as AirlineNodeId[]) {
    const entry = raw[id];
    if (!entry || Math.abs(entry.value) < 0.01) {
      result[id] = { impact: 0, conf: 0, daysToEffect: 0, mechanism: '', recovery: '' };
    } else {
      result[id] = {
        impact: entry.value,
        conf: Math.min(0.97, Math.max(0.28, entry.conf)),
        daysToEffect: Math.round(DAYS_BASE[id] * (1 + entry.hops * 0.45)),
        mechanism: MECHANISMS[id],
        recovery: RECOVERY_HORIZONS[id],
      };
    }
  }

  return result;
}

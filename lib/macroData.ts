export interface Sector {
  id: string;
  label: string;
  color: string;
  trigger?: boolean;
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
  lag: number;
  dir: number;
  conf: number;
  region?: Record<string, number>;
  mechanism: string;
}

export interface TriggerDef {
  label: string;
  sub: string;
  icon: string;
  color: string;
  anchors?: { event: string; oil: string; equity: string; note: string }[];
  firstOrder: { sector: string; impact: number; lag: number; conf: number }[];
  soWhat: string;
}

export interface ImpactResult {
  impact: number;
  lag: number;
  conf: number;
  via: string | null;
  mechanism: string;
  circuitBreaker: boolean;
}

export const SECTORS: Record<string, Sector> = {
  GEOPOLITICS:     { id: 'GEOPOLITICS',     label: 'Geopolitics',          color: '#ff3b30', trigger: true },
  MONETARY_POLICY: { id: 'MONETARY_POLICY', label: 'Monetary Policy',       color: '#2979ff', trigger: true },
  OIL_ENERGY:      { id: 'OIL_ENERGY',      label: 'Oil & Energy',           color: '#ff9100' },
  EQUITY_MARKETS:  { id: 'EQUITY_MARKETS',  label: 'Equity Markets',         color: '#00e676' },
  CURRENCIES_FX:   { id: 'CURRENCIES_FX',   label: 'Currencies & FX',        color: '#40c4ff' },
  AVIATION_TRAVEL: { id: 'AVIATION_TRAVEL', label: 'Aviation & Travel',      color: '#00acc1' },
  COMMODITIES:     { id: 'COMMODITIES',     label: 'Commodities',             color: '#ffd740' },
  INSURANCE:       { id: 'INSURANCE',       label: 'Insurance',               color: '#7c4dff' },
  CREDIT_BANKING:  { id: 'CREDIT_BANKING',  label: 'Credit & Banking',       color: '#69f0ae' },
  EMPLOYMENT:      { id: 'EMPLOYMENT',      label: 'Employment',              color: '#ffb020' },
  ECOMMERCE:       { id: 'ECOMMERCE',       label: 'E-Commerce & Retail',    color: '#ff6d00' },
  CONSUMER:        { id: 'CONSUMER',        label: 'Consumer Spending',       color: '#ea80fc' },
  REAL_ESTATE:     { id: 'REAL_ESTATE',     label: 'Real Estate',             color: '#64dd17' },
};

// Edge weights calibrated via scripts/calibrate_edges.py against 23 historical shock events
// (Gulf War 1990 · SARS 2003 · Lehman 2008 · COVID 2020 · Ukraine 2022 · +18 others)
// Method: event-conditional correlation + long-run lagged cross-correlation, Yahoo Finance ETF data
// Trigger-node edges (GEOPOLITICS, MONETARY_POLICY) retain domain-authored values.
export const EDGES: Edge[] = [
  { from:'GEOPOLITICS',     to:'OIL_ENERGY',      weight:0.78, lag:0,  dir:1,  conf:0.90, region:{GLOBAL:1.0,MENA:1.8,APAC:1.2,EU:0.9,NA:0.7},  mechanism:'Middle East conflict disrupts supply routes; Strait of Hormuz risk premium applied immediately.' },
  { from:'GEOPOLITICS',     to:'EQUITY_MARKETS',  weight:0.65, lag:0,  dir:-1, conf:0.85, mechanism:'Risk-off sentiment triggers immediate equity sell-off; flight to bonds and gold.' },
  { from:'GEOPOLITICS',     to:'INSURANCE',       weight:0.72, lag:1,  dir:1,  conf:0.88, mechanism:'War risk premiums on marine and aviation overflight routes spike within hours.' },
  { from:'GEOPOLITICS',     to:'CURRENCIES_FX',   weight:0.55, lag:1,  dir:1,  conf:0.80, mechanism:'USD and CHF safe-haven buying; EM currencies sell off.' },
  { from:'MONETARY_POLICY', to:'EQUITY_MARKETS',  weight:0.60, lag:0,  dir:-1, conf:0.82, mechanism:'Higher discount rates reduce present value of future earnings; growth stocks most affected.' },
  { from:'MONETARY_POLICY', to:'CREDIT_BANKING',  weight:0.85, lag:7,  dir:1,  conf:0.90, mechanism:'Policy rate hikes transmit to interbank rates within 1–2 weeks.' },
  { from:'MONETARY_POLICY', to:'CURRENCIES_FX',   weight:0.70, lag:3,  dir:1,  conf:0.85, mechanism:'Rate differentials attract capital flows; domestic currency appreciates.' },
  { from:'MONETARY_POLICY', to:'REAL_ESTATE',     weight:0.70, lag:30, dir:-1, conf:0.80, mechanism:'Mortgage rates follow policy rates with ~30-day transmission lag.' },
  { from:'OIL_ENERGY',      to:'AVIATION_TRAVEL', weight:0.612, lag:14, dir:1,  conf:0.87, region:{GLOBAL:1.0,APAC:1.35,EU:0.90,MENA:1.55,NA:0.85}, mechanism:'Jet fuel = 23–28% of airline opex. Hedging contracts buffer 30–60 days.' },
  { from:'OIL_ENERGY',      to:'COMMODITIES',     weight:0.410, lag:7,  dir:1,  conf:0.66, mechanism:'Oil is primary input to fertiliser, plastics, and freight.' },
  { from:'OIL_ENERGY',      to:'INSURANCE',       weight:0.399, lag:7,  dir:1,  conf:0.64, mechanism:'Commercial motor and logistics insurance premiums track fuel cost inflation.' },
  { from:'OIL_ENERGY',      to:'CURRENCIES_FX',   weight:0.373, lag:3,  dir:1,  conf:0.60, mechanism:'Petrocurrencies (CAD, NOK, SAR) strengthen with oil.' },
  { from:'EQUITY_MARKETS',  to:'EMPLOYMENT',      weight:0.097, lag:60, dir:1,  conf:0.50, mechanism:'Market corrections trigger hiring freezes; layoffs follow 4–8 weeks later.' },
  { from:'EQUITY_MARKETS',  to:'REAL_ESTATE',     weight:0.210, lag:30, dir:1,  conf:0.50, mechanism:'Wealth effect and institutional REIT selling.' },
  { from:'EQUITY_MARKETS',  to:'CONSUMER',        weight:0.275, lag:21, dir:1,  conf:0.50, mechanism:'Negative wealth effect suppresses discretionary spending.' },
  { from:'CURRENCIES_FX',   to:'AVIATION_TRAVEL', weight:0.603, lag:14, dir:-1, conf:0.68, mechanism:'USD strengthening compresses EM airline revenue; cross-border fare arbitrage shifts.' },
  { from:'CURRENCIES_FX',   to:'ECOMMERCE',       weight:0.601, lag:14, dir:-1, conf:0.95, mechanism:'Weak domestic currency raises import costs; cross-border margins compress.' },
  { from:'CREDIT_BANKING',  to:'REAL_ESTATE',     weight:0.550, lag:30, dir:1,  conf:0.86, mechanism:'Tighter credit standards and higher mortgage rates constrain housing demand.' },
  { from:'CREDIT_BANKING',  to:'ECOMMERCE',       weight:0.567, lag:30, dir:-1, conf:0.90, mechanism:'Consumer credit tightening reduces revolving credit availability.' },
  { from:'CREDIT_BANKING',  to:'EMPLOYMENT',      weight:0.314, lag:45, dir:-1, conf:0.51, mechanism:'Credit contraction triggers business failures in leveraged sectors.' },
  { from:'COMMODITIES',     to:'CONSUMER',        weight:0.310, lag:21, dir:-1, conf:0.51, mechanism:'Food and energy inflation squeezes household disposable income.' },
  { from:'COMMODITIES',     to:'INSURANCE',       weight:0.494, lag:21, dir:1,  conf:0.78, mechanism:'Agricultural volatility drives crop insurance claims.' },
  { from:'AVIATION_TRAVEL', to:'EMPLOYMENT',      weight:0.602, lag:45, dir:1,  conf:0.72, mechanism:'Airline capacity cuts trigger crew layoffs; hotel and airport retail follow.' },
  { from:'AVIATION_TRAVEL', to:'CONSUMER',        weight:0.602, lag:30, dir:-1, conf:0.65, mechanism:'Higher airfares divert household spending from other categories.' },
  { from:'REAL_ESTATE',     to:'CREDIT_BANKING',  weight:0.402, lag:30, dir:1,  conf:0.63, mechanism:'Falling property values impair mortgage collateral; bank balance sheets deteriorate.' },
  { from:'REAL_ESTATE',     to:'EMPLOYMENT',      weight:0.319, lag:45, dir:1,  conf:0.52, mechanism:'Construction contraction leads housing sector unemployment.' },
  { from:'EMPLOYMENT',      to:'CONSUMER',        weight:0.364, lag:21, dir:1,  conf:0.58, mechanism:'Wage income is the primary driver of household spending.' },
  { from:'EMPLOYMENT',      to:'REAL_ESTATE',     weight:0.437, lag:60, dir:1,  conf:0.70, mechanism:'Sustained unemployment reduces housing demand and transaction volumes.' },
  { from:'CONSUMER',        to:'ECOMMERCE',       weight:0.341, lag:7,  dir:1,  conf:0.56, mechanism:'Online retail tracks consumer spending closely; 1-week purchasing cycle lag.' },
  { from:'CONSUMER',        to:'EMPLOYMENT',      weight:0.313, lag:45, dir:1,  conf:0.51, mechanism:'Retail and hospitality employment tied to consumer spending volumes.' },
  { from:'INSURANCE',       to:'CREDIT_BANKING',  weight:0.608, lag:30, dir:-1, conf:0.95, mechanism:'Large underwriting losses force insurers to liquidate investment portfolios.' },
];

export const TRIGGERS: Record<string, TriggerDef> = {
  WAR_CONFLICT: {
    label:'Armed Conflict', sub:'Middle East Escalation', icon:'⚔', color:'#ff3b30',
    anchors:[
      { event:'2022 Ukraine Invasion', oil:'+62%', equity:'-18%', note:'Brent hit $139 within 3 weeks' },
      { event:'1990 Gulf War',         oil:'+90%', equity:'-20%', note:'Recession followed within 6 months' },
      { event:'1973 OPEC Embargo',     oil:'+280%',equity:'-48%', note:'18-month bear market, stagflation' },
    ],
    firstOrder:[
      { sector:'GEOPOLITICS',    impact:1.00, lag:0, conf:0.95 },
      { sector:'OIL_ENERGY',     impact:0.62, lag:0, conf:0.90 },  // peak-shock calibrated: Gulf War +90%, Ukraine +62% within 3wk
      { sector:'EQUITY_MARKETS', impact:-0.18,lag:0, conf:0.85 },  // data-confirmed: 4-event mean −17.9%
      { sector:'CURRENCIES_FX',  impact:0.08, lag:1, conf:0.78 },
    ],
    soWhat:'Lock aviation and logistics fuel contracts within 14 days — the hedging window closes when carriers activate surcharges. Equity risk-off creates a 30–45 day re-entry window in quality names.',
  },
  OIL_SHOCK: {
    label:'Oil Price Shock', sub:'Supply Disruption +50%', icon:'🛢', color:'#ff9100',
    anchors:[
      { event:'2022 Russia Sanctions', oil:'+55%', equity:'-12%', note:'Energy equities outperformed by 40pp' },
      { event:'2011 Arab Spring',      oil:'+25%', equity:'-8%',  note:'Libya disruption; Brent hit $127' },
    ],
    firstOrder:[
      { sector:'OIL_ENERGY',    impact:0.55, lag:0, conf:0.92 },
      { sector:'CURRENCIES_FX', impact:0.10, lag:2, conf:0.75 },
      { sector:'COMMODITIES',   impact:0.30, lag:5, conf:0.78 },  // peak-calibrated; 90d return understates input-cost transmission
    ],
    soWhat:'Aviation and logistics budgets need immediate review. Consumer staples see margin compression within 3–4 weeks. Energy sector equities outperform; rotate defensive positioning.',
  },
  RATE_HIKE: {
    label:'Rate Hike Cycle', sub:'Central Bank +200bps', icon:'📊', color:'#2979ff',
    anchors:[
      { event:'2022–23 Fed Cycle',   oil:'+5%', equity:'-20%', note:'Fastest tightening since 1980; housing down 20%' },
      { event:'1994 Fed Tightening', oil:'+8%', equity:'-9%',  note:'Global bond market rout; EM currency crisis' },
    ],
    firstOrder:[
      { sector:'MONETARY_POLICY', impact:1.00, lag:0, conf:0.95 },
      { sector:'EQUITY_MARKETS',  impact:-0.15,lag:0, conf:0.82 },
      { sector:'CURRENCIES_FX',   impact:0.12, lag:3, conf:0.80 },
    ],
    soWhat:'Real estate exposure should be hedged before the 30-day mortgage repricing cycle completes. Growth equities face sustained multiple compression. Review floating-rate debt exposure.',
  },
  PANDEMIC: {
    label:'Pandemic / Health Crisis', sub:'Global Containment Response', icon:'🦠', color:'#7c4dff',
    anchors:[
      { event:'COVID-19 2020', oil:'-70%', equity:'-34%', note:'Aviation demand collapsed 98% in 6 weeks' },
      { event:'SARS 2003',     oil:'-15%', equity:'-14%', note:'Asian markets most affected; 6-month recovery' },
    ],
    firstOrder:[
      { sector:'AVIATION_TRAVEL', impact:-0.65,lag:7,  conf:0.88 },  // peak-calibrated: COVID -98% demand in 6wk; 60d end-return is V-recovery artifact
      { sector:'CONSUMER',        impact:-0.30,lag:14, conf:0.82 },
      { sector:'EQUITY_MARKETS',  impact:-0.35,lag:0,  conf:0.85 },
      { sector:'EMPLOYMENT',      impact:-0.25,lag:30, conf:0.78 },
    ],
    soWhat:'Aviation and hospitality face structural demand destruction for 12–18 months. E-commerce and healthcare see counter-cyclical surge. Commercial real estate repricing accelerates.',
  },
  SUPPLY_CHAIN: {
    label:'Supply Chain Breakdown', sub:'Global Logistics Disruption', icon:'🔗', color:'#ff6d00',
    anchors:[
      { event:'2021 Evergreen Blocking',  oil:'+3%', equity:'-2%', note:'Suez Canal: $9.6bn/day trade loss' },
      { event:'2021–22 Port Congestion',  oil:'+18%',equity:'+8%', note:'Inventory shortage drove 40-yr inflation high' },
    ],
    firstOrder:[
      { sector:'COMMODITIES', impact:0.40, lag:14, conf:0.82 },
      { sector:'ECOMMERCE',   impact:-0.22,lag:21, conf:0.78 },  // peak-calibrated; 90d return masks operational disruption depth
      { sector:'OIL_ENERGY',  impact:0.20, lag:7,  conf:0.72 },
    ],
    soWhat:'Inventory build strategies should activate immediately before shelf availability tightens. Domestic supplier diversification becomes urgent within 30 days.',
  },
  MARKET_CRASH: {
    label:'Equity Market Crash', sub:'Index Decline −30%+', icon:'📉', color:'#00e676',
    anchors:[
      { event:'2008 GFC',    oil:'-54%', equity:'-57%', note:'Credit freeze propagated to every sector in 90 days' },
      { event:'2000 Dot-com',oil:'-35%', equity:'-49%', note:'Tech-led; employment followed 18 months later' },
    ],
    firstOrder:[
      { sector:'EQUITY_MARKETS', impact:-0.30,lag:0, conf:0.92 },
      { sector:'CURRENCIES_FX',  impact:-0.08,lag:2, conf:0.72 },
      { sector:'CREDIT_BANKING', impact:-0.162,lag:7, conf:0.77 },  // data-calibrated impact (4-event mean); lag restored to structural 7d
    ],
    soWhat:'Hiring freezes typically activate within 60 days. Real estate transaction volumes fall first; prices follow with 3–6 month lag. Review covenant headroom on credit facilities.',
  },
};

export const CONTEXTS: Record<string, { label: string; desc: string; multipliers: Record<string, number> }> = {
  BASELINE:{ label:'Baseline', desc:'Normal economic conditions',
    multipliers:{ _default:1.0 } },
  STRESSED:{ label:'Stressed', desc:'Slowing growth, elevated inflation',
    multipliers:{ OIL_ENERGY:1.2, EMPLOYMENT:1.3, CONSUMER:1.25, CREDIT_BANKING:1.2, _default:1.1 } },
  CRISIS:  { label:'Crisis',   desc:'Recession, tight credit',
    multipliers:{ EMPLOYMENT:1.6, CONSUMER:1.5, CREDIT_BANKING:1.8, REAL_ESTATE:1.5, ECOMMERCE:1.4, _default:1.25 } },
};

export const INTENSITIES: Record<string, number> = {
  MODERATE: 0.6,
  SEVERE:   1.0,
  EXTREME:  1.5,
};

export const PERSONAS = [
  { id: 'logistics',          label: 'Logistics / Supply Chain', icon: '🚚' },
  { id: 'aviation',           label: 'Aviation / Travel',        icon: '✈' },
  { id: 'investment',         label: 'Investment Manager',        icon: '📈' },
  { id: 'retail',             label: 'Retail / E-Commerce',      icon: '🛍' },
  { id: 'startup',            label: 'Startup Founder',           icon: '🚀' },
  { id: 'risk',               label: 'Risk / Insurance',          icon: '🛡' },
  { id: 'cfo',                label: 'CFO / Finance Director',    icon: '💼' },
  { id: 'jobseeker_it',       label: 'Job Seeker · Tech',         icon: '💻', jobSeeker: true },
  { id: 'jobseeker_banking',  label: 'Job Seeker · Banking',      icon: '🏦', jobSeeker: true },
  { id: 'jobseeker_logistics',label: 'Job Seeker · Logistics',    icon: '📦', jobSeeker: true },
  { id: 'jobseeker_retail',   label: 'Job Seeker · Retail',       icon: '🏪', jobSeeker: true },
];

export interface LiveMarket {
  vix?: number;
  oilChange?: number;   // fraction — 0.04 = oil up 4% today
  sp500Change?: number; // fraction — -0.02 = equities down 2% today
}

/** VIX → cascade amplifier.
 *  High VIX = markets are fearful = contagion spreads harder and faster.
 *  Low VIX = complacency = shocks absorb more slowly. */
function vixCascadeMult(vix: number): number {
  if (vix < 15) return 0.82;   // Complacent — shocks less contagious
  if (vix < 20) return 1.0;    // Normal baseline
  if (vix < 25) return 1.12;   // Slightly elevated
  if (vix < 30) return 1.28;   // Stressed — fear is spreading
  if (vix < 40) return 1.45;   // Fearful — amplified contagion
  return 1.65;                  // Panic — cascades run hard
}

/** If a sector is ALREADY moving in the shock direction today,
 *  part of the impact is already priced in — dampen the first-order hit. */
function pricedInDampening(triggerImpact: number, liveMove: number | undefined): number {
  if (!liveMove || Math.sign(liveMove) !== Math.sign(triggerImpact)) return triggerImpact;
  // Same direction — market partly absorbed it. Max 25% dampening.
  const damp = Math.min(0.25, Math.abs(liveMove) * 3);
  return triggerImpact * (1 - damp);
}

/** Which triggers are live-relevant given today's market data. */
export function autoSuggestTriggers(market: LiveMarket): string[] {
  const { vix = 18, oilChange = 0, sp500Change = 0 } = market;
  const suggestions = new Set<string>();
  if (vix > 28)                              suggestions.add('MARKET_CRASH');
  if (sp500Change < -0.02)                   suggestions.add('MARKET_CRASH');
  if (Math.abs(oilChange) > 0.03)            suggestions.add('OIL_SHOCK');
  if (vix > 32 && Math.abs(oilChange) > 0.02) suggestions.add('WAR_CONFLICT');
  return [...suggestions];
}

export function runSimulation(
  triggerIds: string[],
  intensityKey: string,
  contextKey: string,
  regionKey: string,
  liveMarket?: LiveMarket,
): Record<string, ImpactResult> {
  const intensity = INTENSITIES[intensityKey] ?? 1.0;
  const context   = CONTEXTS[contextKey]   ?? CONTEXTS.BASELINE;
  const impacts: Record<string, ImpactResult> = {};
  const queue: Array<{
    sector: string; impact: number; lag: number; conf: number;
    depth: number; via: string | null; mechanism: string;
  }> = [];

  const MAX_DEPTH = 5, MIN_IMPACT = 0.02, CIRCUIT_BREAKER = 0.85;

  // Live calibration factors derived from today's market data
  const vix         = liveMarket?.vix ?? 18;
  const cascadeMult = vixCascadeMult(vix);
  const liveOil     = liveMarket?.oilChange;
  const liveSP      = liveMarket?.sp500Change;

  // Seed live market baseline — what's already moving today before the shock hits
  if (liveOil && Math.abs(liveOil) > MIN_IMPACT) {
    queue.push({
      sector: 'OIL_ENERGY', impact: liveOil, lag: 0, conf: 0.95, depth: 0, via: null,
      mechanism: `Live market: oil already ${liveOil > 0 ? 'up' : 'down'} ${(Math.abs(liveOil) * 100).toFixed(1)}% today — pre-loaded as baseline.`,
    });
  }
  if (liveSP && Math.abs(liveSP) > MIN_IMPACT) {
    queue.push({
      sector: 'EQUITY_MARKETS', impact: liveSP, lag: 0, conf: 0.95, depth: 0, via: null,
      mechanism: `Live market: equities already ${liveSP > 0 ? 'up' : 'down'} ${(Math.abs(liveSP) * 100).toFixed(1)}% today — pre-loaded as baseline.`,
    });
  }

  // Trigger first-order impacts — dampened if sector already priced in
  triggerIds.forEach(tid => {
    const trig = TRIGGERS[tid];
    if (!trig) return;
    trig.firstOrder.forEach(fo => {
      const liveMove = fo.sector === 'OIL_ENERGY' ? liveOil
                     : fo.sector === 'EQUITY_MARKETS' ? liveSP
                     : undefined;
      const rawImpact   = fo.impact * intensity;
      const adjForLive  = pricedInDampening(rawImpact, liveMove);
      queue.push({
        sector: fo.sector, impact: adjForLive,
        lag: fo.lag, conf: fo.conf, depth: 0, via: null,
        mechanism: trig.label + ' — direct first-order shock'
          + (adjForLive !== rawImpact ? ` (dampened ${((1 - adjForLive / rawImpact) * 100).toFixed(0)}% — already partially priced in today)` : ''),
      });
    });
  });

  // BFS propagation — cascade impacts amplified/dampened by VIX
  const seen = new Set<string>();
  let idx = 0;
  while (idx < queue.length) {
    const node = queue[idx++];
    const key  = `${node.sector}@${node.depth}`;
    if (seen.has(key) || node.depth > MAX_DEPTH || Math.abs(node.impact) < MIN_IMPACT) continue;
    seen.add(key);

    const ctxMult   = context.multipliers[node.sector] ?? context.multipliers._default ?? 1.0;
    // VIX multiplier only on cascades (depth > 0) — first-order impacts are anchored historically
    const vixAdj    = node.depth > 0 ? cascadeMult : 1.0;
    const adjImpact = node.impact * ctxMult * vixAdj;
    const cb        = Math.abs(adjImpact) > CIRCUIT_BREAKER;

    if (!impacts[node.sector] || Math.abs(adjImpact) > Math.abs(impacts[node.sector].impact)) {
      impacts[node.sector] = {
        impact: adjImpact, lag: node.lag, conf: node.conf,
        via: node.via, mechanism: node.mechanism, circuitBreaker: cb,
      };
    }
    if (cb) continue;

    EDGES.filter(e => e.from === node.sector).forEach(edge => {
      const regMult = (edge.region?.[regionKey]) ?? 1.0;
      queue.push({
        sector:    edge.to,
        impact:    adjImpact * edge.weight * edge.dir * regMult,
        lag:       node.lag + edge.lag,
        conf:      node.conf * edge.conf,
        depth:     node.depth + 1,
        via:       node.sector,
        mechanism: edge.mechanism,
      });
    });
  }
  return impacts;
}

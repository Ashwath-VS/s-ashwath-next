import { NextResponse } from 'next/server';

export const revalidate = 900; // 15-minute cache

const RSS_FEEDS = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
];

const KEYWORDS: Record<string, string[]> = {
  WAR_CONFLICT: [
    'war', 'conflict', 'military strike', 'attack', 'sanctions',
    'invasion', 'ceasefire', 'missile', 'troops', 'combat', 'nuclear',
    'ukraine', 'russia', 'israel', 'gaza', 'iran', 'nato', 'airstrike',
    'weapons', 'geopolitical', 'armed forces', 'offensive', 'hostilities',
  ],
  OIL_SHOCK: [
    'oil price', 'crude oil', 'opec', 'energy crisis', 'fuel prices',
    'refinery', 'pipeline', 'brent crude', 'wti', 'petroleum',
    'lng', 'gas prices', 'energy supply', 'oil supply',
  ],
  RATE_HIKE: [
    'federal reserve', 'fed rate', 'interest rate', 'rate hike', 'rate rise',
    'rate cut', 'central bank', 'inflation', 'monetary policy',
    'tightening', 'ecb', 'bank of england', 'powell', 'lagarde',
    'basis points', 'cpi', 'core inflation', 'price pressures',
  ],
  PANDEMIC: [
    'outbreak', 'virus', 'pandemic', 'epidemic', 'disease outbreak',
    'health emergency', 'lockdown', 'quarantine', 'mpox', 'covid',
    'who declares', 'public health', 'pathogen', 'contagion',
  ],
  SUPPLY_CHAIN: [
    'supply chain', 'shipping disruption', 'port congestion', 'logistics',
    'freight rates', 'container shortage', 'semiconductor shortage',
    'chip shortage', 'suez canal', 'strait of hormuz', 'trade disruption',
    'inventory shortage', 'factory shutdown',
  ],
  MARKET_CRASH: [
    'market crash', 'stock market falls', 'recession', 'debt crisis',
    'sovereign default', 'financial crisis', 'market sell-off',
    'bear market', 'market plunge', 'credit crunch', 'banking crisis',
    'market rout', 'financial contagion', 'economic downturn',
  ],
};

interface NewsItem { title: string; }

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRx = /<item[\s\S]*?<\/item>/gi;
  const titleRx = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
  let m: RegExpExecArray | null;
  while ((m = itemRx.exec(xml)) !== null) {
    const t = titleRx.exec(m[0]);
    if (t?.[1]) {
      items.push({ title: t[1].replace(/<[^>]+>/g, '').trim() });
    }
  }
  return items;
}

export async function GET() {
  const allItems: NewsItem[] = [];

  await Promise.allSettled(
    RSS_FEEDS.map(async (url) => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 900 },
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) allItems.push(...parseRss(await res.text()));
      } catch { /* feed unavailable — skip */ }
    })
  );

  // Deduplicate by first 50 chars
  const seen = new Set<string>();
  const unique = allItems.filter(({ title }) => {
    const key = title.slice(0, 50).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const triggers: Record<string, { headlines: string[]; signal: number }> = {};

  for (const [id, keywords] of Object.entries(KEYWORDS)) {
    const matches = unique
      .filter(({ title }) => {
        const lower = title.toLowerCase();
        return keywords.some(kw => lower.includes(kw));
      })
      .slice(0, 3);

    triggers[id] = {
      headlines: matches.map(m => m.title),
      signal: matches.length === 0 ? 0 : matches.length === 1 ? 0.34 : matches.length === 2 ? 0.67 : 1.0,
    };
  }

  return NextResponse.json({
    triggers,
    total: unique.length,
    live: unique.length > 0,
    fetchedAt: new Date().toISOString(),
  });
}

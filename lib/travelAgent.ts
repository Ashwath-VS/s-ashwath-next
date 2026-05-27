export const IATA = new Set([
  'ATL','AUS','BNA','BOS','BWI','CLT','CMH','DAL','DCA','DEN','DFW','DTW','EWR','HOU',
  'HNL','IAD','IAH','IND','JFK','LAS','LAX','LGA','MCI','MCO','MDW','MEM','MIA','MKE',
  'MSP','MSY','OAK','OGG','OMA','ORD','PDX','PHL','PHX','PIT','RDU','SAN','SAT','SEA',
  'SFO','SJC','SJU','SLC','SNA','SMF','STL','TPA','TUS','YEG','YHZ','YOW','YUL','YVR',
  'YYC','YYZ','CUN','GDL','MEX','MTY','PTY','SJO',
  'AGP','AMS','ARN','ATH','BCN','BEG','BER','BHX','BIO','BRU','BUD','CDG','CPH','DUB',
  'DUS','EDI','FCO','FRA','GVA','HAM','HEL','IST','KRK','LGW','LHR','LIS','LJU','LYS',
  'MAD','MAN','MRS','MUC','MXP','NAP','NCE','OTP','OSL','PMO','PRG','SAW','SKP','SOF',
  'STN','SVQ','TXL','VCE','VIE','VLC','WAW','ZAG','ZRH',
  'ADE','AMM','AUH','BAH','BEY','BGW','DOH','DXB','JED','KWI','MCT','RUH','TLV',
  'ABV','ACC','ADD','CAI','CMN','CPT','DAR','EBB','JNB','KRT','LOS','MRU','NBO','TNR',
  'AMD','BLR','BOM','CCU','CMB','COK','DAC','DEL','HYD','ISB','KHI','KTM','LHE','MAA','TRV',
  'BDO','BKK','CAN','CGK','CKG','CTS','CTU','DMK','DPS','FUK','GMP','HAK','HKG','HND',
  'ICN','KIX','KMG','KUL','MNL','NGO','NNG','NRT','OKA','PEK','PKX','PVG','SIN','SUB',
  'SZX','TSN','UPG','WUH','XIY','XMN',
  'ADL','AKL','BNE','CBR','CHC','CNS','DRW','GUM','MEL','NAN','OOL','PER','PPT','SYD','WLG',
  'AEP','ASU','BOG','BSB','CCS','EZE','FOR','GIG','GRU','GYE','LIM','LPB','MDE','MVD',
  'POA','SCL','SSA','UIO','VCP',
  'ALA','EVN','GYD','TAS','TBS','TSE',
]);

type APEntry = [string, string];
const AP: Record<string, APEntry> = {
  ATL:['US','US'],AUS:['US','US'],BNA:['US','US'],BOS:['US','US'],BWI:['US','US'],
  CLT:['US','US'],CMH:['US','US'],DAL:['US','US'],DCA:['US','US'],DEN:['US','US'],
  DFW:['US','US'],DTW:['US','US'],EWR:['US','US'],HNL:['US','US'],HOU:['US','US'],
  IAD:['US','US'],IAH:['US','US'],IND:['US','US'],JFK:['US','US'],LAS:['US','US'],
  LAX:['US','US'],LGA:['US','US'],MCI:['US','US'],MCO:['US','US'],MDW:['US','US'],
  MEM:['US','US'],MIA:['US','US'],MKE:['US','US'],MSP:['US','US'],MSY:['US','US'],
  OAK:['US','US'],OGG:['US','US'],OMA:['US','US'],ORD:['US','US'],PDX:['US','US'],
  PHL:['US','US'],PHX:['US','US'],PIT:['US','US'],RDU:['US','US'],SAN:['US','US'],
  SAT:['US','US'],SEA:['US','US'],SFO:['US','US'],SJC:['US','US'],SJU:['US','US'],
  SLC:['US','US'],SNA:['US','US'],SMF:['US','US'],STL:['US','US'],TPA:['US','US'],TUS:['US','US'],
  YEG:['CA','CA'],YHZ:['CA','CA'],YOW:['CA','CA'],YUL:['CA','CA'],
  YVR:['CA','CA'],YYC:['CA','CA'],YYZ:['CA','CA'],
  CUN:['MX','LAT'],GDL:['MX','LAT'],MEX:['MX','LAT'],MTY:['MX','LAT'],
  PTY:['PA','LAT'],SJO:['CR','LAT'],
  BHX:['GB','EU'],EDI:['GB','EU'],LGW:['GB','EU'],LHR:['GB','EU'],MAN:['GB','EU'],STN:['GB','EU'],
  AMS:['NL','EU'],BRU:['BE','EU'],DUB:['IE','EU'],
  CDG:['FR','EU'],LYS:['FR','EU'],MRS:['FR','EU'],NCE:['FR','EU'],
  BER:['DE','EU'],DUS:['DE','EU'],FRA:['DE','EU'],HAM:['DE','EU'],MUC:['DE','EU'],TXL:['DE','EU'],
  AGP:['ES','EU'],BCN:['ES','EU'],BIO:['ES','EU'],MAD:['ES','EU'],SVQ:['ES','EU'],VLC:['ES','EU'],
  FCO:['IT','EU'],MXP:['IT','EU'],NAP:['IT','EU'],PMO:['IT','EU'],VCE:['IT','EU'],
  LIS:['PT','EU'],GVA:['CH','EU'],ZRH:['CH','EU'],VIE:['AT','EU'],
  CPH:['DK','EU'],OSL:['NO','EU'],ARN:['SE','EU'],HEL:['FI','EU'],ATH:['GR','EU'],
  WAW:['PL','EU'],KRK:['PL','EU'],PRG:['CZ','EU'],BUD:['HU','EU'],
  OTP:['RO','EU'],SOF:['BG','EU'],BEG:['RS','EU'],ZAG:['HR','EU'],LJU:['SI','EU'],SKP:['MK','EU'],
  IST:['TR','EU'],SAW:['TR','EU'],
  ADE:['YE','ME'],AMM:['JO','ME'],AUH:['AE','ME'],BAH:['BH','ME'],BEY:['LB','ME'],
  BGW:['IQ','ME'],DOH:['QA','ME'],DXB:['AE','ME'],JED:['SA','ME'],KWI:['KW','ME'],
  MCT:['OM','ME'],RUH:['SA','ME'],TLV:['IL','ME'],
  ABV:['NG','AF'],ACC:['GH','AF'],ADD:['ET','AF'],CAI:['EG','AF'],CMN:['MA','AF'],
  CPT:['ZA','AF'],DAR:['TZ','AF'],EBB:['UG','AF'],JNB:['ZA','AF'],KRT:['SD','AF'],
  LOS:['NG','AF'],MRU:['MU','AF'],NBO:['KE','AF'],TNR:['MG','AF'],
  AMD:['IN','IN'],BLR:['IN','IN'],BOM:['IN','IN'],CCU:['IN','IN'],COK:['IN','IN'],
  DEL:['IN','IN'],HYD:['IN','IN'],MAA:['IN','IN'],TRV:['IN','IN'],
  CMB:['LK','SA'],DAC:['BD','SA'],ISB:['PK','SA'],KHI:['PK','SA'],KTM:['NP','SA'],LHE:['PK','SA'],
  CAN:['CN','EA'],CKG:['CN','EA'],CTU:['CN','EA'],HAK:['CN','EA'],KMG:['CN','EA'],
  NNG:['CN','EA'],PEK:['CN','EA'],PKX:['CN','EA'],PVG:['CN','EA'],SZX:['CN','EA'],
  TSN:['CN','EA'],WUH:['CN','EA'],XIY:['CN','EA'],XMN:['CN','EA'],HKG:['HK','EA'],
  CTS:['JP','EA'],FUK:['JP','EA'],HND:['JP','EA'],KIX:['JP','EA'],
  NGO:['JP','EA'],NRT:['JP','EA'],OKA:['JP','EA'],
  GMP:['KR','EA'],ICN:['KR','EA'],
  BDO:['ID','SEA'],CGK:['ID','SEA'],DPS:['ID','SEA'],SUB:['ID','SEA'],UPG:['ID','SEA'],
  BKK:['TH','SEA'],DMK:['TH','SEA'],KUL:['MY','SEA'],SIN:['SG','SEA'],MNL:['PH','SEA'],
  ADL:['AU','OC'],BNE:['AU','OC'],CBR:['AU','OC'],CNS:['AU','OC'],DRW:['AU','OC'],
  MEL:['AU','OC'],OOL:['AU','OC'],PER:['AU','OC'],SYD:['AU','OC'],
  AKL:['NZ','OC'],CHC:['NZ','OC'],WLG:['NZ','OC'],GUM:['GU','OC'],NAN:['FJ','OC'],PPT:['PF','OC'],
  AEP:['AR','SAM'],ASU:['PY','SAM'],BOG:['CO','SAM'],BSB:['BR','SAM'],CCS:['VE','SAM'],
  EZE:['AR','SAM'],FOR:['BR','SAM'],GIG:['BR','SAM'],GRU:['BR','SAM'],GYE:['EC','SAM'],
  LIM:['PE','SAM'],LPB:['BO','SAM'],MDE:['CO','SAM'],MVD:['UY','SAM'],POA:['BR','SAM'],
  SCL:['CL','SAM'],SSA:['BR','SAM'],UIO:['EC','SAM'],VCP:['BR','SAM'],
  ALA:['KZ','CAU'],EVN:['AM','CAU'],GYD:['AZ','CAU'],TAS:['UZ','CAU'],TBS:['GE','CAU'],TSE:['KZ','CAU'],
};

type RouteInfo = { carriers: string[]; hubs: string[] };

export function routeInfo(orig: string, dest: string): RouteInfo {
  const om = AP[orig], dm = AP[dest];
  if (!om || !dm) return { carriers:['BA','QR','EK','SQ','LH'], hubs:['LHR','DXB','DOH','SIN','FRA'] };
  if (om[0] === dm[0]) {
    const dom: Record<string, RouteInfo> = {
      IN: { carriers:['AI','6E','SG','UK','G8'],    hubs:['BOM','DEL','HYD','MAA','BLR'] },
      US: { carriers:['AA','UA','DL','WN','B6'],    hubs:['ORD','DFW','ATL','DEN','MSP'] },
      AU: { carriers:['QF','VA','JQ'],              hubs:['SYD','MEL','BNE','PER'] },
      CN: { carriers:['CA','CZ','MU','HU'],         hubs:['PEK','PVG','CAN','CTU'] },
      JP: { carriers:['NH','JL'],                   hubs:['NRT','HND','KIX'] },
      BR: { carriers:['G3','AD','LA'],              hubs:['GRU','BSB','SSA'] },
      CA: { carriers:['AC','WS'],                   hubs:['YYZ','YVR','YYC'] },
    };
    return dom[om[0]] || { carriers:['AI','AA','BA'], hubs:[orig, dest] };
  }
  const rA = om[1], rB = dm[1];
  const key = [rA, rB].sort().join('-');
  const table: Record<string, RouteInfo> = {
    'EU-EU':  { carriers:['BA','LH','AF','IB','SK','AY'],   hubs:['LHR','FRA','AMS','CDG','MUC','ZRH'] },
    'EU-ME':  { carriers:['EK','QR','TK','LH','BA','MS'],   hubs:['DXB','DOH','IST','CAI','FRA'] },
    'EU-IN':  { carriers:['AI','BA','LH','VS','QR','EK'],   hubs:['LHR','FRA','DXB','DOH','AMS'] },
    'EU-SA':  { carriers:['PK','TK','QR','EK','LH'],        hubs:['IST','DXB','DOH','FRA','LHR'] },
    'EU-EA':  { carriers:['BA','LH','AF','CX','CA','JL'],   hubs:['LHR','FRA','AMS','HKG','PVG'] },
    'EU-SEA': { carriers:['BA','LH','SQ','TG','QR','EK'],   hubs:['LHR','FRA','SIN','DXB','DOH'] },
    'EU-OC':  { carriers:['QF','BA','SQ','EK','LH'],        hubs:['SIN','DXB','LHR','HKG','DOH'] },
    'EU-AF':  { carriers:['AF','LH','BA','ET','AT'],        hubs:['CDG','FRA','LHR','ADD','CMN'] },
    'EU-SAM': { carriers:['IB','LA','AF','KL','BA'],        hubs:['MAD','CDG','LHR','MIA','BOG'] },
    'EU-US':  { carriers:['AA','UA','DL','BA','LH','AF'],   hubs:['LHR','FRA','AMS','CDG','JFK'] },
    'EU-CA':  { carriers:['AC','BA','LH','AF'],             hubs:['LHR','YYZ','FRA','CDG'] },
    'EU-CAU': { carriers:['TK','LH','QR','KC'],             hubs:['IST','FRA','DOH','ALA'] },
    'EU-LAT': { carriers:['IB','AA','AF','LH'],             hubs:['MAD','MIA','CDG','LHR'] },
    'ME-ME':  { carriers:['EK','QR','EY','GF','RJ'],        hubs:['DXB','DOH','AUH','AMM'] },
    'ME-IN':  { carriers:['EK','QR','EY','AI','IX','FZ'],   hubs:['DXB','DOH','AUH','MCT'] },
    'ME-SA':  { carriers:['EK','QR','EY','PK','SV'],        hubs:['DXB','DOH','AUH','BAH'] },
    'ME-EA':  { carriers:['EK','QR','CX','SQ','KE'],        hubs:['DXB','DOH','SIN','HKG'] },
    'ME-SEA': { carriers:['EK','QR','SQ','MH','FZ'],        hubs:['DXB','SIN','KUL','DOH'] },
    'ME-OC':  { carriers:['EK','QF','SQ'],                  hubs:['DXB','SIN','SYD'] },
    'ME-AF':  { carriers:['EK','ET','MS','QR','KQ'],        hubs:['DXB','ADD','CAI','DOH'] },
    'ME-US':  { carriers:['AA','UA','EK','QR'],             hubs:['LHR','FRA','DXB','DOH'] },
    'ME-SAM': { carriers:['EK','QR','LA','AA'],             hubs:['DXB','MIA','GRU','DOH'] },
    'ME-CAU': { carriers:['FZ','QR','EK','KC'],             hubs:['DXB','DOH','IST','ALA'] },
    'ME-CA':  { carriers:['EK','QR','AC'],                  hubs:['DXB','DOH','YYZ'] },
    'ME-LAT': { carriers:['EK','QR','AA'],                  hubs:['DXB','DOH','MIA'] },
    'IN-SA':  { carriers:['AI','SL','BG','QR'],             hubs:['BOM','DEL','CMB','DOH'] },
    'IN-EA':  { carriers:['AI','SQ','CX','NH','MH'],        hubs:['SIN','HKG','BKK','BOM'] },
    'IN-SEA': { carriers:['AI','SQ','MH','TG','AK'],        hubs:['SIN','KUL','BKK','DEL'] },
    'IN-OC':  { carriers:['QF','SQ','EK','AI'],             hubs:['SIN','DXB','KUL','BOM'] },
    'IN-AF':  { carriers:['ET','EK','AI','QR','KQ'],        hubs:['ADD','DXB','BOM','DOH'] },
    'IN-US':  { carriers:['AI','UA','AA','BA','EK','QR'],   hubs:['LHR','FRA','DXB','DOH','JFK'] },
    'IN-SAM': { carriers:['EK','QR','AI','LH'],             hubs:['DXB','LHR','GRU','DOH'] },
    'IN-CA':  { carriers:['AI','AC','EK'],                  hubs:['LHR','YYZ','DXB'] },
    'IN-LAT': { carriers:['EK','QR','AA'],                  hubs:['DXB','MIA','DOH'] },
    'IN-CAU': { carriers:['AI','EK','QR'],                  hubs:['DXB','DEL','DOH'] },
    'EA-EA':  { carriers:['CA','CZ','MU','NH','JL','KE'],   hubs:['PVG','PEK','NRT','ICN','HKG'] },
    'EA-SEA': { carriers:['SQ','CX','TG','MH','CZ','KE'],  hubs:['SIN','HKG','BKK','KUL'] },
    'EA-OC':  { carriers:['QF','CX','SQ','JL','NH'],        hubs:['SYD','HKG','SIN','NRT'] },
    'EA-AF':  { carriers:['ET','CX','EK','QR','KQ'],        hubs:['ADD','HKG','DXB','NBO'] },
    'EA-US':  { carriers:['AA','UA','DL','CX','JL','NH','KE'], hubs:['NRT','ICN','SFO','LAX','HKG'] },
    'EA-SAM': { carriers:['LA','AA','CX','NH'],             hubs:['LAX','MIA','HKG','NRT'] },
    'EA-CA':  { carriers:['AC','AA','UA','CX'],             hubs:['YVR','NRT','ICN','HKG'] },
    'SEA-SEA': { carriers:['SQ','MH','TG','GA','PR'],       hubs:['SIN','KUL','BKK','CGK'] },
    'SEA-OC': { carriers:['QF','SQ','JQ','MH'],            hubs:['SYD','SIN','MEL','KUL'] },
    'SEA-AF': { carriers:['ET','EK','SQ','QR'],             hubs:['ADD','DXB','SIN','NBO'] },
    'SEA-US': { carriers:['UA','DL','SQ','CX'],             hubs:['NRT','ICN','SIN','HNL'] },
    'SEA-SAM': { carriers:['AA','LA','SQ'],                 hubs:['MIA','LAX','SIN'] },
    'SEA-CA': { carriers:['AC','SQ','UA'],                  hubs:['YVR','SIN','NRT'] },
    'OC-OC':  { carriers:['QF','VA','NZ','JQ'],            hubs:['SYD','MEL','AKL','BNE'] },
    'OC-AF':  { carriers:['QF','ET','EK','SQ'],            hubs:['DXB','SIN','ADD','SYD'] },
    'OC-US':  { carriers:['UA','QF','AA','NZ'],            hubs:['SYD','LAX','AKL','HNL'] },
    'OC-SAM': { carriers:['LA','QF','AA'],                 hubs:['LAX','SYD','SCL'] },
    'OC-CA':  { carriers:['AC','QF','NZ'],                 hubs:['YVR','SYD','AKL'] },
    'AF-AF':  { carriers:['ET','KQ','SA','MS','AT'],        hubs:['ADD','NBO','JNB','CAI','CMN'] },
    'SAM-SAM': { carriers:['LA','G3','AV','CM','AD'],       hubs:['GRU','BOG','SCL','LIM','EZE'] },
    'US-SAM': { carriers:['AA','UA','DL','LA','AV'],        hubs:['MIA','IAH','JFK','BOG','SCL'] },
    'US-AF':  { carriers:['DL','UA','ET','SA'],             hubs:['ADD','JNB','CDG','LHR'] },
    'US-OC':  { carriers:['UA','QF','AA','NZ'],             hubs:['SYD','LAX','AKL','HNL'] },
    'US-CA':  { carriers:['AC','AA','UA','DL'],             hubs:['YYZ','JFK','ORD','YVR'] },
    'US-CAU': { carriers:['TK','UA','LH'],                  hubs:['IST','FRA','JFK'] },
    'US-LAT': { carriers:['AA','UA','AM','DL'],             hubs:['MIA','IAH','MEX','JFK'] },
    'CA-SAM': { carriers:['AC','AA','LA'],                  hubs:['YYZ','MIA','GRU'] },
    'CA-LAT': { carriers:['AC','AA','AM'],                  hubs:['YYZ','MIA','MEX'] },
    'SAM-AF': { carriers:['ET','LA','AF'],                  hubs:['ADD','GRU','CDG'] },
  };
  return table[key] || { carriers:['BA','QR','EK','SQ','LH'], hubs:['LHR','DXB','DOH','SIN','FRA'] };
}

export function seed(a: string, b: string, c: string): number {
  const s = (a + b + c).toUpperCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

export interface FareResult {
  days: number; gdsFare: number; ndcFare: number; bestFare: number;
  grossSavings: number; changeFee: number; netSavings: number;
  netPct: number; grossPct: number; recommendation: string; signal: string;
  mktMove: number; seatAvail: boolean; fare: number;
  origin: string; destination: string; travelClass: string;
}

export function analyseFare(origin: string, destination: string, travelClass: string, bookedFare: string, travelDate: string): FareResult {
  const fare = parseFloat(bookedFare);
  const dep = new Date(travelDate); dep.setHours(12, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.ceil((dep.getTime() - now.getTime()) / 86400000));
  const s1 = seed(origin, destination, travelClass);
  const s2 = seed(destination, origin, travelClass + '2');
  const dirBias = days >= 60 ? -0.22 : days >= 30 ? -0.08 : days >= 14 ? 0.10 : 0.28;
  const rawMove = (s1 - 0.5) * 0.58 + dirBias;
  const mktMove = Math.max(-0.36, Math.min(0.32, rawMove));
  const gdsFare = Math.round(fare * (1 + mktMove));
  const ndcGap: Record<string, number> = { 'Business': 0.14, 'First': 0.12, 'Premium Economy': 0.09, 'Economy': 0.06 };
  const ndcFare = Math.round(Math.min(gdsFare, fare) * (1 - (ndcGap[travelClass] || 0.06)));
  const bestFare = Math.min(gdsFare, ndcFare);
  const seatAvail = s2 < 0.70;
  const feeBands: Record<string, [number, number]> = { 'Economy': [180,320], 'Premium Economy': [120,240], 'Business': [0,150], 'First': [0,100] };
  const [fLow, fHigh] = feeBands[travelClass] || [180, 320];
  const changeFee = Math.round(fLow + s1 * (fHigh - fLow));
  const grossSavings = Math.max(0, fare - bestFare);
  const netSavings = seatAvail ? Math.max(0, grossSavings - changeFee) : 0;
  const netPct = fare > 0 ? (netSavings / fare) * 100 : 0;
  const grossPct = fare > 0 ? (grossSavings / fare) * 100 : 0;
  let recommendation: string, signal: string;
  if (days < 5) { recommendation = 'HOLD'; signal = 'DEPARTURE_IMMINENT'; }
  else if (mktMove > 0.04 && grossSavings === 0) { recommendation = 'HOLD'; signal = 'FARE_APPRECIATED'; }
  else if (!seatAvail && grossSavings > 0) { recommendation = 'HOLD'; signal = 'LOWER_CLASS_UNAVAILABLE'; }
  else if (netSavings > 0 && netPct >= 10) { recommendation = 'REBOOK'; signal = 'NET_POSITIVE'; }
  else if (grossSavings > 0 && grossPct >= 5 && netPct >= 3) { recommendation = 'WATCH'; signal = 'EMERGING_OPPORTUNITY'; }
  else if (grossSavings === 0 || mktMove > 0) { recommendation = 'HOLD'; signal = 'NO_CURRENT_GAP'; }
  else { recommendation = 'HOLD'; signal = 'FEE_BLOCKS'; }
  return { days, gdsFare, ndcFare, bestFare, grossSavings, changeFee, netSavings, netPct, grossPct, recommendation, signal, mktMove, seatAvail, fare, origin: origin.toUpperCase(), destination: destination.toUpperCase(), travelClass };
}

const fmt = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
const pct = (n: number) => Math.abs(Math.round(n)) + '%';

export function buildFareFlags(b: FareResult): string[] {
  const flags: string[] = [];
  if (b.days >= 45 && b.days <= 75)
    flags.push(`${b.days}-day advance window — prime zone for fare movement on long-haul routes; monitoring scan frequency elevated`);
  if ((b.travelClass === 'Business' || b.travelClass === 'First') && b.changeFee < 100)
    flags.push(`${b.travelClass} ticket shows low change fee (${fmt(b.changeFee)}) — reissue economics highly favourable if a gap opens`);
  if (!b.seatAvail && b.grossSavings > 0)
    flags.push(`Lower fare class exists but inventory is sold out — monitoring will alert on availability restoral`);
  if (b.mktMove > 0.06)
    flags.push(`Market has moved up ${pct(b.mktMove * 100)} since booking — your fare is currently below available inventory levels`);
  if (b.netSavings > 400)
    flags.push(`Net saving of ${fmt(b.netSavings)} exceeds the typical action threshold — worth actioning before inventory closes`);
  if (b.days < 14 && b.days >= 5 && b.recommendation !== 'HOLD')
    flags.push(`Sub-14 day window — verify reissue conditions with the carrier; availability changes rapidly at this range`);
  if (b.fare >= 1500 && (b.travelClass === 'Economy' || b.travelClass === 'Premium Economy'))
    flags.push(`High-value economy booking on a likely long-haul route — above-average post-booking fare volatility on this profile`);
  if (!flags.length)
    flags.push(`No elevated flags — standard booking profile; monitoring active, next check in 6 hours`);
  return flags;
}

export function buildFareNarrative(b: FareResult): string[] {
  const route = `${b.origin}–${b.destination}`;
  const narratives: Record<string, string> = {
    'FARE_APPRECIATED': `The ${b.travelClass} market on ${route} has moved in your favour since booking. Current GDS availability is approximately ${pct(b.mktMove * 100)} above what you paid — your booking captured a low that is not available today. There is no rebook case at current levels, and monitoring will track any softening.`,
    'LOWER_CLASS_UNAVAILABLE': `A lower fare class is priced below your booking on ${route}, but that inventory bucket is currently sold out. The gap exists in the fare display — it is not actionable. The monitoring agent will check every 6 hours and alert you the moment that class restores or a cheaper alternative opens.`,
    'NO_CURRENT_GAP': `The ${b.travelClass} market on ${route} is trading within a tight band of your booked fare. No meaningful price arbitrage exists today. Market conditions at this range can shift within 24–48 hours — monitoring provides early warning before any window opens and closes.`,
    'DEPARTURE_IMMINENT': `With under 5 days to departure, ${route} fares are in final-demand mode. Available inventory is priced at or above your current fare. The optimal rebook window has passed — hold your current booking.`,
    'FEE_BLOCKS': `A gross fare gap of ${fmt(b.grossSavings)} (${pct(b.grossPct)}) exists on ${route}. The estimated change and reissue fee of ${fmt(b.changeFee)} currently absorbs the full saving — net position is neutral. A further fare drop of approximately ${fmt(b.changeFee - b.grossSavings + 50)} would shift this to a positive reissue case.`,
    'EMERGING_OPPORTUNITY': `Fares on ${route} have softened ${pct(b.grossPct)} from booking level. Gross saving of ${fmt(b.grossSavings)} is real, but net position after the estimated reissue fee of ${fmt(b.changeFee)} lands at ${fmt(b.netSavings)} — material, below the immediate-action threshold. The gap is widening; a REBOOK signal is likely if this continues.`,
    'NET_POSITIVE': `A clear arbitrage has opened on ${route}. The best available ${b.travelClass} fare is currently ${fmt(b.bestFare)}, ${pct(b.grossPct)} below your booked rate of ${fmt(b.fare)}. After the estimated reissue fee of ${fmt(b.changeFee)}, net savings are ${fmt(b.netSavings)}. This window is open now.`,
  };
  const p1 = narratives[b.signal] || `Fare analysis complete for ${route}.`;
  const p2 = b.recommendation === 'REBOOK'
    ? `Act on this now. Confirm the exact fare conditions and any reissue penalty with your carrier or GDS agent before proceeding — fare rules vary by booking class and ticket type. At ${b.days} days out, inventory at this level typically closes within 24–48 hours.`
    : b.recommendation === 'WATCH'
    ? `The monitoring agent will scan fares every 6 hours and alert you the moment net savings cross the reissue threshold. No manual tracking needed. The emerging gap on this route profile suggests a stronger signal is likely within 3–5 days.`
    : `Monitoring is running in the background. If a meaningful opportunity opens in the next ${b.days} days, you will receive an alert before the window closes. Most recoverable savings on this booking profile are missed not because the gap never appeared, but because no one was watching when it did.`;
  const ndcDiff = Math.round(((b.fare - b.ndcFare) / b.fare) * 100);
  const p3 = `NDC channel comparison: ${b.travelClass === 'Business' || b.travelClass === 'First' ? 'Premium cabin' : 'Economy'} fares sourced directly via airline NDC channels are estimated at ${fmt(b.ndcFare)} on this route — ${pct(ndcDiff)} below the GDS rate. Most corporate travel tools cannot surface or action NDC inventory without a direct airline integration.`;
  return [p1, p2, p3];
}

export interface IrropOption {
  carrier: string; delayH: number; direct: boolean; via: string | null;
  layover: number; protection: string; lounge: boolean; priorityQ: boolean;
  upgradeElig: boolean; score: number; rank: number;
}

export interface IrropResult {
  opts: IrropOption[]; origin: string; destination: string;
  tier: string; disruptType: string; urgency: string;
}

export function findOptions(origin: string, destination: string, disruptType: string, tier: string, urgency: string): IrropResult {
  const s1 = seed(origin, destination, disruptType);
  const s2 = seed(destination, tier, urgency);
  const s3 = seed(origin, urgency, disruptType);
  const ri = routeInfo(origin, destination);
  const pool = ri.carriers;
  const hubPool = ri.hubs.filter(h => h !== origin && h !== destination);
  const fallbackHubs = ri.hubs.length ? ri.hubs : [origin, destination];
  const ownCarrier = pool[Math.floor(s1 * Math.min(3, pool.length))];
  const altIdx = Math.min(pool.length - 1, 3 + Math.floor(s2 * Math.max(1, pool.length - 3)));
  const altCarrier = pool[altIdx] !== ownCarrier ? pool[altIdx] : pool[(altIdx + 1) % pool.length];
  const hubs = hubPool.length >= 2 ? hubPool : fallbackHubs;
  const delayA = +(1.5 + s1 * 3.5).toFixed(1);
  const delayB = +(0.5 + s2 * 2.5).toFixed(1);
  const delayC = +(2.0 + s3 * 4.0).toFixed(1);
  const layoverB = Math.round(40 + s2 * 100);
  const directA = s1 > 0.45;
  const directC = s3 > 0.55;
  const viaB = hubs[Math.floor(s2 * hubs.length)];
  const viaC = hubs[Math.floor(s3 * hubs.length)];
  const tierDelayMult: Record<string, number> = { 'Platinum': 0.60, 'Gold': 0.78, 'Silver': 1.0, 'Non-member': 1.20 };
  const mult = tierDelayMult[tier] || 1.0;
  const priorityQueue = tier === 'Platinum' || tier === 'Gold';
  const upgradeElig = tier === 'Platinum';
  const adjDelayA = +(delayA * mult).toFixed(1);
  const adjDelayB = +(delayB * mult).toFixed(1);
  const adjDelayC = +(delayC * (priorityQueue ? mult * 1.1 : 1.0)).toFixed(1);
  const tierProt: Record<string, number> = { 'Platinum': 0.95, 'Gold': 0.78, 'Silver': 0.58, 'Non-member': 0.38 };
  const typeProt: Record<string, number> = { 'Flight Cancelled': 1.0, 'Delayed 4h+': 0.80, 'Delayed 2–4h': 0.60 };
  const protScore = (tierProt[tier] || 0.38) * (typeProt[disruptType] || 0.60);
  const protLabel = (p: number) => p > 0.72 ? 'CONFIRMED' : p > 0.45 ? 'WAITLIST' : 'OPEN FARE';
  const lounge = tier === 'Platinum' || tier === 'Gold';
  const uMult: Record<string, number> = { 'Must arrive today': 1.8, 'Same day preferred': 1.2, 'Flexible': 0.6 };
  const um = uMult[urgency] || 1.2;
  const rawA = (8 - adjDelayA * 0.7 * um) + (directA ? 1.5 : 0) + (lounge ? 0.5 : 0) + (priorityQueue ? 0.8 : 0);
  const rawB = (8 - adjDelayB * 0.5 * um) - (layoverB > 90 ? 0.8 : 0.3) + (priorityQueue ? 0.4 : 0);
  const rawC = (8 - adjDelayC * 0.8 * um) + (directC ? 1.2 : 0);
  const top = Math.max(rawA, rawB, rawC, 0.1);
  const norm = (r: number) => +(Math.min(10, Math.max(1.5, (r / top) * 8.5 + 1.5)).toFixed(1));
  const opts: IrropOption[] = [
    { carrier: ownCarrier, delayH: adjDelayA, direct: directA, via: directA ? null : viaB, layover: directA ? 0 : layoverB, protection: protLabel(protScore), lounge, priorityQ: priorityQueue, upgradeElig, score: norm(rawA), rank: 0 },
    { carrier: ownCarrier, delayH: adjDelayB, direct: false, via: viaB, layover: layoverB, protection: protLabel(protScore * 0.88), lounge: lounge && tier === 'Platinum', priorityQ: priorityQueue, upgradeElig: false, score: norm(rawB), rank: 0 },
    { carrier: altCarrier, delayH: adjDelayC, direct: directC, via: directC ? null : viaC, layover: directC ? 0 : 55, protection: protLabel(0.35), lounge: false, priorityQ: false, upgradeElig: false, score: norm(rawC), rank: 0 },
  ].sort((a, b) => b.score - a.score).map((o, i) => ({ ...o, rank: i + 1 }));
  return { opts, origin, destination, tier, disruptType, urgency };
}

export function irropDelayStr(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  const hr = Math.floor(h), mn = Math.round((h - hr) * 60);
  return mn > 0 ? `${hr}h ${mn}m` : `${hr}h`;
}

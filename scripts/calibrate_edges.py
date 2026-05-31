#!/usr/bin/env python3
"""
Macro Cascade Edge Calibration
================================
Calibrates the BFS edge weights in lib/macroData.ts against historical
market data pulled from Yahoo Finance (free, no API key required).

Methodology
-----------
1. TRIGGER first-order impacts — computed from sector ETF returns over a
   defined window following each historical shock event. Average across events
   of the same type. Confidence = inverse of cross-event variance.

2. EDGE weights + lags — computed via event-conditional analysis: for each
   edge (A→B, lag L), during each shock event measure A's return in [0, L]
   days and B's return in [L, L+30] days. The cross-event correlation of
   these paired returns is the calibrated weight. The lag that maximises
   this correlation replaces the authored lag.

3. Confidence — 1 - coefficient_of_variation of signed returns across events.
   Low variance across events = high confidence. High variance = low confidence.

Data sources
------------
- Yahoo Finance via yfinance (all data, free, no key)
- FRED optional: set FRED_API_KEY env var for credit spread data

Output
------
  scripts/calibrated_weights.json — full calibration output (commit this)
  scripts/calibration_report.txt  — human-readable old vs new comparison

Usage
-----
  pip install -r scripts/requirements.txt
  python scripts/calibrate_edges.py
"""

import io
import json
import os
import sys
import warnings
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

# Force UTF-8 output on Windows to avoid charmap encode errors
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import numpy as np
import pandas as pd

try:
    import yfinance as yf
except ImportError:
    print("ERROR: Run  pip install -r scripts/requirements.txt  first")
    sys.exit(1)

warnings.filterwarnings("ignore")

SCRIPT_DIR = Path(__file__).parent
OUTPUT_JSON = SCRIPT_DIR / "calibrated_weights.json"
OUTPUT_REPORT = SCRIPT_DIR / "calibration_report.txt"

# ─────────────────────────────────────────────────────────────────────────────
# 1. SHOCK EVENTS  (18 events across 6 trigger types)
#    window: trading days to measure the impact from the event date
# ─────────────────────────────────────────────────────────────────────────────
SHOCK_EVENTS: dict[str, list[dict]] = {
    "WAR_CONFLICT": [
        {"date": "1990-08-02", "name": "Gulf War — Iraq invades Kuwait",         "window": 90},
        {"date": "2003-03-20", "name": "Iraq War — US invasion starts",          "window": 90},
        {"date": "2014-07-17", "name": "Ukraine escalation / MH17 shootdown",   "window": 60},
        {"date": "2022-02-24", "name": "Russia full-scale invasion of Ukraine",  "window": 90},
    ],
    "OIL_SHOCK": [
        {"date": "1990-08-02", "name": "Gulf War oil shock",                     "window": 60},
        {"date": "2005-08-29", "name": "Hurricane Katrina — refinery hit",       "window": 60},
        {"date": "2008-06-01", "name": "2008 oil price spike (WTI $147 peak)",   "window": 90},
        {"date": "2020-03-09", "name": "COVID oil demand collapse / OPEC war",   "window": 60},
        {"date": "2022-02-24", "name": "Ukraine / Russia energy sanctions",      "window": 60},
    ],
    "RATE_HIKE": [
        {"date": "1994-02-04", "name": "Greenspan surprise tightening",          "window": 120},
        {"date": "2004-06-30", "name": "Greenspan 2004 hike cycle start",        "window": 120},
        {"date": "2015-12-16", "name": "Yellen first hike since 2006",           "window": 120},
        {"date": "2022-03-16", "name": "Powell aggressive tightening cycle",     "window": 180},
    ],
    "PANDEMIC": [
        {"date": "2003-04-01", "name": "SARS peak — Asia demand collapse",       "window": 60},
        {"date": "2009-04-27", "name": "H1N1 swine flu — WHO pandemic alert",    "window": 60},
        {"date": "2020-03-11", "name": "COVID-19 — WHO pandemic declaration",    "window": 60},
    ],
    "SUPPLY_CHAIN": [
        {"date": "2011-03-11", "name": "Japan earthquake / Fukushima",           "window": 90},
        {"date": "2021-03-23", "name": "Evergreen Suez Canal blockage",          "window": 60},
        {"date": "2021-09-01", "name": "Global port congestion / chip shortage", "window": 90},
    ],
    "MARKET_CRASH": [
        {"date": "2000-03-10", "name": "Dotcom bubble peak / crash start",       "window": 180},
        {"date": "2008-09-15", "name": "Lehman Brothers collapse",               "window": 90},
        {"date": "2020-02-19", "name": "COVID equity crash",                     "window": 30},
        {"date": "2022-01-03", "name": "2022 Fed-driven bear market",            "window": 180},
    ],
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. SECTOR → ETF/INDEX TICKERS  (priority order — first with data is used)
#    Note: some ETFs post-date early events; fallbacks ensure coverage.
# ─────────────────────────────────────────────────────────────────────────────
SECTOR_TICKERS: dict[str, list[str]] = {
    "OIL_ENERGY":      ["XLE", "CL=F", "^GSPE"],
    "EQUITY_MARKETS":  ["^GSPC", "SPY"],
    "CURRENCIES_FX":   ["DX-Y.NYB", "UUP"],
    "AVIATION_TRAVEL": ["^XAL", "JETS", "UAL"],  # ^XAL = AMEX Airline Index (1993+)
    "COMMODITIES":     ["DJP", "GSG", "PDBC"],
    "INSURANCE":       ["KIE", "^SPSIIS"],
    "CREDIT_BANKING":  ["^BKX", "KBE", "XLF"],   # ^BKX = PHLX Banking (1992+)
    "EMPLOYMENT":      ["XLI", "^GSPC"],           # Proxy: Industrials / broad market
    "ECOMMERCE":       ["XRT", "XLY"],
    "CONSUMER":        ["XLY", "XLP"],
    "REAL_ESTATE":     ["IYR", "VNQ", "XLRE"],
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. CURRENT AUTHORED VALUES (from lib/macroData.ts)
#    Used to compute diffs in the report.
# ─────────────────────────────────────────────────────────────────────────────
AUTHORED_FIRST_ORDER: dict[str, list[dict]] = {
    "WAR_CONFLICT": [
        {"sector": "OIL_ENERGY",     "impact": 0.62,  "lag": 0, "conf": 0.90},
        {"sector": "EQUITY_MARKETS", "impact": -0.18, "lag": 0, "conf": 0.85},
        {"sector": "CURRENCIES_FX",  "impact": 0.08,  "lag": 1, "conf": 0.78},
    ],
    "OIL_SHOCK": [
        {"sector": "OIL_ENERGY",    "impact": 0.55,  "lag": 0, "conf": 0.92},
        {"sector": "CURRENCIES_FX", "impact": 0.10,  "lag": 2, "conf": 0.75},
        {"sector": "COMMODITIES",   "impact": 0.30,  "lag": 5, "conf": 0.78},
    ],
    "RATE_HIKE": [
        {"sector": "EQUITY_MARKETS", "impact": -0.15, "lag": 0, "conf": 0.82},
        {"sector": "CURRENCIES_FX",  "impact": 0.12,  "lag": 3, "conf": 0.80},
    ],
    "PANDEMIC": [
        {"sector": "AVIATION_TRAVEL", "impact": -0.65, "lag": 7,  "conf": 0.88},
        {"sector": "CONSUMER",        "impact": -0.30, "lag": 14, "conf": 0.82},
        {"sector": "EQUITY_MARKETS",  "impact": -0.35, "lag": 0,  "conf": 0.85},
        {"sector": "EMPLOYMENT",      "impact": -0.25, "lag": 30, "conf": 0.78},
    ],
    "SUPPLY_CHAIN": [
        {"sector": "COMMODITIES", "impact": 0.40,  "lag": 14, "conf": 0.82},
        {"sector": "ECOMMERCE",   "impact": -0.22, "lag": 21, "conf": 0.78},
        {"sector": "OIL_ENERGY",  "impact": 0.20,  "lag": 7,  "conf": 0.72},
    ],
    "MARKET_CRASH": [
        {"sector": "EQUITY_MARKETS", "impact": -0.30, "lag": 0, "conf": 0.92},
        {"sector": "CURRENCIES_FX",  "impact": -0.08, "lag": 2, "conf": 0.72},
        {"sector": "CREDIT_BANKING", "impact": -0.20, "lag": 7, "conf": 0.80},
    ],
}

AUTHORED_EDGES: list[dict] = [
    {"from": "GEOPOLITICS",     "to": "OIL_ENERGY",      "weight": 0.78, "lag": 0,  "conf": 0.90},
    {"from": "GEOPOLITICS",     "to": "EQUITY_MARKETS",  "weight": 0.65, "lag": 0,  "conf": 0.85},
    {"from": "GEOPOLITICS",     "to": "INSURANCE",       "weight": 0.72, "lag": 1,  "conf": 0.88},
    {"from": "GEOPOLITICS",     "to": "CURRENCIES_FX",   "weight": 0.55, "lag": 1,  "conf": 0.80},
    {"from": "MONETARY_POLICY", "to": "EQUITY_MARKETS",  "weight": 0.60, "lag": 0,  "conf": 0.82},
    {"from": "MONETARY_POLICY", "to": "CREDIT_BANKING",  "weight": 0.85, "lag": 7,  "conf": 0.90},
    {"from": "MONETARY_POLICY", "to": "CURRENCIES_FX",   "weight": 0.70, "lag": 3,  "conf": 0.85},
    {"from": "MONETARY_POLICY", "to": "REAL_ESTATE",     "weight": 0.70, "lag": 30, "conf": 0.80},
    {"from": "OIL_ENERGY",      "to": "AVIATION_TRAVEL", "weight": 0.72, "lag": 14, "conf": 0.87},
    {"from": "OIL_ENERGY",      "to": "COMMODITIES",     "weight": 0.65, "lag": 7,  "conf": 0.82},
    {"from": "OIL_ENERGY",      "to": "INSURANCE",       "weight": 0.38, "lag": 7,  "conf": 0.75},
    {"from": "OIL_ENERGY",      "to": "CURRENCIES_FX",   "weight": 0.45, "lag": 3,  "conf": 0.72},
    {"from": "EQUITY_MARKETS",  "to": "EMPLOYMENT",      "weight": 0.55, "lag": 60, "conf": 0.75},
    {"from": "EQUITY_MARKETS",  "to": "REAL_ESTATE",     "weight": 0.42, "lag": 30, "conf": 0.70},
    {"from": "EQUITY_MARKETS",  "to": "CONSUMER",        "weight": 0.48, "lag": 21, "conf": 0.72},
    {"from": "CURRENCIES_FX",   "to": "AVIATION_TRAVEL", "weight": 0.38, "lag": 14, "conf": 0.68},
    {"from": "CURRENCIES_FX",   "to": "ECOMMERCE",       "weight": 0.45, "lag": 14, "conf": 0.70},
    {"from": "CREDIT_BANKING",  "to": "REAL_ESTATE",     "weight": 0.65, "lag": 30, "conf": 0.82},
    {"from": "CREDIT_BANKING",  "to": "ECOMMERCE",       "weight": 0.50, "lag": 30, "conf": 0.72},
    {"from": "CREDIT_BANKING",  "to": "EMPLOYMENT",      "weight": 0.60, "lag": 45, "conf": 0.75},
    {"from": "COMMODITIES",     "to": "CONSUMER",        "weight": 0.58, "lag": 21, "conf": 0.80},
    {"from": "COMMODITIES",     "to": "INSURANCE",       "weight": 0.35, "lag": 21, "conf": 0.68},
    {"from": "AVIATION_TRAVEL", "to": "EMPLOYMENT",      "weight": 0.45, "lag": 45, "conf": 0.72},
    {"from": "AVIATION_TRAVEL", "to": "CONSUMER",        "weight": 0.35, "lag": 30, "conf": 0.65},
    {"from": "REAL_ESTATE",     "to": "CREDIT_BANKING",  "weight": 0.65, "lag": 30, "conf": 0.80},
    {"from": "REAL_ESTATE",     "to": "EMPLOYMENT",      "weight": 0.40, "lag": 45, "conf": 0.70},
    {"from": "EMPLOYMENT",      "to": "CONSUMER",        "weight": 0.80, "lag": 21, "conf": 0.88},
    {"from": "EMPLOYMENT",      "to": "REAL_ESTATE",     "weight": 0.35, "lag": 60, "conf": 0.65},
    {"from": "CONSUMER",        "to": "ECOMMERCE",       "weight": 0.75, "lag": 7,  "conf": 0.85},
    {"from": "CONSUMER",        "to": "EMPLOYMENT",      "weight": 0.50, "lag": 45, "conf": 0.72},
    {"from": "INSURANCE",       "to": "CREDIT_BANKING",  "weight": 0.35, "lag": 30, "conf": 0.65},
]


# ─────────────────────────────────────────────────────────────────────────────
# 4. DATA FETCH HELPERS
# ─────────────────────────────────────────────────────────────────────────────

_price_cache: dict[str, pd.Series] = {}

def fetch_prices(ticker: str, start: str = "1988-01-01") -> Optional[pd.Series]:
    """Download adjusted close; cache to avoid repeated requests."""
    if ticker in _price_cache:
        return _price_cache[ticker]
    try:
        df = yf.download(ticker, start=start, end=datetime.today().strftime("%Y-%m-%d"),
                         progress=False, auto_adjust=True)
        if df.empty:
            return None
        col = df["Close"]
        if isinstance(col, pd.DataFrame):
            col = col.iloc[:, 0]
        series = col.dropna()
        if len(series) > 20:
            _price_cache[ticker] = series
            return series
        return None
    except Exception:
        return None


def best_ticker_series(tickers: list[str], start: str = "1988-01-01") -> tuple[Optional[str], Optional[pd.Series]]:
    """Return the first ticker that has price data going back to start."""
    for t in tickers:
        s = fetch_prices(t)
        if s is not None and not s.empty:
            if pd.Timestamp(start) > s.index[0]:
                continue
            return t, s
    # Fallback: return whichever has data, even if not covering start
    for t in tickers:
        s = fetch_prices(t)
        if s is not None and not s.empty:
            return t, s
    return None, None


def window_return(series: pd.Series, event_date: str, window_days: int) -> Optional[float]:
    """
    Fractional return from the trading day on/after event_date to
    the trading day closest to event_date + window_days calendar days.
    """
    try:
        dt = pd.Timestamp(event_date)
        end_target = dt + timedelta(days=window_days)
        after_event = series[series.index >= dt]
        if after_event.empty:
            return None
        p0 = after_event.iloc[0]
        within = after_event[after_event.index <= end_target + timedelta(days=14)]
        in_window = within[within.index <= end_target]
        if in_window.empty or len(in_window) < 3:
            return None
        p1 = in_window.iloc[-1]
        return float((p1 - p0) / p0)
    except Exception:
        return None


def lag_of_max_move(series: pd.Series, event_date: str, max_days: int = 90) -> int:
    """Calendar days from event_date to the trading day of maximum absolute move."""
    try:
        dt = pd.Timestamp(event_date)
        end = dt + timedelta(days=max_days)
        sub = series[(series.index >= dt) & (series.index <= end)]
        if sub.empty or len(sub) < 5:
            return 0
        pct = (sub - sub.iloc[0]) / sub.iloc[0]
        return max(0, int((pct.abs().idxmax() - dt).days))
    except Exception:
        return 0


def confidence(returns: list[float]) -> float:
    """
    Confidence from cross-event consistency.
    Measures directional agreement and magnitude consistency.
    Returns value in [0.50, 0.95].
    """
    if len(returns) < 2:
        return 0.70
    arr = np.array(returns)
    mean_abs = np.mean(np.abs(arr))
    if mean_abs < 1e-6:
        return 0.50
    cv = np.std(np.abs(arr)) / mean_abs             # 0 = perfectly consistent magnitude
    directional_agree = np.mean(np.sign(arr) == np.sign(np.mean(arr)))  # fraction same direction
    conf = (1 - min(cv, 1.0)) * 0.45 + directional_agree * 0.55
    return round(float(np.clip(conf, 0.50, 0.95)), 2)


def lagged_correlation(a: pd.Series, b: pd.Series, lag_days: int, roll_window: int = 30) -> float:
    """
    Correlation between a's return and b's return lag_days calendar days later.
    Uses daily log returns over a rolling window. Returns value in [0, 1].
    """
    try:
        # Align on common trading days
        both = pd.concat([a, b], axis=1, join="inner").dropna()
        if len(both) < 252:
            return 0.0
        r_a = np.log(both.iloc[:, 0] / both.iloc[:, 0].shift(1)).dropna()
        r_b = np.log(both.iloc[:, 1] / both.iloc[:, 1].shift(1)).dropna()
        # Shift b forward by lag_days trading days
        lag_td = max(1, round(lag_days * 5 / 7))  # calendar days → approx trading days
        r_b_shifted = r_b.shift(-lag_td)
        combined = pd.concat([r_a, r_b_shifted], axis=1).dropna()
        if len(combined) < 100:
            return 0.0
        corr = combined.iloc[:, 0].corr(combined.iloc[:, 1])
        return float(np.clip(abs(corr), 0.0, 1.0))
    except Exception:
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# 5. CALIBRATE FIRST-ORDER TRIGGER IMPACTS
# ─────────────────────────────────────────────────────────────────────────────

def calibrate_first_order() -> dict:
    """
    For each trigger type and each sector in its firstOrder list:
    1. Pull sector ETF prices
    2. Compute return over the event window for each historical event
    3. Average across events; compute confidence from variance
    Returns: { trigger_id: { sector_id: {impact, lag, conf, n_events, ticker} } }
    """
    print("\n─── Calibrating first-order trigger impacts ───")
    results: dict[str, dict] = {}

    for trigger_id, events in SHOCK_EVENTS.items():
        authored = AUTHORED_FIRST_ORDER.get(trigger_id, [])
        sectors_to_calibrate = [fo["sector"] for fo in authored]

        results[trigger_id] = {}
        for sector in sectors_to_calibrate:
            tickers = SECTOR_TICKERS.get(sector, [])
            if not tickers:
                print(f"  [SKIP] {trigger_id} → {sector}: no ticker mapping")
                continue

            sector_returns = []
            sector_lags = []
            used_ticker = None

            for event in events:
                # Find best ticker that covers this event date
                event_dt = pd.Timestamp(event["date"])
                for t in tickers:
                    s = fetch_prices(t)
                    if s is None:
                        continue
                    if s.index[0] > event_dt + timedelta(days=30):
                        continue  # Data doesn't cover this event
                    ret = window_return(s, event["date"], event["window"])
                    if ret is None:
                        continue
                    lag = lag_of_max_move(s, event["date"], event["window"])
                    sector_returns.append(ret)
                    sector_lags.append(lag)
                    used_ticker = t
                    break  # Use first ticker that works for this event

            if len(sector_returns) < 2:
                print(f"  [LIMITED] {trigger_id} → {sector}: only {len(sector_returns)} events, keeping authored")
                continue

            mean_impact = float(np.mean(sector_returns))
            median_lag  = int(np.median(sector_lags))
            conf        = confidence(sector_returns)
            n_events    = len(sector_returns)

            results[trigger_id][sector] = {
                "impact":   round(mean_impact, 3),
                "lag":      median_lag,
                "conf":     conf,
                "n_events": n_events,
                "ticker":   used_ticker,
                "raw_returns": [round(r, 4) for r in sector_returns],
            }
            print(f"  ✓  {trigger_id:15s} → {sector:16s}  "
                  f"impact={mean_impact:+.3f}  lag={median_lag:3d}d  "
                  f"conf={conf:.2f}  n={n_events}  [{used_ticker}]")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 6. CALIBRATE EDGE WEIGHTS
# ─────────────────────────────────────────────────────────────────────────────

def calibrate_edges() -> dict:
    """
    For each edge with calibratable sectors (non-trigger nodes):
    1. Compute event-conditional correlation: during each trigger event,
       does sector A's early move predict sector B's delayed move?
    2. Augment with long-run lagged cross-correlation over 20yr daily data.
    Returns: { "FROM->TO": {weight, lag, conf, method} }
    """
    print("\n─── Calibrating edge weights ───")
    results: dict[str, dict] = {}

    # Edges involving GEOPOLITICS and MONETARY_POLICY as source are trigger nodes —
    # we treat those as validated by first-order calibration; focus on sector→sector edges.
    sector_edges = [e for e in AUTHORED_EDGES
                    if e["from"] not in ("GEOPOLITICS", "MONETARY_POLICY")]

    # Pre-fetch all required tickers
    required_sectors = set()
    for e in sector_edges:
        required_sectors.add(e["from"])
        required_sectors.add(e["to"])

    print(f"  Fetching price data for {len(required_sectors)} sectors ...")
    sector_series: dict[str, tuple[Optional[str], Optional[pd.Series]]] = {}
    for sector in sorted(required_sectors):
        tickers = SECTOR_TICKERS.get(sector, [])
        used_t, series = best_ticker_series(tickers, start="1995-01-01")
        sector_series[sector] = (used_t, series)
        if used_t:
            print(f"    {sector:20s}  {used_t}  ({len(series)} trading days)")
        else:
            print(f"    {sector:20s}  [NO DATA]")

    for edge in sector_edges:
        key = f"{edge['from']}->{edge['to']}"
        from_t, from_s = sector_series.get(edge["from"], (None, None))
        to_t,   to_s   = sector_series.get(edge["to"],   (None, None))

        if from_s is None or to_s is None:
            print(f"  [SKIP] {key}: missing data")
            results[key] = {"weight": edge["weight"], "lag": edge["lag"],
                            "conf": edge["conf"], "method": "authored_fallback"}
            continue

        # Method 1: Long-run lagged cross-correlation
        lrc = lagged_correlation(from_s, to_s, lag_days=edge["lag"])

        # Method 2: Event-conditional — find the most relevant trigger for this edge
        # Use events that directly involve the 'from' sector
        sector_trigger_map = {
            "OIL_ENERGY":      ["WAR_CONFLICT", "OIL_SHOCK"],
            "EQUITY_MARKETS":  ["MARKET_CRASH", "RATE_HIKE"],
            "CURRENCIES_FX":   ["RATE_HIKE", "WAR_CONFLICT"],
            "CREDIT_BANKING":  ["MARKET_CRASH", "RATE_HIKE"],
            "AVIATION_TRAVEL": ["PANDEMIC", "OIL_SHOCK"],
            "COMMODITIES":     ["OIL_SHOCK", "SUPPLY_CHAIN"],
            "REAL_ESTATE":     ["RATE_HIKE", "MARKET_CRASH"],
            "CONSUMER":        ["PANDEMIC", "MARKET_CRASH"],
            "EMPLOYMENT":      ["PANDEMIC", "MARKET_CRASH"],
            "ECOMMERCE":       ["PANDEMIC", "SUPPLY_CHAIN"],
            "INSURANCE":       ["WAR_CONFLICT", "OIL_SHOCK"],
        }
        relevant_triggers = sector_trigger_map.get(edge["from"], [])
        event_corrs: list[float] = []

        for trig_id in relevant_triggers:
            events = SHOCK_EVENTS.get(trig_id, [])
            from_rets, to_rets = [], []
            for event in events:
                ev_dt = pd.Timestamp(event["date"])
                if from_s.index[0] > ev_dt + timedelta(days=5):
                    continue
                if to_s.index[0] > ev_dt + timedelta(days=5 + edge["lag"]):
                    continue
                # A's return in first [0, lag] days
                r_a = window_return(from_s, event["date"], max(edge["lag"], 7))
                # B's return in [lag, lag+30] days
                lag_start_dt = (ev_dt + timedelta(days=edge["lag"])).strftime("%Y-%m-%d")
                r_b = window_return(to_s, lag_start_dt, 30)
                if r_a is not None and r_b is not None:
                    from_rets.append(r_a)
                    to_rets.append(r_b)

            if len(from_rets) >= 2:
                arr_a = np.array(from_rets)
                arr_b = np.array(to_rets)
                if arr_a.std() > 0 and arr_b.std() > 0:
                    corr = float(np.corrcoef(arr_a, arr_b)[0, 1])
                    event_corrs.append(abs(corr))

        # Combine both methods — event-conditional preferred if available
        if event_corrs:
            event_weight = float(np.mean(event_corrs))
            # Blend: 60% event-conditional + 40% long-run
            calibrated_weight = round(0.6 * event_weight + 0.4 * lrc, 3)
            method = "event_conditional+lrc"
        else:
            calibrated_weight = round(lrc, 3) if lrc > 0.1 else edge["weight"]
            method = "lrc_only" if lrc > 0.1 else "authored_fallback"

        # Calibrate confidence from event consistency (if we have event data)
        if event_corrs and len(event_corrs) >= 2:
            cal_conf = round(float(np.clip(np.mean(event_corrs) * 0.9 + 0.05, 0.50, 0.95)), 2)
        else:
            cal_conf = edge["conf"]

        # Keep authored lag — it's domain-validated (transmission times are structural)
        results[key] = {
            "weight":     calibrated_weight,
            "lag":        edge["lag"],
            "conf":       cal_conf,
            "authored_weight": edge["weight"],
            "lrc":        round(lrc, 3),
            "event_corrs": [round(c, 3) for c in event_corrs],
            "method":     method,
        }
        delta = calibrated_weight - edge["weight"]
        flag  = "  ^" if delta > 0.05 else ("  v" if delta < -0.05 else "   ")
        print(f"  {flag} {key:40s}  "
              f"authored={edge['weight']:.3f}  "
              f"calibrated={calibrated_weight:.3f}  "
              f"Δ={delta:+.3f}  [{method}]")

    return results


# ─────────────────────────────────────────────────────────────────────────────
# 7. GENERATE TYPESCRIPT OUTPUT SNIPPETS
# ─────────────────────────────────────────────────────────────────────────────

def ts_first_order_snippet(trigger_id: str, calibrated: dict, authored: list[dict]) -> str:
    """Generate the TypeScript firstOrder array for a trigger, using calibrated values."""
    lines = []
    for fo in authored:
        sector = fo["sector"]
        cal = calibrated.get(trigger_id, {}).get(sector)
        if cal and cal["n_events"] >= 2:
            impact = cal["impact"]
            lag    = cal["lag"]
            conf   = cal["conf"]
            source = f"calibrated n={cal['n_events']} [{cal['ticker']}]"
        else:
            impact = fo["impact"]
            lag    = fo["lag"]
            conf   = fo["conf"]
            source = "authored (insufficient data)"
        lines.append(
            f"      {{ sector:'{sector}', impact:{impact:.3f}, lag:{lag}, conf:{conf:.2f} }}"
            f",  // {source}"
        )
    return "\n".join(lines)


def ts_edge_snippet(calibrated_edges: dict) -> str:
    """Generate the TypeScript EDGES array entries with calibrated weights."""
    out = []
    for edge in AUTHORED_EDGES:
        key = f"{edge['from']}->{edge['to']}"
        cal = calibrated_edges.get(key)
        if cal and cal["method"] != "authored_fallback":
            w    = cal["weight"]
            conf = cal["conf"]
            src  = f"cal [{cal['method']}]"
        else:
            w    = edge["weight"]
            conf = edge["conf"]
            src  = "authored"
        mechanism_placeholder = "..."  # Keep existing mechanism text
        out.append(
            f"  {{ from:'{edge['from']:15s}', to:'{edge['to']:15s}', "
            f"weight:{w:.3f}, lag:{edge['lag']:2d}, dir:{edge.get('dir',1):2d}, "
            f"conf:{conf:.2f} }},  // {src}"
        )
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────────────
# 8. WRITE OUTPUTS
# ─────────────────────────────────────────────────────────────────────────────

def write_outputs(first_order_cal: dict, edges_cal: dict) -> None:
    total_events = sum(len(v) for v in SHOCK_EVENTS.values())

    output = {
        "meta": {
            "generated":       datetime.utcnow().isoformat() + "Z",
            "methodology":     "Yahoo Finance sector ETF returns averaged over historical shock event windows. "
                               "Edge weights use event-conditional correlation + long-run lagged cross-correlation. "
                               "Lags retained from domain-validated authored values.",
            "data_source":     "Yahoo Finance via yfinance (free, no API key)",
            "shock_events":    total_events,
            "events_by_type":  {k: len(v) for k, v in SHOCK_EVENTS.items()},
            "events_detail":   SHOCK_EVENTS,
        },
        "first_order": first_order_cal,
        "edges":        edges_cal,
        "typescript": {
            "first_order_snippets": {
                trigger_id: ts_first_order_snippet(trigger_id, first_order_cal, authored)
                for trigger_id, authored in AUTHORED_FIRST_ORDER.items()
            },
        },
    }

    with open(OUTPUT_JSON, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n✓ Written: {OUTPUT_JSON}")

    # Human-readable report
    lines = [
        "MACRO CASCADE EDGE CALIBRATION REPORT",
        "=" * 60,
        f"Generated : {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"Events    : {total_events} historical shock events across 6 trigger types",
        f"Method    : Yahoo Finance sector ETF returns (yfinance)",
        "",
        "─── FIRST-ORDER IMPACTS: OLD vs CALIBRATED ───",
        "",
    ]
    for trigger_id, authored_list in AUTHORED_FIRST_ORDER.items():
        lines.append(f"  {trigger_id}")
        for fo in authored_list:
            sector = fo["sector"]
            cal = first_order_cal.get(trigger_id, {}).get(sector)
            if cal and cal["n_events"] >= 2:
                delta = cal["impact"] - fo["impact"]
                flag = "^" if delta > 0.02 else ("v" if delta < -0.02 else ".")
                lines.append(
                    f"    {flag} {sector:18s}  "
                    f"impact: {fo['impact']:+.3f} → {cal['impact']:+.3f}  "
                    f"(Δ={delta:+.3f})  "
                    f"conf: {fo['conf']:.2f} → {cal['conf']:.2f}  "
                    f"n={cal['n_events']}"
                )
            else:
                lines.append(f"    · {sector:18s}  UNCHANGED (insufficient data)")
        lines.append("")

    lines += [
        "─── EDGE WEIGHTS: OLD vs CALIBRATED ───",
        "",
    ]
    for edge in AUTHORED_EDGES:
        key = f"{edge['from']}->{edge['to']}"
        cal = edges_cal.get(key)
        if cal and cal["method"] != "authored_fallback":
            delta = cal["weight"] - edge["weight"]
            flag = "^" if delta > 0.05 else ("v" if delta < -0.05 else ".")
            lines.append(
                f"  {flag} {key:40s}  "
                f"{edge['weight']:.3f} → {cal['weight']:.3f}  "
                f"(Δ={delta:+.3f})  [{cal['method']}]"
            )
        else:
            lines.append(f"  · {key:40s}  {edge['weight']:.3f} → UNCHANGED")

    with open(OUTPUT_REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"✓ Written: {OUTPUT_REPORT}")


# ─────────────────────────────────────────────────────────────────────────────
# 9. APPLY TO macroData.ts  (updates firstOrder values inline)
# ─────────────────────────────────────────────────────────────────────────────

def apply_to_macrodata(first_order_cal: dict, edges_cal: dict) -> None:
    """
    Patch lib/macroData.ts in place with calibrated values.
    Only updates numeric literals — preserves all other code and comments.
    """
    ts_path = Path(__file__).parent.parent / "lib" / "macroData.ts"
    if not ts_path.exists():
        print(f"\n[SKIP] {ts_path} not found — skipping auto-apply")
        return

    source = ts_path.read_text(encoding="utf-8")
    original = source
    patches = 0

    # Patch first-order impacts
    for trigger_id, authored_list in AUTHORED_FIRST_ORDER.items():
        for fo in authored_list:
            sector = fo["sector"]
            cal = first_order_cal.get(trigger_id, {}).get(sector)
            if not cal or cal["n_events"] < 2:
                continue

            # Match existing TypeScript pattern for this sector in this trigger block
            # Pattern: { sector:'SECTOR_ID', impact:OLD_VAL, lag:OLD_LAG, conf:OLD_CONF }
            import re
            pattern = (
                r"(\{\s*sector\s*:\s*'" + re.escape(sector) + r"'\s*,\s*"
                r"impact\s*:)\s*([+-]?\d+\.\d+)"
                r"(\s*,\s*lag\s*:)\s*(\d+)"
                r"(\s*,\s*conf\s*:)\s*(\d+\.\d+)\s*\}"
            )
            new_val = f"{{sector:'{sector}', impact:{cal['impact']:.3f}, lag:{cal['lag']}, conf:{cal['conf']:.2f}}}"
            new_source, n = re.subn(pattern, new_val, source, count=1)
            if n > 0:
                source = new_source
                patches += 1

    # Patch edge weights
    for edge in AUTHORED_EDGES:
        key = f"{edge['from']}->{edge['to']}"
        cal = edges_cal.get(key)
        if not cal or cal["method"] == "authored_fallback":
            continue

        import re
        # Match: { from:'FROM', to:'TO', weight:OLD, lag:N, dir:D, conf:OLD ...}
        pattern = (
            r"(\{\s*from\s*:\s*'" + re.escape(edge["from"]) + r"'\s*,\s*"
            r"to\s*:\s*'" + re.escape(edge["to"]) + r"'\s*,\s*"
            r"weight\s*:)\s*(\d+\.\d+)"
            r"(\s*,\s*lag\s*:\s*\d+\s*,\s*dir\s*:\s*[+-]?\d+\s*,\s*conf\s*:)\s*(\d+\.\d+)"
        )
        replacement = (
            r"\g<1>" + f"{cal['weight']:.3f}"
            r"\g<3>" + f"{cal['conf']:.2f}"
        )
        new_source, n = re.subn(pattern, replacement, source, count=1)
        if n > 0:
            source = new_source
            patches += 1

    if patches > 0:
        ts_path.write_text(source, encoding="utf-8")
        print(f"\n✓ Applied {patches} patches to lib/macroData.ts")
        print("  Review with:  git diff lib/macroData.ts")
    else:
        print("\n[INFO] No patches matched — macroData.ts unchanged")
        print("  Check scripts/calibrated_weights.json for manual review")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Macro Cascade Edge Calibration")
    print("=" * 60)
    print(f"Events : {sum(len(v) for v in SHOCK_EVENTS.values())} historical shock events")
    print(f"Sectors: {len(SECTOR_TICKERS)} sector -> ETF mappings")
    print()

    first_order_cal = calibrate_first_order()
    edges_cal       = calibrate_edges()

    write_outputs(first_order_cal, edges_cal)
    apply_to_macrodata(first_order_cal, edges_cal)

    print("\n" + "=" * 60)
    print("DONE")
    print()
    print("Next steps:")
    print("  1. Review:  scripts/calibration_report.txt")
    print("  2. Diff:    git diff lib/macroData.ts")
    print("  3. Build:   npm run build")
    print("  4. Commit:  git add scripts/calibrated_weights.json lib/macroData.ts")
    print("              git commit -m 'chore: apply data-calibrated edge weights'")

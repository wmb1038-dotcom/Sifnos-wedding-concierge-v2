#!/usr/bin/env python3
"""
scripts/fetch_sifnos_places.py

One-time, build-time script. Fetches Sifnos place data from the
Google Places API (New) and writes src/data/sifnos-places.json.

Run from the project root:
  python scripts/fetch_sifnos_places.py

NEVER deployed to Vercel. No user data ever touches Google at runtime.
Requires Python 3.8+ (stdlib only: json, urllib, difflib, re, random).
"""

import json
import os
import random
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone, timedelta
from difflib import SequenceMatcher


# --- configuration -------------------------------------------------------------

SIFNOS_CENTER   = {"latitude": 36.97, "longitude": 24.71}
SEARCH_RADIUS_M = 8000.0
PAGE_SIZE       = 20
MAX_CALLS       = 200
FUZZY_THRESHOLD = 0.85

QUERIES = [
    "restaurants in Sifnos Greece",
    "tavernas in Sifnos Greece",
    "cafes in Sifnos Greece",
    "bars in Sifnos Greece",
    "beaches in Sifnos Greece",
    "churches and monasteries in Sifnos Greece",
    "things to do in Sifnos Greece",
    "bakeries in Sifnos Greece",
]

# Field mask --- Essentials + Pro only. Verify before running:
# https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
SEARCH_FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.types",
    "places.primaryType",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.regularOpeningHours",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.googleMapsUri",
    "nextPageToken",
])

# Declared tiers --- user must verify at billing page before proceeding
FIELD_TIERS = {
    "places.id":                  "Essentials",
    "places.displayName":         "Essentials",
    "places.formattedAddress":    "Essentials",
    "places.location":            "Essentials",
    "places.types":               "Essentials",
    "places.primaryType":         "Essentials",
    "places.rating":              "Pro",
    "places.userRatingCount":     "Pro",
    "places.priceLevel":          "Pro",
    "places.regularOpeningHours": "Pro",
    "places.websiteUri":          "Pro",
    "places.nationalPhoneNumber": "Pro",
    "places.googleMapsUri":       "Pro",
}

# Google primaryType -> app category enum (matches CATEGORIES in places.js)
TYPE_TO_CATEGORY = {
    "restaurant":         "restaurant",
    "food":               "restaurant",
    "cafe":               "restaurant",
    "coffee_shop":        "restaurant",
    "bar":                "restaurant",
    "bar_and_grill":      "restaurant",
    "seafood_restaurant": "restaurant",
    "greek_restaurant":   "restaurant",
    "meal_takeaway":      "restaurant",
    "meal_delivery":      "restaurant",
    "bakery":             "restaurant",
    "beach":              "beach",
    "natural_feature":    "beach",
    "church":             "monastery",
    "place_of_worship":   "monastery",
    "monastery":          "monastery",
    "tourist_attraction": "village",
    "museum":             "village",
    "park":               "village",
    "pottery":            "pottery",
    "ceramics_store":     "pottery",
    "farm":               "farm",
}

PRICE_MAP = {
    "PRICE_LEVEL_FREE":           0,
    "PRICE_LEVEL_INEXPENSIVE":    1,
    "PRICE_LEVEL_MODERATE":       2,
    "PRICE_LEVEL_EXPENSIVE":      3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
}


# --- env / setup ---------------------------------------------------------------

def load_env(path=".env.local"):
    env = {}
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env


def print_setup_instructions():
    print("""
==============================================================
  GOOGLE_PLACES_API_KEY not found in .env.local
==============================================================

To set up:

 a) Enable the API
    https://console.cloud.google.com/apis/library
    Search for "Places API (New)" --- enable it.
    [!]  NOT the legacy "Places API". They are different products.

 b) Create and restrict an API key
    https://console.cloud.google.com/apis/credentials -> Create Credentials
    -> API key. Then click the key and restrict it:
    - API restrictions -> Restrict key -> Places API (New) only.
    - Application restrictions -> IP addresses -> add your current public IP.
      (Find your IP at https://whatismyip.com)

 c) Set a billing budget alert
    https://console.cloud.google.com/billing
    Create a budget alert at $10 so you catch any unexpected charges.

 d) Add to .env.local in the project root:
      GOOGLE_PLACES_API_KEY=AIza...your-key...

 e) Safety checks (already done for you):
    - .env.local is in .gitignore --- key will NOT be committed.
    - Do NOT add this key to Vercel environment variables.
      This script is LOCAL-ONLY and never deploys.

Re-run this script after adding the key.
""")


# --- parse existing curated list -----------------------------------------------

def parse_places_js(filepath="src/data/places.js"):
    """
    Extract place records from places.js using regex.
    Returns list of dicts with: id, name, couplePick, subtitle.
    """
    try:
        with open(filepath, encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"[!]  {filepath} not found --- skipping curated-pick merge.")
        return []

    places = []
    # Split on object-opening braces at the two-space indent level
    blocks = re.split(r'\n  \{', content)
    for block in blocks[1:]:
        name_m = re.search(r"name:\s*'([^']+)'", block)
        if not name_m:
            name_m = re.search(r'name:\s*"([^"]+)"', block)
        if not name_m:
            continue

        id_m      = re.search(r"id:\s*'([^']+)'", block)
        couple_m  = re.search(r"couplePick:\s*(true|false)", block)
        subtitle_m = re.search(r"subtitle:\s*'([^']*)'", block)
        if not subtitle_m:
            subtitle_m = re.search(r'subtitle:\s*"([^"]*)"', block)

        places.append({
            "id":         id_m.group(1) if id_m else "",
            "name":       name_m.group(1).replace("&amp;", "&"),
            "couplePick": couple_m.group(1) == "true" if couple_m else False,
            "subtitle":   subtitle_m.group(1).replace("&amp;", "&") if subtitle_m else "",
        })

    return places


# --- fuzzy matching -------------------------------------------------------------

def _normalize(name):
    """Lowercase and strip common venue-type prefixes for better matching."""
    n = name.lower().strip()
    for prefix in ("restaurant ", "taverna ", "tavern ", "bar ", "cafe ",
                   "kafeteria ", "beach ", "the "):
        if n.startswith(prefix):
            n = n[len(prefix):]
    return n


def fuzzy_match(google_name, curated_names, threshold=FUZZY_THRESHOLD):
    """
    Return (best_matched_name, score) if score >= threshold, else (None, score).
    Tries both raw and normalized names; takes the better ratio.
    """
    best_score = 0.0
    best_name  = None
    g_raw  = google_name.lower()
    g_norm = _normalize(google_name)

    for name in curated_names:
        c_raw  = name.lower()
        c_norm = _normalize(name)
        score  = max(
            SequenceMatcher(None, g_raw,  c_raw ).ratio(),
            SequenceMatcher(None, g_norm, c_norm).ratio(),
            SequenceMatcher(None, g_raw,  c_norm).ratio(),
            SequenceMatcher(None, g_norm, c_raw ).ratio(),
        )
        if score > best_score:
            best_score = score
            best_name  = name

    if best_score >= threshold:
        return best_name, best_score
    return None, best_score


# --- categorisation -------------------------------------------------------------

def map_category(primary_type, types):
    if primary_type:
        cat = TYPE_TO_CATEGORY.get(primary_type)
        if cat:
            return cat
    for t in (types or []):
        cat = TYPE_TO_CATEGORY.get(t)
        if cat:
            return cat
    return "other"


# --- API calls ------------------------------------------------------------------

def _post(url, api_key, field_mask, body_dict):
    data = json.dumps(body_dict).encode("utf-8")
    req  = urllib.request.Request(
        url, data=data,
        headers={
            "Content-Type":    "application/json",
            "X-Goog-Api-Key":  api_key,
            "X-Goog-FieldMask": field_mask,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        return json.loads(resp.read().decode("utf-8"))


def text_search_page(api_key, query, page_token=None):
    """One Text Search call. Returns (places_list, next_page_token_or_None)."""
    body = {
        "textQuery": query,
        "pageSize": PAGE_SIZE,
        "locationBias": {
            "circle": {
                "center": SIFNOS_CENTER,
                "radius": SEARCH_RADIUS_M,
            }
        },
    }
    if page_token:
        body["pageToken"] = page_token

    result     = _post("https://places.googleapis.com/v1/places:searchText",
                       api_key, SEARCH_FIELD_MASK, body)
    places     = result.get("places", [])
    next_token = result.get("nextPageToken")
    return places, next_token


# --- record builder -------------------------------------------------------------

def build_record(gp, couple_pick=False, couple_pick_note=""):
    display      = gp.get("displayName", {})
    name         = display.get("text", "") if isinstance(display, dict) else str(display)
    loc          = gp.get("location", {})
    hours_data   = gp.get("regularOpeningHours") or {}
    price_raw    = gp.get("priceLevel", "")

    return {
        "id":           gp.get("id", ""),
        "name":         name,
        "category":     map_category(gp.get("primaryType", ""), gp.get("types", [])),
        "primaryType":  gp.get("primaryType", ""),
        "couplePick":   couple_pick,
        "couplePickNote": couple_pick_note,
        "location":     {"lat": loc.get("latitude"), "lng": loc.get("longitude")},
        "address":      gp.get("formattedAddress", ""),
        "rating":       gp.get("rating"),
        "ratingCount":  gp.get("userRatingCount"),
        "priceLevel":   PRICE_MAP.get(price_raw),
        "openingHours": {
            "periods":             hours_data.get("periods", []),
            "weekdayDescriptions": hours_data.get("weekdayDescriptions", []),
        } if hours_data else None,
        "website":      gp.get("websiteUri", ""),
        "phone":        gp.get("nationalPhoneNumber", ""),
        "googleMapsUri": gp.get("googleMapsUri", ""),
    }


# --- token-count estimate -------------------------------------------------------

def estimate_tokens(places):
    """
    Rough estimate: one concise prompt line per place ~ 25 tokens.
    Add ~2000 tokens for the existing system prompt body.
    """
    return len(places) * 25 + 2000


# --- main -----------------------------------------------------------------------

def main():
    # -- 1. load key --
    env     = load_env(".env.local")
    api_key = env.get("GOOGLE_PLACES_API_KEY", "").strip()
    if not api_key:
        print_setup_instructions()
        sys.exit(1)
    masked = api_key[:6] + "..." + api_key[-4:]
    print(f"[OK]  GOOGLE_PLACES_API_KEY found in .env.local  ({masked})")

    # -- 2. parse curated list --
    curated       = parse_places_js("src/data/places.js")
    curated_picks = [p for p in curated if p["couplePick"]]
    print(f"[OK]  Parsed {len(curated)} places from places.js "
          f"({len(curated_picks)} with couplePick: true)")

    # -- STEP 4: COST GATE ------------------------------------------------------
    min_calls = len(QUERIES)          # 1 page each (optimistic)
    max_calls = len(QUERIES) * 3      # 3 pages each (very conservative)
    lo_cost   = min_calls * 0.04
    hi_cost   = max_calls * 0.05

    print()
    print("=" * 66)
    print("  STEP 4 --- COST GATE  (stop for approval before any network calls)")
    print("=" * 66)
    print(f"\n  Queries ({len(QUERIES)}):")
    for q in QUERIES:
        print(f"    - {q}")

    print(f"\n  Estimated API calls:  {min_calls}--{max_calls}  (20 results/page, may paginate)")
    print(f"  Call budget cap:      {MAX_CALLS}")
    print(f"  Estimated cost:       ${lo_cost:.2f}--${hi_cost:.2f}  (at $0.04--$0.05/call)")
    print()
    print("  +-------------------------------------------------------------+")
    print("  | VERIFY FIELD TIERS before proceeding:                      |")
    print("  | https://developers.google.com/maps/documentation/          |")
    print("  |        places/web-service/usage-and-billing                |")
    print("  |                                                             |")
    print("  | Abort if ANY field has moved to Enterprise tier.           |")
    print("  +-------------------------------------------------------------+")
    print()
    print(f"  {'Field':<35}  {'Declared tier':>14}")
    print(f"  {'-'*35}  {'-'*14}")
    enterprise_risk = False
    for field, tier in FIELD_TIERS.items():
        flag = "  <- VERIFY" if tier == "Pro" else ""
        print(f"  {field:<35}  {tier:>14}{flag}")
        if tier == "Enterprise":
            enterprise_risk = True
    if enterprise_risk:
        print("\n  [STOP]  One or more fields are declared Enterprise --- aborting.")
        sys.exit(1)
    print()
    print("  No Enterprise-tier fields are requested (as of script authoring).")
    print("  Confirm this is still current before typing 'y'.")
    print()

    ans = input("  Type 'y' to proceed, anything else to abort: ").strip().lower()
    if ans != "y":
        print("Aborted.")
        sys.exit(0)

    # -- FETCH ------------------------------------------------------------------
    print()
    raw_places = {}   # place_id -> raw API dict
    call_count = 0

    for query in QUERIES:
        page_token   = None
        query_new    = 0
        query_total  = 0

        while True:
            if call_count >= MAX_CALLS:
                print(f"\n[STOP]  HARD ABORT: {MAX_CALLS} call budget reached.")
                sys.exit(1)

            call_label = f"[{call_count + 1}]"
            suffix     = f" (page 2+)" if page_token else ""
            print(f"  {call_label} {query}{suffix} ... ", end="", flush=True)

            try:
                places, page_token = text_search_page(api_key, query, page_token)
                call_count += 1
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")[:400]
                print(f"[X]  HTTP {exc.code}: {body}")
                break
            except urllib.error.URLError as exc:
                print(f"[X]  URL error: {exc}")
                break

            for p in places:
                pid = p.get("id", "")
                if pid and pid not in raw_places:
                    raw_places[pid] = p
                    query_new += 1
            query_total += len(places)

            print(f"{query_total} results, {query_new} new unique")

            if not page_token:
                break   # no more pages for this query

    total_unique = len(raw_places)
    print(f"\n  [OK]  {total_unique} unique places collected in {call_count} call(s)")

    # -- STEP 6: MERGE + MATCH REPORT ------------------------------------------
    print()
    print("=" * 66)
    print("  STEP 6 --- MERGE WITH CARO & CHRIS'S PICKS  (stop for review)")
    print("=" * 66)

    curated_by_name   = {p["name"]: p for p in curated}
    curated_pick_names = [p["name"] for p in curated_picks]
    matched_pick_names = set()

    for pid, gp in raw_places.items():
        display = gp.get("displayName", {})
        gname   = display.get("text", "") if isinstance(display, dict) else str(display)
        matched_name, score = fuzzy_match(gname, list(curated_by_name.keys()))
        if matched_name:
            cp = curated_by_name[matched_name]
            gp["_couplePick"]     = cp["couplePick"]
            gp["_couplePickNote"] = cp["subtitle"]
            gp["_matchedName"]    = matched_name
            gp["_score"]          = round(score, 3)
            if cp["couplePick"]:
                matched_pick_names.add(matched_name)
        else:
            gp["_couplePick"]     = False
            gp["_couplePickNote"] = ""
            gp["_matchedName"]    = None
            gp["_score"]          = round(score, 3)

    unmatched = [n for n in curated_pick_names if n not in matched_pick_names]

    print(f"\n  {len(matched_pick_names)} of {len(curated_pick_names)} curated picks "
          f"matched in Google results.\n")
    if unmatched:
        print(f"  [!]  {len(unmatched)} curated pick(s) NOT found (score < {FUZZY_THRESHOLD}):")
        for n in unmatched:
            print(f"       - {n}")
        print()
        print("  These places weren't returned by Google's Text Search within 8 km.")
        print("  Possible reasons:")
        print("    - The place name on Google differs from the curated name.")
        print("    - The place has closed or isn't on Google Maps.")
        print("    - It's slightly outside the 8 km search radius.")
        print("  After the script finishes, you can add 'google_place_id' manually")
        print("  to places.js and re-run to force a match.")
    else:
        print("  [OK]  All curated picks matched!")

    print()
    ans = input("  Review the above. Type 'y' to build the JSON, anything else to abort: ").strip().lower()
    if ans != "y":
        print("Aborted. Adjust places.js names or search radius and re-run.")
        sys.exit(0)

    # -- BUILD OUTPUT -----------------------------------------------------------
    now_utc     = datetime.now(timezone.utc)
    refresh_due = now_utc + timedelta(days=30)
    output_places   = []
    category_counts = {}

    for pid, gp in raw_places.items():
        rec  = build_record(gp, gp.get("_couplePick", False), gp.get("_couplePickNote", ""))
        output_places.append(rec)
        cat = rec["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # Sort: couple picks first, then rating descending, then name
    output_places.sort(key=lambda p: (
        not p["couplePick"],
        -(p["rating"] or 0),
        p["name"].lower(),
    ))

    output = {
        "fetched_at":         now_utc.isoformat(),
        "source":             "Google Places API (New)",
        "attribution_required": True,
        "refresh_due_by":     refresh_due.isoformat(),
        "place_count":        len(output_places),
        "places":             output_places,
    }

    out_path = "src/data/sifnos-places.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\n  [OK]  Wrote {len(output_places)} places to {out_path}")

    # -- STEP 14: DATA SPOT-CHECK -----------------------------------------------
    print()
    print("=" * 66)
    print("  STEP 14 --- DATA SPOT-CHECK  (stop for review before integration)")
    print("=" * 66)

    samples = random.sample(output_places, min(5, len(output_places)))
    print(f"\n  5 random sample records:\n")
    for i, p in enumerate(samples, 1):
        print(f"  [{i}]  {json.dumps(p, ensure_ascii=False, indent=6)}\n")

    print("  Count by category:")
    for cat, n in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"    {cat:<18} {n}")
    print(f"    {'TOTAL':<18} {len(output_places)}")

    couple_count = sum(1 for p in output_places if p["couplePick"])
    print(f"\n  Couple picks matched:  {couple_count} places with couplePick: true")
    print(f"  API calls made:        {call_count}")
    est_cost = call_count * 0.05
    print(f"  Estimated cost:        ~${est_cost:.2f}  (at $0.05/call --- verify on billing page)")

    est_tokens = estimate_tokens(output_places)
    print(f"\n  Estimated system-prompt token impact: ~{est_tokens:,} tokens total")
    if est_tokens > 6000:
        print(f"  [!]  Token count exceeds 6,000. Claude will ask whether to trim")
        print(f"     to top-N per category before doing the backend integration.")
    else:
        print(f"  [OK]  Token count is within the 6,000-token target.")

    print()
    print("  --- STEP 15 --- PRE-COMMIT CHECKLIST (for Claude to run) ----------")
    print()
    print(f"  Before any git commit, Claude must:")
    print(f"    1. Confirm GOOGLE_PLACES_API_KEY is only in .env.local (gitignored).")
    print(f"    2. grep the repo for the literal key value --- abort if found elsewhere.")
    print(f"    3. Show you the staged file list before committing.")
    print()
    print(f"  Files that SHOULD be staged:")
    print(f"    + src/data/sifnos-places.json")
    print(f"    + api/chat.py   (after Claude's integration step)")
    print(f"    + src/tabs/SifnosTab.jsx  (after Claude's integration step)")
    print(f"    + src/styles.css  (if Claude adds new styles)")
    print()
    print(f"  Files that must NOT be staged:")
    print(f"    [X] .env.local")
    print(f"    [X] scripts/fetch_sifnos_places.py  (local utility, not app code)")
    print(f"    [X] scripts/refresh_sifnos_places.py")
    print()

    ans = input("  Data looks good? Type 'y' to confirm and proceed with integration: ").strip().lower()
    if ans != "y":
        print("  Paused. Re-run or adjust as needed.")
        sys.exit(0)

    print()
    print("  [OK]  Script complete.")
    print()
    print("  Tell Claude: 'Data looks good --- proceed with integration.'")
    print("  Claude will then update api/chat.py and SifnosTab.jsx.")
    print()


if __name__ == "__main__":
    main()

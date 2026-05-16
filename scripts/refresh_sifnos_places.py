#!/usr/bin/env python3
"""
scripts/refresh_sifnos_places.py

Google's Terms of Service require place data to be refreshed every 30 days.

Re-run this in late August 2026, roughly 1--2 weeks before the wedding,
so the data is fresh for the event.

Usage (from project root):
  python scripts/refresh_sifnos_places.py

Strategy: reuses existing place IDs from sifnos-places.json and calls
Place Details (New) directly --- cheaper than re-running Text Search.
Preserves couplePick / couplePickNote annotations from the original fetch;
only live data (rating, hours, phone, website) is refreshed.

NEVER deployed to Vercel. No user data ever touches Google at runtime.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone, timedelta


# --- configuration -------------------------------------------------------------

MAX_CALLS  = 200
JSON_PATH  = "src/data/sifnos-places.json"

# Place Details field mask --- same Essentials + Pro fields as the fetch script.
# NO `places.` prefix here; Details returns a single place object, not an array.
# Verify tiers at: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
DETAILS_FIELD_MASK = ",".join([
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "types",
    "primaryType",
    "rating",
    "userRatingCount",
    "priceLevel",
    "regularOpeningHours",
    "websiteUri",
    "nationalPhoneNumber",
    "googleMapsUri",
])

PRICE_MAP = {
    "PRICE_LEVEL_FREE":           0,
    "PRICE_LEVEL_INEXPENSIVE":    1,
    "PRICE_LEVEL_MODERATE":       2,
    "PRICE_LEVEL_EXPENSIVE":      3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
}


# --- helpers -------------------------------------------------------------------

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


def place_details(api_key, place_id):
    """
    Call Place Details (New). Returns the raw place dict or None on error.
    """
    url = f"https://places.googleapis.com/v1/places/{place_id}"
    req = urllib.request.Request(
        url,
        headers={
            "X-Goog-Api-Key":   api_key,
            "X-Goog-FieldMask": DETAILS_FIELD_MASK,
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None   # place no longer exists on Google Maps
        body = exc.read().decode("utf-8", errors="replace")[:300]
        print(f"    [X]  HTTP {exc.code}: {body}")
        return None
    except urllib.error.URLError as exc:
        print(f"    [X]  URL error: {exc}")
        return None


def merge_fresh(existing, fresh):
    """
    Update only live-data fields in an existing record.
    Preserves: couplePick, couplePickNote, category.
    Refreshes: rating, ratingCount, priceLevel, openingHours, website, phone,
               googleMapsUri, address, name (in case of a rename).
    """
    if fresh is None:
        existing["_stale"] = True
        return existing

    display = fresh.get("displayName", {})
    name    = display.get("text", "") if isinstance(display, dict) else str(display)
    loc     = fresh.get("location", {})
    hours   = fresh.get("regularOpeningHours") or {}

    existing.update({
        "name":         name or existing["name"],
        "address":      fresh.get("formattedAddress", existing.get("address", "")),
        "location":     {
            "lat": loc.get("latitude", (existing.get("location") or {}).get("lat")),
            "lng": loc.get("longitude", (existing.get("location") or {}).get("lng")),
        },
        "rating":       fresh.get("rating"),
        "ratingCount":  fresh.get("userRatingCount"),
        "priceLevel":   PRICE_MAP.get(fresh.get("priceLevel", ""), existing.get("priceLevel")),
        "openingHours": {
            "periods":             hours.get("periods", []),
            "weekdayDescriptions": hours.get("weekdayDescriptions", []),
        } if hours else None,
        "website":       fresh.get("websiteUri", existing.get("website", "")),
        "phone":         fresh.get("nationalPhoneNumber", existing.get("phone", "")),
        "googleMapsUri": fresh.get("googleMapsUri", existing.get("googleMapsUri", "")),
        "_stale":        False,
    })
    return existing


# --- main -----------------------------------------------------------------------

def main():
    # 1. Load API key
    env     = load_env(".env.local")
    api_key = env.get("GOOGLE_PLACES_API_KEY", "").strip()
    if not api_key:
        print("GOOGLE_PLACES_API_KEY not found in .env.local.")
        print("Run scripts/fetch_sifnos_places.py first for setup instructions.")
        sys.exit(1)
    masked = api_key[:6] + "..." + api_key[-4:]
    print(f"[OK]  GOOGLE_PLACES_API_KEY found  ({masked})")

    # 2. Load existing JSON
    try:
        with open(JSON_PATH, encoding="utf-8") as f:
            existing_data = json.load(f)
    except FileNotFoundError:
        print(f"[X]  {JSON_PATH} not found.")
        print("   Run scripts/fetch_sifnos_places.py first to create it.")
        sys.exit(1)

    existing_places = existing_data.get("places", [])
    fetched_at      = existing_data.get("fetched_at", "unknown")
    refresh_due     = existing_data.get("refresh_due_by", "unknown")
    n               = len(existing_places)

    print(f"[OK]  Loaded {n} existing places from {JSON_PATH}")
    print(f"   Original fetch: {fetched_at}")
    print(f"   Refresh due by: {refresh_due}")

    # 3. Cost gate
    lo_cost = n * 0.04
    hi_cost = n * 0.06

    print()
    print("=" * 66)
    print("  COST GATE --- Place Details refresh")
    print("=" * 66)
    print(f"\n  Places to refresh: {n}")
    print(f"  API calls needed:  {n}  (1 call per place, no pagination)")
    print(f"  Call budget cap:   {MAX_CALLS}")
    if n > MAX_CALLS:
        print(f"\n  [STOP]  {n} places exceeds the {MAX_CALLS} call budget. Aborting.")
        sys.exit(1)
    print(f"  Estimated cost:    ${lo_cost:.2f}--${hi_cost:.2f}  (verify rate at billing page)")
    print()
    print("  Field tier:  same Essentials + Pro fields as original fetch.")
    print("  Verify at:   https://developers.google.com/maps/documentation/")
    print("               places/web-service/usage-and-billing")
    print()

    ans = input("  Type 'y' to start refreshing, anything else to abort: ").strip().lower()
    if ans != "y":
        print("Aborted.")
        sys.exit(0)

    # 4. Refresh each place
    print()
    refreshed     = []
    call_count    = 0
    stale_count   = 0
    updated_count = 0

    for rec in existing_places:
        pid   = rec.get("id", "")
        pname = rec.get("name", "?")

        if not pid:
            print(f"  [!]  Skipping '{pname}' --- no Google place ID")
            refreshed.append(rec)
            continue

        if call_count >= MAX_CALLS:
            print(f"\n[STOP]  HARD ABORT: {MAX_CALLS} call budget reached.")
            sys.exit(1)

        print(f"  [{call_count + 1}/{n}] {pname} ... ", end="", flush=True)
        fresh      = place_details(api_key, pid)
        call_count += 1

        if fresh is None:
            print("not found on Google --- keeping existing data, marked stale")
            rec["_stale"] = True
            stale_count  += 1
        else:
            display = fresh.get("displayName", {})
            fname   = display.get("text", pname) if isinstance(display, dict) else pname
            rating  = fresh.get("rating", "---")
            print(f"ok  (name: {fname!r}, rating: {rating})")
            updated_count += 1

        refreshed.append(merge_fresh(rec, fresh))

    # 5. Write refreshed JSON
    now_utc     = datetime.now(timezone.utc)
    refresh_due = now_utc + timedelta(days=30)

    output = {
        "fetched_at":           now_utc.isoformat(),
        "source":               "Google Places API (New)",
        "attribution_required": True,
        "refresh_due_by":       refresh_due.isoformat(),
        "place_count":          len(refreshed),
        "places":               refreshed,
    }

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print()
    print(f"  [OK]  Refreshed {JSON_PATH}")
    print(f"     {updated_count} updated, {stale_count} stale (kept as-is)")
    print(f"     API calls: {call_count}  |  estimated cost: ~${call_count * 0.05:.2f}")
    print(f"     Next refresh due by: {refresh_due.strftime('%Y-%m-%d')}")
    if stale_count:
        print()
        print(f"  [!]  {stale_count} place(s) marked _stale --- Google returned 404.")
        print(f"     Review the JSON and consider removing closed venues.")
    print()
    print("  Done. Commit src/data/sifnos-places.json when satisfied.")
    print()


if __name__ == "__main__":
    main()

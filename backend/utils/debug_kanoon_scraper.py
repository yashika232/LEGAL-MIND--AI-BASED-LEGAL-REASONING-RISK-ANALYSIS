"""
Run this from your Backend folder:
    python debug_kanoon.py

It prints the real class names and structure of the first result div
so we can write correct selectors for kanoon_scraper.py
"""
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

url = "https://indiankanoon.org/search/?formInput=criminal+IPC+conviction"
print(f"Fetching: {url}\n")

resp = requests.get(url, headers=HEADERS, timeout=10)
soup = BeautifulSoup(resp.text, "html.parser")

# --- 1. Show ALL div class names on the page ---
all_classes = set()
for tag in soup.find_all(True):
    for c in tag.get("class", []):
        all_classes.add(f"{tag.name}.{c}")

print("=== ALL TAG+CLASS COMBOS ===")
for c in sorted(all_classes):
    print(" ", c)

# --- 2. Show the raw HTML of the first 2 result-like divs ---
print("\n=== FIRST 2 RESULT DIVS (raw HTML, truncated) ===")
# Try a few likely container names
for cls in ("result", "judgments", "judgment", "result_title", "list_result", "results"):
    hits = soup.find_all(class_=cls)
    if hits:
        print(f"\n  Found {len(hits)} elements with class='{cls}':")
        for div in hits[:2]:
            print("  ---")
            print(str(div)[:800])
        break
else:
    # Fallback — just show the first 3 <li> or <div> children of main content
    main = soup.find("div", id="main") or soup.find("body")
    if main:
        for i, child in enumerate(main.find_all(["div", "li"], recursive=False)[:3]):
            print(f"\n  Child {i}: {str(child)[:600]}")
import requests
from bs4 import BeautifulSoup
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def search_indian_kanoon(query, max_results=5):
    """Search Indian Kanoon for similar judgements."""
    results = []
    try:
        search_url = f"https://indiankanoon.org/search/?formInput={query.replace(' ', '+')}"
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Each result is an <article class="result">
        articles = soup.find_all("article", class_="result")[:max_results]

        for article in articles:
            try:
                # Title: h4.result_title > a
                title_tag = article.find("h4", class_="result_title")
                a_tag = title_tag.find("a") if title_tag else None
                title = a_tag.get_text(strip=True) if a_tag else "Unknown Case"

                # Link: href is /docfragment/ID/ — convert to full /doc/ID/ for clean URL
                href = a_tag.get("href", "") if a_tag else ""
                # Extract doc ID from /docfragment/151222872/?...
                doc_id = href.split("/")[2] if href else ""
                link = f"https://indiankanoon.org/doc/{doc_id}/" if doc_id else ""

                # Snippet: div.headline (contains highlighted keywords)
                headline = article.find("div", class_="headline")
                snippet = headline.get_text(separator=" ", strip=True)[:300] if headline else ""

                # Court: span.docsource
                docsource = article.find("span", class_="docsource")
                court = docsource.get_text(strip=True) if docsource else ""

                # Date: embedded in the title string after "on DD Month, YYYY"
                date = ""
                if " on " in title:
                    date = title.split(" on ")[-1].strip()
                    title = title.split(" on ")[0].strip()

                results.append({
                    "title": title,
                    "link": link,
                    "snippet": snippet,
                    "court": court,
                    "date": date,
                })
            except Exception:
                continue

        time.sleep(0.5)

    except requests.RequestException as e:
        print(f"[Kanoon] Network error: {e}")
    except Exception as e:
        print(f"[Kanoon] Scrape error: {e}")

    return results


def build_query(case_type, description):
    """Build a search query for Indian Kanoon."""
    keywords = {
        "criminal": "criminal case IPC section conviction",
        "civil": "civil dispute damages compensation",
        "family": "family court divorce custody maintenance",
        "corporate": "company law SEBI corporate fraud",
        "property": "property dispute land acquisition title",
    }
    base = keywords.get(case_type, "legal case judgment")
    desc_keywords = " ".join(description.split()[:8]) if description else ""
    return f"{base} {desc_keywords}".strip()
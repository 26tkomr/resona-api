export default async function handler(req, res) {
  const API_KEY = process.env.TWELVE_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "TWELVE_KEY is not set" });
  }

  const BASE = "https://api.twelvedata.com";

  async function fetchJson(url) {
    const r = await fetch(url);
    const t = await r.text();
    let j = null;
    try { j = JSON.parse(t); } catch {}
    return { ok: r.ok, status: r.status, text: t, json: j };
  }

  async function fetchPrice(symbol) {
    const url = `${BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`;
    const out = await fetchJson(url);
    const price = Number(out.json?.price);
    return {
      symbol,
      url,
      status: out.status,
      raw: out.json ?? out.text,
      price: Number.isFinite(price) ? price : null,
    };
  }

  async function resolveBySearch(query, preferred = []) {
    const url = `${BASE}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${API_KEY}`;
    const out = await fetchJson(url);
    const list = Array.isArray(out.json?.data) ? out.json.data : [];

    for (const cand of preferred) {
      const found = list.find((x) => String(x.symbol || "").toUpperCase() === cand.toUpperCase());
      if (found) return { symbol: found.symbol, raw: out.json, status: out.status };
    }

    if (list.length > 0 && list[0].symbol) {
      return { symbol: list[0].symbol, raw: out.json, status: out.status };
    }

    return { symbol: null, raw: out.json ?? out.text, status: out.status };
  }

  try {
    const usd = await fetchPrice("USD/JPY");
    const sp500 = await fetchPrice("SPY"); // S&P500 proxy
    const topix = await fetchPrice("1306"); // TOPIX proxy ETF fixed

    // Nikkei は検索語を変えて候補探索
    const nikkeiSearch = await resolveBySearch("Nikkei 225", ["1321", "1329", "EWJ"]);
    const nikkei = nikkeiSearch.symbol ? await fetchPrice(nikkeiSearch.symbol) : null;

    const result = {
      usd_jpy: usd.price != null ? String(usd.price) : null,
      sp500: sp500.price != null ? String(sp500.price) : null,
      nikkei: nikkei?.price != null ? String(nikkei.price) : null,
      topix: topix.price != null ? String(topix.price) : null,
      updated_at: new Date().toISOString(),
      source: "twelvedata",
      raw: {
        usd_jpy: usd,
        sp500,
        nikkei_search: nikkeiSearch,
        nikkei,
        topix,
      },
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch market data",
      details: String(error),
    });
  }
}

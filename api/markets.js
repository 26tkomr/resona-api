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
      status: out.status,
      raw: out.json ?? out.text,
      price: Number.isFinite(price) ? price : null,
    };
  }

  try {
    const [usd, sp500, nikkei, topix] = await Promise.all([
      fetchPrice("USD/JPY"),
      fetchPrice("SPY"),   // S&P500 proxy ETF
      fetchPrice("1321"),  // Nikkei 225 proxy ETF
      fetchPrice("1306"),  // TOPIX proxy ETF
    ]);

    const result = {
      usd_jpy: usd.price != null ? String(usd.price) : null,
      sp500: sp500.price != null ? String(sp500.price) : null,
      nikkei: nikkei.price != null ? String(nikkei.price) : null,
      topix: topix.price != null ? String(topix.price) : null,
      updated_at: new Date().toISOString(),
      source: "twelvedata",
      raw: {
        usd_jpy: usd,
        sp500,
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

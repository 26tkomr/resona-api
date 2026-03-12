export default async function handler(req, res) {
  const API_KEY = process.env.TWELVE_KEY;
  const BASE = "https://api.twelvedata.com";

  async function fetchTwelve(symbol) {
    const r = await fetch(`${BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`);
    const j = await r.json();
    const price = Number(j.price);

    return {
      symbol,
      source: "twelvedata",
      raw: j,
      price: Number.isFinite(price) ? price : null,
    };
  }

  async function fetchStooq(symbol) {
    const r = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&i=1`);
    const text = await r.text();
    const parts = text.split(",");
    const price = Number(parts[3]);

    return {
      symbol,
      source: "stooq",
      raw: text,
      price: Number.isFinite(price) ? price : null,
    };
  }

  try {
    const [usd_jpy, sp500, nikkei, topix] = await Promise.all([
      fetchTwelve("USD/JPY"),
      fetchTwelve("SPY"),   // S&P500 proxy
      fetchStooq("^nkx"),   // Nikkei proxy
      fetchStooq("^tpx"),   // TOPIX proxy
    ]);

    return res.status(200).json({
      usd_jpy: usd_jpy.price,
      sp500: sp500.price,
      nikkei: nikkei.price,
      topix: topix.price,
      updated_at: new Date().toISOString(),
      source: {
        usd_jpy: usd_jpy.source,
        sp500: sp500.source,
        nikkei: nikkei.source,
        topix: topix.source,
      },
      raw: {
        usd_jpy,
        sp500,
        nikkei,
        topix,
      },
    });
  } catch (e) {
    return res.status(500).json({
      error: "market fetch failed",
      detail: String(e),
    });
  }
}

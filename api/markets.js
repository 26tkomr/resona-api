export default async function handler(req, res) {
  const API_KEY = process.env.TWELVE_KEY;
  const BASE = "https://api.twelvedata.com";

  async function fetchTwelve(symbol) {
    const r = await fetch(`${BASE}/price?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`);
    const j = await r.json();
    return {
      symbol,
      raw: j,
      price: Number(j.price ?? null)
    };
  }

  async function fetchStooq(symbol) {
    const r = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&i=1`);
    const text = await r.text();
    const parts = text.split(",");
    const price = Number(parts[3]);

    return {
      symbol,
      raw: text,
      parsed: parts,
      price: Number.isFinite(price) ? price : null
    };
  }

  try {
    const [usd_jpy, sp500, nikkei_test, topix_test] = await Promise.all([
      fetchTwelve("USD/JPY"),
      fetchTwelve("SPY"),
      fetchStooq("^nkx"),
      fetchStooq("^topx")
    ]);

    return res.status(200).json({
      usd_jpy,
      sp500,
      nikkei_test,
      topix_test,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({
      error: "market fetch failed",
      detail: String(e)
    });
  }
}

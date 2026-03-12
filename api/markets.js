export default async function handler(req, res) {

  const API_KEY = process.env.TWELVE_KEY;
  const BASE = "https://api.twelvedata.com";

  async function fetchTwelve(symbol) {
    const r = await fetch(`${BASE}/price?symbol=${symbol}&apikey=${API_KEY}`);
    const j = await r.json();
    return Number(j.price);
  }

  async function fetchStooq(symbol) {
    const r = await fetch(`https://stooq.com/q/l/?s=${symbol}&i=1`);
    const text = await r.text();

    const parts = text.split(",");
    const price = Number(parts[3]);

    return price;
  }

  try {

    const [usd_jpy, sp500, nikkei, topix] = await Promise.all([

      fetchTwelve("USD/JPY"),
      fetchTwelve("SPY"),

      fetchStooq("^nkx"),
      fetchStooq("^topx")

    ]);

    res.status(200).json({

      usd_jpy: usd_jpy,
      sp500: sp500,
      nikkei: nikkei,
      topix: topix,

      updated_at: new Date().toISOString(),
      source: "mixed"

    });

  } catch (e) {

    res.status(500).json({
      error: "market fetch failed",
      detail: e.toString()
    });

  }

}

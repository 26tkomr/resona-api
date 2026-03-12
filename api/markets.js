export default async function handler(req, res) {
  async function fetchStooq(symbol) {
    const r = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&i=1`);
    const text = await r.text();
    return { symbol, raw: text };
  }

  try {
    const candidates = await Promise.all([
      fetchStooq("^nkx"),
      fetchStooq("^n225"),
      fetchStooq("^nikkei"),
      fetchStooq("^tpx"),
      fetchStooq("^topx"),
      fetchStooq("^jtop"),
    ]);

    return res.status(200).json({
      candidates,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({
      error: "stooq probe failed",
      detail: String(e),
    });
  }
}

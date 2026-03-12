export default async function handler(req, res) {
  const API_KEY = process.env.TWELVE_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: "TWELVE_KEY is not set",
    });
  }

  const symbols = ["USD/JPY", "^GSPC", "^N225"].join(",");

  const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const result = {
      usd_jpy: data["USD/JPY"]?.price ?? null,
      sp500: data["^GSPC"]?.price ?? null,
      nikkei: data["^N225"]?.price ?? null,
      updated_at: new Date().toISOString(),
      source: "twelvedata",
      raw: data,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch market data",
      details: String(error),
    });
  }
}

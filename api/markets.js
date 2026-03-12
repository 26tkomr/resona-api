export default async function handler(req, res) {
  const API_KEY = process.env.TWELVE_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: "TWELVE_KEY is not set",
    });
  }

  // まずは確実に通るものだけ
  const symbols = ["USD/JPY", "SPY"].join(",");

  const url =
    "https://api.twelvedata.com/price?symbol=" +
    encodeURIComponent(symbols) +
    "&apikey=" +
    API_KEY;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const result = {
      usd_jpy: data["USD/JPY"]?.price ?? null,
      sp500_proxy: data["SPY"]?.price ?? null,
      updated_at: new Date().toISOString(),
      source: "twelvedata",
      raw: data,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch market data",
      details: String(error),
    });
  }
}

export default async function handler(req, res) {

  const API_KEY = process.env.TWELVE_KEY

  const symbols = ["USD/JPY","SPX","NIKKEI","TOPIX"].join(",")

  const url =
  "https://api.twelvedata.com/price?symbol="
  + encodeURIComponent(symbols)
  + "&apikey="
  + API_KEY

  const response = await fetch(url)
  const data = await response.json()

  const result = {
    usd_jpy: data["USD/JPY"]?.price ?? null,
    sp500: data["SPX"]?.price ?? null,
    nikkei: data["NIKKEI"]?.price ?? null,
    topix: data["TOPIX"]?.price ?? null,
    updated_at: new Date().toISOString(),
    source: "twelvedata",
    raw: data
  }

  res.status(200).json(result)

}

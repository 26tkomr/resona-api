export default async function handler(req, res) {

const API_KEY = process.env.TWELVE_KEY

const url =
"https://api.twelvedata.com/price?symbol=USD/JPY&apikey=" + API_KEY

const response = await fetch(url)

const data = await response.json()

res.status(200).json(data)

}

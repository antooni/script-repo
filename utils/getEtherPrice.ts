import fetch from "node-fetch"; 

export async function getCurrentPrice(coingeckoId: string, currency = "usd"): Promise<number> {
  const priceRequest = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=${currency}`;
  const priceResponse = await fetch(priceRequest);
  const price = await priceResponse.json();

  return price[coingeckoId][currency]
}

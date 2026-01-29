export const getTokenPrice = async (tokenAddress: string) => {
  // Get token price from DexTools
  const priceResponse = await fetch(
    `https://public-api.dextools.io/trial/v2/token/bsc/${tokenAddress}/price`,
    {
      headers: {
        "X-API-KEY": process.env.DEXTOOLS_API_KEY || "",
        accept: "application/json",
      },
    }
  );
  const res = await priceResponse.json();
  
  // Try to get market cap from various possible fields in DexTools response
  const marketCap = res.data?.marketCap 
    || res.data?.marketCapUSD 
    || res.data?.fdv 
    || res.data?.fullyDilutedValuation
    || res.data?.marketCapFullyDiluted
    || 0;

  const priceData = {
    priceUsd: res.data?.price || 0,
    priceChange: {
      m5: res.data?.variation5m || 0,
      h1: res.data?.variation1h || 0,
      h6: res.data?.variation6h || 0,
      h24: res.data?.variation24h || 0,
    },
    marketCap: marketCap,
    // Also include circulating supply if available for manual calculation
    circulatingSupply: res.data?.circulatingSupply || res.data?.supply || null,
  };

  return priceData;
};


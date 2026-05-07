export const getTokenPrice = async (tokenAddress: string) => {
  // Get token price from DexTools
  try {
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
    const priceData = {
      priceUsd: res.data?.price || 0,
      priceChange: {
        m5: res.data?.variation5m || 0,
        h1: res.data?.variation1h || 0,
        h6: res.data?.variation6h || 0,
        h24: res.data?.variation24h || 0,
      },
    };
    return priceData;
  } catch (error) {
    console.error("Error fetching token price from DFS:", error);
    return null;
  }
};

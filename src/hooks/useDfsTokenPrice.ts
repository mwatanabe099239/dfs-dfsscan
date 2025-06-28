import { useState, useEffect } from "react";

interface TokenPriceData {
  priceUsd: number;
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
}

interface DfsData {
  priceData: TokenPriceData | null;
  baseFee: number | null;
}

interface UseDfsTokenPriceReturn {
  data: DfsData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDfsTokenPrice = (): UseDfsTokenPriceReturn => {
  const [data, setData] = useState<DfsData>({
    priceData: null,
    baseFee: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [priceResponse, baseFeeResponse] = await Promise.all([
        fetch("/api/dfs-onchain-token-price"),
        fetch("/api/dfschain-information/dfs-base-fee"),
      ]);

      if (!priceResponse.ok || !baseFeeResponse.ok) {
        throw new Error("Failed to fetch DFS data");
      }

      const [priceResult, baseFeeResult] = await Promise.all([
        priceResponse.json(),
        baseFeeResponse.json(),
      ]);

      const baseFeeInDFS = baseFeeResult.data / priceResult.data.priceUsd;

      setData({
        priceData: priceResult.data,
        baseFee: baseFeeInDFS,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching DFS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};

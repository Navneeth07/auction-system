import { useState } from "react";
import { handleApiError } from "../lib/api/errorHandler";

type ApiFunction<TArgs extends unknown[], TResponse> = (
  ...args: TArgs
) => Promise<{ data: TResponse }>;

export function useApi<TArgs extends unknown[], TResponse>(
  apiFunc: ApiFunction<TArgs, TResponse>
) {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (...args: TArgs): Promise<TResponse> => {
    try {
      setLoading(true);
      const response = await apiFunc(...args);
      setData(response.data);
      setError(null);
      return response.data;
    } catch (err: unknown) {
      const message = handleApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, request };
}

import { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "@/constants";

// custom hook to fetch data
export function useDataFetch<T>(endpoint: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  // fetcher users function
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error);
      } else {
        setError(new Error("An error occurred"));
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  return {
    data,
    loading,
    error,
  };
}

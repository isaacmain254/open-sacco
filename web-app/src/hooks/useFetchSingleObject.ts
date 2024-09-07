import { apiBaseUrl } from "@/constants";
import axios from "axios";
import { useEffect, useState } from "react";

export function useFetchSingleObject<T>(
  endpoint: string,
  editItem: boolean = false
) {
  const [data, setData] = useState<T>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
        setData(response.data);
      } catch (error) {
        throw new Error("An error occurred");
      }
    };
    if (editItem === true) {
      fetchData();
    }
  }, []);
  return {
    data,
  };
}

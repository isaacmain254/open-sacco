import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// types
import { UserProps } from "@/types";
import { apiBaseUrl } from "@/constants";

export function useUserProfileInfo() {
  const [profile, setProfile] = useState<UserProps>();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const TOKEN = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        };
        const response = await axios.get(`${apiBaseUrl}/api/profile/`, {
          headers: headers,
        });
        setProfile(response.data);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response.status === 401) {
          try {
            const refreshToken = localStorage.getItem("refresh_token");
            const response = await axios.post(
              `${apiBaseUrl}/api/token/refresh/`,
              { refresh: refreshToken }
            );
            localStorage.setItem("access_token", response.data.access);
            fetchProfile();
          } catch (refreshError) {
            navigate("/login");
          }
        }
      }
    };
    fetchProfile();
  }, []);
  return {
    profile,
  };
}

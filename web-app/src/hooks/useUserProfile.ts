import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// types
import { ProfileProps } from "@/types";
export function useUserProfileInfo() {
  const [profile, setProfile] = useState<ProfileProps[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // TODO:find a  way to handle input value change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    console.log("value");
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const TOKEN = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        };
        const response = await axios.get("http://localhost:8000/api/profile/", {
          headers: headers,
        });
        setProfile(response.data);
        setUsername(response.data[0].user.username);
        setEmail(response.data[0].user.email); // Set email state
        setRole(response.data[0].role_display);
        setImageUrl(response.data[0].profile_image);
      } catch (error) {
        if (error.response.status === 401) {
          try {
            const refreshToken = localStorage.getItem("refresh_token");
            const response = await axios.post(
              "http://localhost:8000/api/token/refresh/",
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
    username,
    email,
    role,
    imageUrl,
    handleUsernameChange,
    handleEmailChange,
    handleImageUrlChange,
  };
}

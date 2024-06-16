import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FormInput from "@/components/FormInput";

interface UserProps {
  email: string;
  username: string;
}
interface ProfileProps {
  id: string;
  role: string;
  profile_image: string;
  user: UserProps;
}
// FIXME: Profile component not displaying user profile information. The TOKEN expires very fast add way to refresh token
// TODO: add type to profile state
const Profile = () => {
  const [profile, setProfile] = useState<ProfileProps[]>([]);
  const [username, setUsername] = useState("");

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
  console.log(profile);
  return (
    <>
      {profile &&
        profile.map((item) => (
          <div key={item.id}>
            <h1>{item.user.email}</h1>
            <p>Username: {item.user.username}</p>
            <p>Role: {item.role}</p>
            <img
              src={`http://127.0.0.1:8000${item.profile_image}`}
              alt="Profile"
            />
          </div>
        ))}
    </>
    //   <div className="border border-red-600 w-2/3 mx-auto">
    //     <h1>Update Profile</h1>
    //  <form>
    //   <FormInput name={username} type="text" />
    //  </form>
    //   </div>
  );
};

export default Profile;

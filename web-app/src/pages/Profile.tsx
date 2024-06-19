import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
// custom hook
import { useUserProfileInfo } from "@/hooks/useUserProfile";
// components
import Button from "@/components/Button";
import FormInput from "@/components/FormInput";
import Spinner from "@/components/Spinner";

// FIXME: Profile component not displaying user profile information. The TOKEN expires very fast add way to refresh token
// TODO: add type to profile state
const Profile = () => {
  const [loading, setLoading] = useState(false);

  const {
    username,
    email,
    role,
    imageUrl,
    handleUsernameChange,
    handleEmailChange,
  } = useUserProfileInfo();
  // handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const TOKEN = localStorage.getItem("access_token");
      await axios.put(
        "http://localhost:8000/api/profile/",
        {
          user: {
            username,
            email,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Account updated successfully", { autoClose: 2000 });
    } catch (error) {
      setLoading(false);
      toast.error("Error updating account", { autoClose: 2000 });
    }
  };
  return (
    <div className=" w-2/3 mx-auto mt-5">
      <h1 className="text-2xl mb-2">Update Profile</h1>
      <div className=" w-full flex justify-center items-center  border border-slate-950/25 dark:border-slate-400 rounded-md">
        <form
          className="max-w-min space-y-4 mb-5"
          onSubmit={handleProfileUpdate}
        >
          <img
            src={`http://localhost:8000${imageUrl}`}
            alt="profile image"
            className=" w-48 h-48 rounded-full mx-auto object-fill"
          />
          <FormInput
            name={username}
            type="text"
            value={username}
            label="Username"
            onChange={handleUsernameChange}
            className=""
          />
          <FormInput
            name={email}
            type="email"
            value={email}
            label="Email :"
            onChange={handleEmailChange}
          />
          <FormInput
            name={role}
            type="text"
            value={role}
            label="Role :"
            disabled={true}
          />

          <Button
            type="submit"
            text={loading ? <Spinner /> : "Update Profile"}
            className="w-full mb-8"
          />
        </form>
      </div>
    </div>
  );
};

export default Profile;

// <>
// {profile &&
//   profile.map((item) => (
//     <div key={item.id}>
//       <h1>{item.user.email}</h1>
//       <p>Username: {item.user.username}</p>
//       <p>Role: {item.role}</p>
//       <img
//         src={`http://127.0.0.1:8000${item.profile_image}`}
//         alt="Profile"
//       />
//     </div>
//   ))}
// </>

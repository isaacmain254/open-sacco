import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
// custom hook
import { useUserProfileInfo } from "@/hooks/useUserProfile";
// components
import Button from "@/components/Button";
import FormInput from "@/components/FormInput";
import Spinner from "@/components/Spinner";
import LucideIcon from "@/components/LucideIcon";

// FIXME: Profile component not displaying user profile information. The TOKEN expires very fast add way to refresh token
// TODO: add type to profile state
const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const {
    username,
    email,
    role,
    imageSrc,
    handleUsernameChange,
    handleEmailChange,
    handleImageUrlChange,
  } = useUserProfileInfo();
  // handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const TOKEN = localStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (newImage) {
        formData.append("profile.profile_image", newImage);
      }

      await axios.patch("http://localhost:8000/api/profile/", formData, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Account updated successfully", { autoClose: 2000 });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error updating account", { autoClose: 2000 });
    }
  };

  const handleNewImage = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
  };

  const handleImageUpdate = () => {
    imageInputRef.current?.click();
  };
  return (
    <div className=" w-2/3 mx-auto mt-5">
      <h1 className="text-2xl mb-2">Update Profile</h1>
      <div className=" w-full flex justify-center items-center  border border-slate-950/25 dark:border-slate-400 rounded-md">
        <form
          className="max-w-min space-y-4 mb-5"
          onSubmit={handleProfileUpdate}
        >
          <div className="relative ">
            <img
              src={
                newImage
                  ? newImage
                  : imageSrc && `http://localhost:8000${imageSrc}`
              }
              alt="profile image"
              className=" w-48 h-48 rounded-full mx-auto object-fill"
            />
            <LucideIcon
              name="Camera"
              className="absolute bottom-4 right-12"
              onClick={handleImageUpdate}
            />
          </div>
          <input
            type="file"
            id="profile_image"
            onChange={handleNewImage}
            ref={imageInputRef}
            className="hidden"
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

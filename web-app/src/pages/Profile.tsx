import React, {  useRef, useState } from "react";
// import { toast } from "react-toastify";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// constants
import { apiBaseUrl } from "@/constants";
// custom hook
import { useUserProfileInfo } from "@/hooks/useUserProfile";
// components
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import LucideIcon from "@/components/LucideIcon";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import ProfilePlaceholder from "@/assets/profile-placeholder.png";
const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  profile: z.object({
    role_display: z.string(),
    profile_image: z.instanceof(File).refine((file) => file.size < 7000000, {
      message: "Your resume must be less than 7MB.",
    }),
  }),
});

// FIXME: Profile component not displaying user profile information. The TOKEN expires very fast add way to refresh token
// TODO: add type to profile state
const Profile = () => {
  const { profile } = useUserProfileInfo();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpdate = () => {
    imageInputRef.current?.click();
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      profile: {
        role_display: "",
        // profile_image: null,
      },
    },
    values: profile,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if(file){
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      // form.setValue('profile.profile_image', file)
    }
  };

  // TODO: image upload not working issue  might be on the server or schema
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const TOKEN = localStorage.getItem("access_token");
 
//     const formData = new FormData()
//     formData.append('username', values.username)
//     formData.append('email', values.email)
//    // Ensure profile_image is a valid File object
//    if (values.profile.profile_image instanceof File) {
//     formData.append('profile_image', values.profile.profile_image);
// } else {
//     console.error('profile_image is not a valid File object:', values.profile.profile_image);
// }

    // Log FormData entries
  //   for (let [key, value] of formData.entries()) {
  //     console.log(`${key}:`, value);
  // }
setLoading(true)
    try{
    await axios.patch(`${apiBaseUrl}/api/profile/`, values, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        // "Content-Type": "application/json"
        "Content-Type": "multipart/form-data",
      },
    })
    setLoading(false)
    console.log('Profile updated successfully')
  } catch (error) {
    setLoading(false)
    console.log('error', error)
  }
  };

  return (
    <div className=" w-2/3 mx-auto mt-5">
      <h1 className="text-2xl mb-2">Update Profile</h1>
      <div className=" w-full flex justify-center items-center  border border-slate-950/25 dark:border-slate-400 rounded-md">
        <Form {...form}>
          <form
            className=" space-y-4 mb-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="relative ">
              <img
              // src={preview ? preview : ProfilePlaceholder }
              src={
                preview
                  ? preview
                  : profile?.profile.profile_image
                  ? `${apiBaseUrl}${profile?.profile.profile_image}`
                  : ProfilePlaceholder
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
            <FormField
              control={form.control}
              name="profile.profile_image"
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Profile Image:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...fieldProps}
                      accept="image/*"
                      type="file"
                      // value={undefined}
                      onChange={handleImageUpload}
                      // onChange={(event) => onChange(event.target.files && event.target.files[0])}
                      ref={imageInputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Name:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      className="!focus-visible:ring-0 !focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profile.role_display"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      {...field}
                      disabled
                      className="!focus-visible:ring-0 !focus-visible:ring-offset-0 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              text={loading ? <Spinner /> : "Update Profile"}
              className="w-full mb-8"
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;

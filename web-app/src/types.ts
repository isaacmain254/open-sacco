// export interface UserProps {
//   email: string;
//   username: string;
// }
// export interface ProfileProps {
//   id: string;
//   role: string;
//   profile_image: string;
//   user: UserProps;
// }

export type Profile = {
  role_display: string;
  profile_image: string;
};
export type UserProps = {
  username: string;
  email: string;
  profile: Profile;
};

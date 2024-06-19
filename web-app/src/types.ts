export interface UserProps {
  email: string;
  username: string;
}
export interface ProfileProps {
  id: string;
  role: string;
  profile_image: string;
  user: UserProps;
}

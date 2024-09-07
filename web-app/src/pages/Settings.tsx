// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Profile from "./Profile";
import ChangePassword from "@/components/settings/tabs/change-password";
import LucideIcon from "@/components/LucideIcon";

const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-medium">Settings</h1>

      <Tabs
        defaultValue="update-profile"
        className="flex flex-col md:flex-row gap-8"
      >
        <TabsList className="w-1/5 h-full flex flex-col !justify-start !items-start p-3">
          <TabsTrigger value="update-profile" className="mb-3">
            <LucideIcon name="UserCog" className="pr-3" size={22}/> Update Profile
          </TabsTrigger>
          <TabsTrigger value="change-password" className="mb-3"><LucideIcon name="Lock" size={18} className="pr-3" /> Change Password</TabsTrigger>
        </TabsList>
        <div className="w-4/5 border border-slate-300 rounded-md">
          <TabsContent value="update-profile">
            <Profile />
          </TabsContent>
          <TabsContent value="change-password">
            <ChangePassword />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { useChangePassword } from "@/hooks/api/auth";
import LucideIcon from "@/components/LucideIcon";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const { mutate: changePassword, isPending } = useChangePassword();

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setVisiblePasswords((passwords) => ({
      ...passwords,
      [field]: !passwords[field],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePassword(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: (data) => {
          toast.success(data.message ?? "Password changed successfully", {
            autoClose: 3000,
          });
          // Clear the form fields after successful password change
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (error) => {
          const message =
            typeof error === "object" && error && "current_password" in error
              ? String((error as { current_password?: string[] }).current_password?.[0])
              : "Unable to change password";
          toast.error(message, {
            autoClose: 3000,
          });
        },
      },
    );
  };

  return (
    <div className="w-full flex flex-col justify-center">
      <h1 className="text-2xl py-3 text-center">Change Password</h1>
      <Card className="!border-none">
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-8">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input id="currentPassword" type={visiblePasswords.current ? "text" : "password"} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="pr-10" required />
                <button type="button" onClick={() => togglePasswordVisibility("current")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={visiblePasswords.current ? "Hide current password" : "Show current password"}>
                  <LucideIcon name={visiblePasswords.current ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input id="password" type={visiblePasswords.new ? "text" : "password"} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="pr-10" required />
                <button type="button" onClick={() => togglePasswordVisibility("new")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={visiblePasswords.new ? "Hide new password" : "Show new password"}>
                  <LucideIcon name={visiblePasswords.new ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={visiblePasswords.confirm ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="pr-10" required />
                <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={visiblePasswords.confirm ? "Hide confirmed password" : "Show confirmed password"}>
                  <LucideIcon name={visiblePasswords.confirm ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Changing Password..." : "Change Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;

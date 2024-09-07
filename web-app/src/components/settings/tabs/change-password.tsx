import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ChangePassword = () => {
  return (
    <div className="w-full flex flex-col justify-center">
      <h1 className="text-2xl py-3 text-center">Update Profile</h1>
      <Card className="!border-none">
        <CardContent className="grid gap-8">
          <div className="grid gap-2">
            <Label htmlFor="email">Password</Label>
            <Input id="password" type="password" placeholder="*****" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="*****" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Change Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChangePassword;

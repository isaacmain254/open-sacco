import React, { FC, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import { toast } from "react-toastify";

import LoginSvg from "@/assets/authenticate.svg";
import Logo from "@/assets/open-sacco.png";
import FormInput from "@/components/FormInput";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
// hooks
import { usePasswordReset } from "@/hooks/api/auth";

const PasswordResetConfirm: FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const searchParams = new URLSearchParams(window.location.search);
  console.log("Search params:", searchParams.toString());
  const uid = searchParams.get("user") || "";
  const token = searchParams.get("token") || "";

  const navigate = useNavigate();

  const {mutate: passwordReset, isPending: isPasswordResetPending} = usePasswordReset()

  const handleSubmit =  (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { autoClose: 3000 });
      return;
    }
    passwordReset(
      { uid, token, password },
      {
        onSuccess: (data) => {
          toast.success(data.message, { autoClose: 2000 });
          navigate("/login");
        },
        onError: () => {
          toast.error("Error resetting password", { autoClose: 2000 });
        },
      },
    );
  }

  return (
    <div className="w-full h-screen  flex  text-slate-700 dark:bg-blue-900 dark:text-slate-300">
      <div className="lg:w-1/2 rounded-e-full flex flex-col justify-center items-center bg-slate-200 text-center max-md:hidden dark:bg-blue-950 dark:text-slate-300">
        <img src={LoginSvg} alt="login" className="w-72 h-72" />
        <div className="max-w-96 text-left">
          <h1 className="text-4xl py-5">Set new password</h1>
          <p className=" text-lg">
            Time to secure your account. Enter your new password to finalize the
            reset and get back to using your account.
          </p>
        </div>
      </div>
      <div className="lg:w-1/2 w-full">
        <div className="w-full h-full flex  flex-col  items-center justify-center">
          <div className="mb-2">
            <img src={Logo} alt="Open sacco logo" className="w-32 h-32" />
            <h3 className="pb-3 text-lg">Set new password</h3>
          </div>
          <form className="w-72 space-y-4" onSubmit={handleSubmit}>
            <FormInput
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormInput
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              label="ConfirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              text={isPasswordResetPending ? <Spinner /> : "Sign Up"}
              type="submit"
              variant="secondary"
              className="my-5 w-full"
            />
          </form>
          <div className="border border-slate-300 w-72 mt-7 mb-3"></div>
          <p>
            Request for a new password reset?
            <Link
              className="ps-3 text-blue-700 max-md:block"
              to="/forgot-password"
            >
              Reset now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;

import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";

import Logo from "@/assets/open-sacco.png";
import ForgotPasswordSvg from "@/assets/forgot-password.png";

// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

// Hooks
import { useRequestPasswordReset } from "@/hooks/api/auth";

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState("");

  const {
    mutate: requestPasswordReset,
    isPending: isRequestPasswordResetPending,
  } = useRequestPasswordReset();

  const handleEmailSubmit =  (e: React.FormEvent) => {
    e.preventDefault();
    requestPasswordReset(
      { email },
      {
        onSuccess: (data) => {
          toast.success(data.message, { autoClose: 2000 });
          setEmail("");
        },
        onError: (error) => {
          toast.error("Error sending password reset email", {
            autoClose: 2000,
          });
        },
      },
    );
  };

  return (
    <div className="w-full h-screen  flex  text-slate-700 dark:bg-blue-900 dark:text-slate-300">
      <div className="lg:w-1/2 h-full rounded-e-full  flex flex-col justify-center items-center bg-gray-200 max-md:hidden  dark:bg-blue-950 dark:text-slate-300">
        <img src={ForgotPasswordSvg} alt="login" className="w-72 h-72" />
        <div className="max-w-96 text-left">
          <h1 className="text-4xl py-5">Recover your account</h1>
          <p className="text-lg">
            Need to recover your account? Simply provide your email, and we'll
            send you instructions to reset your password in your email.
          </p>
        </div>
      </div>
      <div className="lg:w-1/2 w-full">
        <div className="w-full h-full flex  flex-col  items-center justify-center dark:border-black">
          <div className="mb-2">
            <img src={Logo} alt="Open sacco logo" className="w-32 h-32" />
            <h3 className="pb-3 text-lg">Recover your account</h3>
          </div>
          <form className="w-72 space-y-4" onSubmit={handleEmailSubmit}>
            <FormInput
              type="email"
              name="email"
              value={email}
              placeholder="Email"
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              text={isRequestPasswordResetPending ? <Spinner /> : "Send Email"}
              type="submit"
              variant="secondary"
              className="my-5 w-full"
            />
          </form>
          <div className="border border-slate-300 w-72 mt-7 mb-3"></div>
          <p>
            Remembered your password?
            <Link className="ps-3 text-blue-700 max-md:block" to="/login">
              back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { FC, useState } from "react";
import { Link } from "react-router-dom";

import LoginSvg from "@/assets/authenticate.svg";
import Logo from "@/assets/open-sacco.png";

// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";
import { useLogin } from "@/hooks/api/auth";
import { Auth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/utils";

// interface LoginFormData{
//   email: string;
//   password: string
// }

const SignIn: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: userLogin, isPending: isRegisterPending } = useLogin();
  const { login } = Auth();

  // handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    userLogin(
      { email, password },
      {
        onSuccess: (data) => {
          login(data);
          toast.success("Login successful", { autoClose: 2000 });
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Unable to log in"), { autoClose: 2000 });
        },
      },
    );
  };

  return (
    <div className="w-full h-screen  flex  text-slate-700   dark:bg-blue-900 dark:text-slate-300 ">
      <div className="lg:w-1/2 h-full rounded-e-full  flex flex-col justify-center items-center bg-gray-200 max-md:hidden  dark:bg-blue-950 dark:text-slate-300">
        <img src={LoginSvg} alt="login" className="w-72 h-72" />
        <div className="max-w-96 text-left">
          <h1 className="text-4xl py-5">Welcome back</h1>
          <p className="text-lg">
            Welcome back! We're glad to see you again. Please enter your
            credentials to continue.
          </p>
        </div>
      </div>
      <div className="lg:w-1/2 w-full">
        <div className="w-full h-full flex  flex-col  items-center justify-center">
          <div className="mb-4 w-72 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-200">
            <p className="font-medium">Demo login</p>
            <p>
              <span className="font-mono">admin@example.com</span> /{" "}
              <span className="font-mono">admin12345</span>
            </p>
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              Free demo server — use responsibly. Do not abuse the app or access
              rights.
            </p>
          </div>
          <div className="mb-2">
            <img src={Logo} alt="Open sacco logo" className="w-32 h-32" />
            <h3 className="pb-3 text-lg">Welcome back!</h3>
          </div>
          <form className="w-72 space-y-4" onSubmit={handleLogin}>
            <FormInput
              type="email"
              name="email"
              value={email}
              placeholder="Email"
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              label="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end items-center hover:underline">
              <Link className="text-xs" to="/forgot-password">
                Forgot Password?
              </Link>
            </div>
            <Button
              text={isRegisterPending ? <Spinner /> : "Login"}
              type="submit"
              variant="secondary"
              className="my-5 w-full"
            />
          </form>
          <div className="border-b border-slate-100 w-72 mt-7 mb-3" />
          <p>
            Don't have an account?
            <Link className="ps-3 text-blue-700" to="/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

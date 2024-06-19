import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import LoginSvg from "@/assets/authenticate.svg";
import Logo from "@/assets/open-sacco.png";
// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";

const SignIn: FC = () => {
  // TODO: manage input type and icon state independently and validate form input
  const [inputType, setInputType] = useState("password");
  const [inputIcon, setInputIcon] = useState("EyeOff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // toggle password visibility
  const handleIconClick = () => {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
    setInputIcon((prev) => (prev === "EyeOff" ? "Eye" : "EyeOff"));
  };

  const navigate = useNavigate();

  // handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });

      // Store the token in local storage
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      setLoading(false);
      toast.success("Login successful", { autoClose: 2000 });
      // redirect to the dashboard
      navigate("/");
    } catch (error) {
      setLoading(false);
      toast.error("Invalid credentials", { autoClose: 2000 });
    }
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
          <div className="mb-2">
            <img src={Logo} alt="Open sacco logo" className="w-32 h-32" />
            <h3 className="pb-3 text-lg">Welcome back!</h3>
          </div>
          <form className="w-72 space-y-4" onSubmit={handleLogin}>
            <FormInput
              type="text"
              name="text"
              value={username}
              placeholder="Username"
              label="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <FormInput
              type={inputType}
              name="password"
              value={password}
              placeholder="Password"
              label="Password"
              icon={inputIcon}
              onChange={(e) => setPassword(e.target.value)}
              onIconClick={handleIconClick}
            />
            <div className="flex justify-end items-center">
              <Link className="text-xs" to="/forgot-password">
                Forgot Password?
              </Link>
            </div>
            <Button
              text={loading ? <Spinner /> : "Login"}
              type="submit"
              variant="secondary"
              className="my-5 w-full"
            />
          </form>
          <div className="border border-slate-300 w-72 mt-7 mb-3"></div>
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

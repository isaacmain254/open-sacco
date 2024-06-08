import { FC, useState } from "react";
import { Link, redirect } from "react-router-dom";
// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

const SignIn: FC = () => {
  // TODO: manage input type and icon state independently and validate form input
  const [inputType, setInputType] = useState("password");
  const [inputIcon, setInputIcon] = useState("EyeOff");
  const handleIconClick = () => {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
    setInputIcon((prev) => (prev === "EyeOff" ? "Eye" : "EyeOff"));
  };
  return (
    <div className="w-full h-screen  flex ">
      <div className="w-3/5 rounded-e-full  text-center flex flex-col justify-center bg-slate-200">
        <h1 className="text-4xl font-bold">Welcome back</h1>
        <p>A few more click to get started</p>
      </div>
      <div className="w-2/5">
        <div className="w-full h-full flex  flex-col  items-center justify-center">
          <div className="mb-7">
            <p>Logo</p>
            <h3>Sign In</h3>
          </div>
          <form className="w-72 space-y-4">
            <FormInput
              type="email"
              name="email"
              placeholder="Email"
              label="Email"
            />
            <FormInput
              type={inputType}
              name="password"
              placeholder="Password"
              className=""
              label="Password"
              icon={inputIcon}
              onIconClick={handleIconClick}
            />
            <div className="flex justify-between items-center ">
              <FormInput type="checkbox" name="remember" />
              <Link className="text-xs" to="/">
                Forgot Password?
              </Link>
            </div>
            <Button
              text="Sign In"
              onClick={() => {
                redirect("/");
              }}
              variant="secondary"
              className="my-5 w-full"
            />
          </form>
          <div className="border border-slate-300 w-72 mt-7 mb-3"></div>
          <p>
            Don't have an account?
            <Link className="ps-3" to="/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

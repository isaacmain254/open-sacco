import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import axios from "axios";

const SignIn: FC = () => {
  // TODO: manage input type and icon state independently and validate form input
  const [inputType, setInputType] = useState("password");
  const [inputIcon, setInputIcon] = useState("EyeOff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // toggle password visibility
  const handleIconClick = () => {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
    setInputIcon((prev) => (prev === "EyeOff" ? "Eye" : "EyeOff"));
  };

  const navigate = useNavigate();

  // handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username,
        password,
      });
      // Store the token in local storage
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // redirect to the dashboard
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full h-screen  flex ">
      <div className="w-3/5 rounded-e-full  text-center flex flex-col justify-center bg-slate-200 dark:bg-gray-600">
        <h1 className="text-4xl font-bold">Welcome back</h1>
        <p>A few more click to get started</p>
      </div>
      <div className="w-2/5">
        <div className="w-full h-full flex  flex-col  items-center justify-center border border-red-500 dark:border-black">
          <div className="mb-7">
            <p>Logo</p>
            <h3>Sign In</h3>
          </div>
          <form className="w-72 space-y-4">
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
              <Link className="text-xs" to="/">
                Forgot Password?
              </Link>
            </div>
            <Button
              text="Sign In"
              onClick={handleLogin}
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

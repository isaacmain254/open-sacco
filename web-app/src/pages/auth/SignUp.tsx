import { FC, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
const SignUp: FC = () => {
  // TODO: manage input type and icon state independently and validate form input
  const [inputType, setInputType] = useState("password");
  const [inputIcon, setInputIcon] = useState("EyeOff");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const navigate = useNavigate();
  // handle password visibility
  const handleIconClick = () => {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
    setInputIcon((prev) => (prev === "EyeOff" ? "Eye" : "EyeOff"));
  };

  // handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    // Validate password and confirm password fields
    if (password !== password2) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8000/api/register/", {
        username,
        email,
        password,
        password2,
      });
      // Store the token in local storage
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
      // Redirect to the dashboard
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-screen  flex ">
      <div className="w-3/5 rounded-e-full  text-center flex flex-col justify-center bg-slate-200">
        <h1 className="text-4xl font-bold">Register an account</h1>
        <p>A few more click to get started</p>
      </div>
      <div className="w-2/5">
        <div className="w-full h-full flex  flex-col  items-center justify-center">
          <div className="mb-7">
            <p>Logo</p>
            <h3>Sign Up</h3>
          </div>
          <form className="w-72 space-y-4">
            <FormInput
              type="text"
              name="Name"
              value={username}
              placeholder="Name"
              className=""
              label="Name"
              onChange={(e) => setUsername(e.target.value)}
            />
            <FormInput
              type="email"
              name="email"
              value={email}
              placeholder="Email"
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              type={inputType}
              name="password"
              placeholder="Password"
              value={password}
              label="Password"
              icon={inputIcon}
              onIconClick={handleIconClick}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormInput
              type={inputType}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={password2}
              label="ConfirmPassword"
              icon={inputIcon}
              onIconClick={handleIconClick}
              onChange={(e) => setPassword2(e.target.value)}
            />
            <Button
              text="Sign Up"
              onClick={handleSignup}
              variant="secondary"
              className="my-5 w-full"
            />
          </form>
          <div className="border border-slate-300 w-72 mt-7 mb-3"></div>
          <p>
            Don't have an account?<Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

import React, { FC, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import LoginSvg from "@/assets/authenticate.svg";
import Logo from "@/assets/open-sacco.png";
import FormInput from "@/components/FormInput";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";

const PasswordResetConfirm: FC = () => {
  const [inputType, setInputType] = useState("password");
  const [inputIcon, setInputIcon] = useState("EyeOff");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();

  // handle password visibility
  const handleIconClick = () => {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
    setInputIcon((prev) => (prev === "EyeOff" ? "Eye" : "EyeOff"));
  };

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { autoClose: 3000 });
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:8000/api/password-reset-confirm/${uidb64}/${token}/`,
        {
          password,
        }
      );
      setLoading(false);
      toast.success("Password reset successful", { autoClose: 2000 });
      // redirect to login page
      navigate("/login");
    } catch (error) {
      setLoading(false);
      toast.error(
        "Error resetting password. Please request for a new reset link",
        {
          autoClose: 5000,
        }
      );
    }
  };

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
              value={confirmPassword}
              label="ConfirmPassword"
              icon={inputIcon}
              onIconClick={handleIconClick}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              text={loading ? <Spinner /> : "Sign Up"}
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

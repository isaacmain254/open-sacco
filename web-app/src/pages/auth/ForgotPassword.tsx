import React, { FC, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/password-reset/", { email });
      alert("Password reset email sent");
    } catch (error) {
      alert("Error sending password reset email");
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
          <form className="w-72 space-y-4" onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send password reset email</button>
          </form>
          <div className="border border-slate-300 w-72 mt-7 mb-3"></div>
          <p>
            <Link className="ps-3" to="/login">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

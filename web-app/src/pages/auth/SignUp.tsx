import { FC, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import LoginSvg from "@/assets/authenticate.svg";
import Logo from "@/assets/open-sacco.png";
import { apiBaseUrl } from "@/constants";
// components
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useRegister } from "@/hooks/api/auth";

const SignUp: FC = () => {
  // TODO: manage input type and icon state independently and validate form input
  // const [inputType, setInputType] = useState("password");
  // const [inputIcon, setInputIcon] = useState("EyeOff");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const navigate = useNavigate();
 const { mutate: register, isPending: isRegisterPending } = useRegister();
 

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      toast.error("Passwords do not match", { autoClose: 2000 });
      return;
    }
    setLoading(true);
   register(
      { username, email, password, confirm_password: password2 },
      {
        onSuccess: (data) => {
          setLoading(false);
          toast.success("Account created successfully", { autoClose: 2000 });
          navigate("/login");
        },
        onError: (error) => {
          setLoading(false);
          toast.error("Error creating account", { autoClose: 2000 });
        },
      },
      )
  };
  
  return (
    <div className="w-full h-screen  flex  text-slate-700  dark:bg-blue-900 dark:text-slate-300">
      <div className="lg:w-1/2 rounded-e-full flex flex-col justify-center items-center bg-slate-200 text-center max-md:hidden  dark:bg-blue-950 dark:text-slate-300">
        <img src={LoginSvg} alt="login" className="w-72 h-72" />
        <div className="max-w-96 text-left">
          <h1 className="text-4xl py-5">Create an account</h1>
          <p className=" text-lg">
            Ready to get started? Just a few steps away from joining our
            community. Please complete the registration form to set up your
            account.
          </p>
        </div>
      </div>
      <div className="lg:w-1/2 w-full">
        <div className="w-full h-full flex  flex-col  items-center justify-center">
          <div className="mb-2">
            <img src={Logo} alt="Open sacco logo" className="w-32 h-32" />
            <h3 className="pb-3 text-lg">Create account!</h3>
          </div>
          <form className="w-72 space-y-4" onSubmit={handleSignup}>
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
              value={password2}
              label="ConfirmPassword"
              onChange={(e) => setPassword2(e.target.value)}
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
            Don't have an account?{" "}
            <Link className="ps-3 text-blue-700" to="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

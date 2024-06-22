import React, { FC } from "react";

interface AuthLayoutProps {
  title: string;
  authImg: string;
  children: React.ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ title, authImg, children }) => {
  return (
    <div className="w-full h-screen  flex ">
      <div className="w-1/2 h-full rounded-e-full  flex flex-col justify-center items-center bg-gray-200">
        <img src={authImg} alt="login" className="w-64 h-64" />
        <h1 className="text-4xl">Welcome back</h1>
        <p>A few more click to get started</p>
      </div>
      <div className="w-1/2">
        <div className="w-full h-full flex  flex-col  items-center justify-center dark:border-black">
          <div className="mb-7">
            <p>Logo</p>
            <h3>{title}</h3>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

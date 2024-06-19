import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import "./index.css";
// pages
import App from "./App.tsx";
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import DashBoard from "./pages/DashBoard.tsx";
import Members from "./pages/Members.tsx";
import Settings from "./pages/Settings.tsx";
import Accounts from "./pages/Accounts.tsx";
import Loans from "./pages/Loans.tsx";
import Transactions from "./pages/Transactions.tsx";
import Users from "./pages/Users.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import PasswordResetConfirm from "./pages/auth/PasswordResetConfirm.tsx";
import Profile from "./pages/Profile.tsx";
import { ThemeContextProvider } from "./contexts/ThemeContext.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <DashBoard />,
      },
      {
        path: "/members",
        element: <Members />,
      },
      {
        path: "/accounts",
        element: <Accounts />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
      {
        path: "/loans",
        element: <Loans />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/register",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:uidb64/:token",
    element: <PasswordResetConfirm />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </ThemeContextProvider>
  </React.StrictMode>
);

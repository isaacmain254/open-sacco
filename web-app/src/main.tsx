import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import "./index.css";
// pages
import App from "./App.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import DashBoard from "./pages/DashBoard.tsx";
// authentication
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import PasswordResetConfirm from "./pages/auth/PasswordResetConfirm.tsx";
// customers
import Customers from "./pages/customers/Customers.tsx";
import CustomersEdit from "./pages/customers/CustomersEdit.tsx";
import CustomersView from "./pages/customers/CustomersView.tsx";
// accounts
import Accounts from "./pages/accounts/Accounts.tsx";
import AccountsEdit from "./pages/accounts/AccoutsEdit.tsx";
import AccountsView from "./pages/accounts/AccountsView.tsx";
import Settings from "./pages/Settings.tsx";
import Loans from "./pages/loans/Loans.tsx";
import Transactions from "./pages/Transactions.tsx";
import Users from "./pages/Users.tsx";
import Profile from "./pages/Profile.tsx";
import { ThemeContextProvider } from "./contexts/ThemeContext.tsx";
import LoansEdit from "./pages/loans/LoansEdit.tsx";
import LoansView from "./pages/loans/LoansView.tsx";

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
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/customers/edit/:customerId?",
        element: <CustomersEdit />,
      },
      {
        path: "/customers/view/:customerId",
        element: <CustomersView />
      },
      {
        path: "/accounts",
        element: <Accounts />,
      },
      {
        path: '/accounts/edit/:accountNo?',
        element: <AccountsEdit />
      },
      {
        path: '/accounts/view/:accountNo',
        element: <AccountsView />
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
        path: "/loans/edit/:loanId?",
        element: <LoansEdit />,
      },
      {
        path: "/loans/view/:loanId",
        element: <LoansView />
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

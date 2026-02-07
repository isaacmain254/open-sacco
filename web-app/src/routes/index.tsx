import { createBrowserRouter } from "react-router-dom";
// Layout component
import { RootLayout } from "@/RootLayout.tsx";
// pages
import App from "../App.tsx";
import ErrorPage from "../pages/ErrorPage.tsx";
import DashBoard from "../pages/DashBoard.tsx";
// authentication
import SignIn from "../pages/auth/SignIn.tsx";
import SignUp from "../pages/auth/SignUp.tsx";
import ForgotPassword from "../pages/auth/ForgotPassword.tsx";
import PasswordResetConfirm from "../pages/auth/PasswordResetConfirm.tsx";
// customers
import Customers from "../pages/customers/Customers.tsx";
import CustomersEdit from "../pages/customers/CustomersEdit.tsx";
import CustomersView from "../pages/customers/CustomersView.tsx";
// accounts
import Accounts from "../pages/accounts/Accounts.tsx";
import AccountsEdit from "../pages/accounts/AccoutsEdit.tsx";
import AccountsView from "../pages/accounts/AccountsView.tsx";
// Transactions
import Transactions from "../pages/transactions/Transactions.tsx";
import TransactionsEdit from "../pages/transactions/TransactionsEdit.tsx";
import Settings from "../pages/Settings.tsx";
import Loans from "../pages/loans/Loans.tsx";
import Users from "../pages/Users.tsx";
import Profile from "../pages/Profile.tsx";

import LoansEdit from "../pages/loans/LoansEdit.tsx";
import LoansView from "../pages/loans/LoansView.tsx";
import Help from "../pages/Help.tsx";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,

    children: [
      // ---------- AUTH ROUTES ----------
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
        path: "/reset-password",
        element: <PasswordResetConfirm />,
      },

      // ---------- APP LAYOUT ----------
      {
        path: "/",
        element: <App />, // dashboard shell
        children: [
          { index: true, element: <DashBoard /> },
          { path: "customers", element: <Customers /> },
          { path: "customers/edit/:customerId?", element: <CustomersEdit /> },
          { path: "customers/view/:customerId", element: <CustomersView /> },
          { path: "accounts", element: <Accounts /> },
          { path: "accounts/edit/:accountNo?", element: <AccountsEdit /> },
          { path: "accounts/view/:accountNo", element: <AccountsView /> },
          { path: "transactions", element: <Transactions /> },
          {
            path: "transactions/edit/:transactionId?",
            element: <TransactionsEdit />,
          },
          { path: "loans", element: <Loans /> },
          { path: "loans/edit/:loanId?", element: <LoansEdit /> },
          { path: "loans/view/:loanId", element: <LoansView /> },
          { path: "settings", element: <Settings /> },
          { path: "help", element: <Help /> },
          { path: "users", element: <Users /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
]);

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
// Members
import Members from "@/pages/members/Members.tsx";
import MembersEdit from "@/pages/members/MembersEdit.tsx";
import MembersView from "@/pages/members/MembersView.tsx";
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
import { BulkSMS } from "@/pages/sms/BulkSMS.tsx";
import { BulkEmail } from "@/pages/emails/BulkEmail.tsx";
import { Expenses } from "@/pages/expenses/index.tsx";
import RequireModuleAccess from "@/components/RequireModuleAccess.tsx";
import { AppModule } from "@/lib/access-control.ts";

const protectedModulePage = (module: AppModule, element: JSX.Element) => (
  <RequireModuleAccess module={module}>{element}</RequireModuleAccess>
);

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
          { path: "members", element: protectedModulePage("members", <Members />) },
          { path: "members/edit/:memberId?", element: protectedModulePage("members", <MembersEdit />) },
          { path: "members/view/:memberId?", element: protectedModulePage("members", <MembersView />) },
          { path: "accounts", element: protectedModulePage("accounts", <Accounts />) },
          { path: "accounts/edit/:accountNo?", element: protectedModulePage("accounts", <AccountsEdit />) },
          { path: "accounts/view/:accountNo", element: protectedModulePage("accounts", <AccountsView />) },
          { path: "transactions", element: protectedModulePage("transactions", <Transactions />) },
          {
            path: "transactions/edit/:transactionId?",
            element: protectedModulePage("transactions", <TransactionsEdit />),
          },
          { path: "loans", element: protectedModulePage("loans", <Loans />) },
          { path: "loans/edit/:loanId?", element: protectedModulePage("loans", <LoansEdit />) },
          { path: "loans/view/:loanId", element: protectedModulePage("loans", <LoansView />) },
          { path: "expenses", element: protectedModulePage("expenses", <Expenses />) },
          { path: "settings", element: <Settings /> },
          { path: "help", element: <Help /> },
          { path: "users", element: protectedModulePage("users", <Users />) },
          { path: "profile", element: <Profile /> },
          {path: "sms", element: protectedModulePage("communications", <BulkSMS />)},
          {path: "emails", element: protectedModulePage("communications", <BulkEmail />)}
        ],
      },
    ],
  },
]);

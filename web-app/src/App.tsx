import { FC } from "react";
import NavBar from "./components/NavBar";
import { Link, Outlet } from "react-router-dom";
import LucideIcon from "./components/LucideIcon";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: "BarChart4",
    to: "/",
  },
  {
    label: "Members",
    icon: "Users",
    to: "/members",
  },
  {
    label: "Accounts",
    icon: "CreditCard",
    to: "/accounts",
  },
  {
    label: "Transactions",
    icon: "Wallet",
    to: "/transactions",
  },
  {
    label: "Loans",
    icon: "Wallet",
    to: "/loans",
  },
  {
    label: "Settings",
    icon: "Settings",
    to: "/settings",
  },
  {
    label: "Users",
    icon: "Users",
    to: "/users",
  },
];
const App: FC = () => {
  return (
    <>
      <NavBar />
      <div className="grid grid-cols-12 gap-4  ">
        <div className="col-span-2 bg-gray-200 dark:bg-blue-950 dark:text-white min-h-screen p-4 ">
          <ul className="list-none p-0 m-0">
            {sidebarItems.map((item) => (
              <li className="" key={item.label}>
                {/* TODO: check NavLink to set active link bg, color */}
                <Link
                  className=" flex gap-x-3 bg-white py-2 px-3 text-base text-slate-800 rounded-md hover:bg-slate-950/25 hover:text-white transition duration-300 ease-in-out  dark:bg-blue-500/25 dark:text-slate-300 dark:hover:bg-blue-500/75"
                  to={item.to}
                >
                  <LucideIcon name={item.icon} /> {item.label}
                </Link>
                <div className=" w-full border border-slate-100 dark:border-blue-600 my-5"></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-10 bg-white dark:bg-blue-950 dark:text-slate-300 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default App;

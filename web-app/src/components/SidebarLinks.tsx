import { FC } from "react";
import { NavLink } from "react-router-dom";
// components
import LucideIcon from "./LucideIcon";

interface SidebarLinksProps {
  onClick?: () => void;
}

const sidebarItems = [
  {
    label: "Dashboard",
    icon: "BarChart4",
    to: "/",
  },
  {
    label: "Customers",
    icon: "Users",
    to: "/customers",
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
const SidebarLinks: FC<SidebarLinksProps> = ({ onClick }) => {
  return (
    <>
      {sidebarItems.map((item) => (
        <li className="" key={item.label}>
          <NavLink
            to={item.to}
            onClick={onClick}
            // TODO: check isActive on light mode, currently only works on dark mode
            className={({ isActive }) =>
              `flex gap-x-3 bg-white py-2 px-3 text-base text-slate-800 rounded-md hover:bg-slate-950/25 hover:text-white transition duration-300 ease-in-out  dark:bg-blue-500/25 dark:text-slate-300 dark:hover:bg-blue-500/75
                   ${isActive ? " dark:bg-blue-500/75 dark:text-white" : ""}`
            }
          >
            <LucideIcon name={item.icon} /> {item.label}
          </NavLink>
          <div className=" w-full border border-slate-100 dark:border-blue-600 my-5 max-md:my-3"></div>
        </li>
      ))}
    </>
  );
};

export default SidebarLinks;

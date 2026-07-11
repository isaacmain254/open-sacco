import { FC } from "react";
import { NavLink } from "react-router-dom";
// components
import LucideIcon from "./LucideIcon";
import { AppModule, hasModuleAccess } from "@/lib/access-control";
import { useUserProfileInfo } from "@/hooks/useUserProfile";

interface SidebarLinksProps {
  onClick?: () => void;
}

const sidebarItems: Array<{
  label: string;
  icon: string;
  to: string;
  module?: AppModule;
}> = [
  {
    label: "Dashboard",
    icon: "BarChart4",
    to: "/",
  },
  {
    label: "Members",
    icon: "Users",
    to: "/members",
    module: "members",
  },
  {
    label: "Accounts",
    icon: "PiggyBank",
    to: "/accounts",
    module: "accounts",
  },
  {
    label: "Transactions",
    icon: "ArrowRightLeft",
    to: "/transactions",
    module: "transactions",
  },
  {
    label: "Loans",
    icon: "HandCoins",
    to: "/loans",
    module: "loans",
  },
  {
    label: "Expenses",
    icon: "ReceiptText",
    to: "/expenses",
    module: "expenses",
  },
  {
    label: "Settings",
    icon: "Settings",
    to: "/settings",
  },
  {
    label: "Help",
    icon: "CircleHelp",
    to: "/help",
  },
  {
    label: "Users",
    icon: "Users",
    to: "/users",
    module: "users",
  },
  {
    label: "SMS",
    icon: "MessageCircle",
    to: "/sms",
    module: "communications",
  },
  {
    label: "Emails",
    icon: "Mail",
    to: "/emails",
    module: "communications",
  }
];
const SidebarLinks: FC<SidebarLinksProps> = ({ onClick }) => {
  const { profile } = useUserProfileInfo();
  const visibleItems = sidebarItems.filter(
    (item) => !item.module || hasModuleAccess(profile?.role, item.module),
  );

  return (
    <>
      {visibleItems.map((item) => (
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

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
            className={({ isActive }) =>
              `flex gap-x-3 rounded-xl border border-transparent px-3 py-2 text-base transition duration-200 ease-in-out ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500 dark:text-white"
                  : "bg-white text-slate-800 hover:bg-slate-200/80 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              }`
            }
          >
            <LucideIcon name={item.icon} /> {item.label}
          </NavLink>
          <div className="my-4 w-full border-t border-slate-200 dark:border-slate-800 max-md:my-3"></div>
        </li>
      ))}
    </>
  );
};

export default SidebarLinks;

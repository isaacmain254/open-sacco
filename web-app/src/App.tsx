import { FC, useState } from "react";
import NavBar from "./components/NavBar";
import { Link, NavLink, Outlet } from "react-router-dom";
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
interface NavLinkStateProps {
  isActive?: boolean;
  isPending?: boolean;
  isTransitioning?: boolean;
}
const App: FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const activeLink = ({ isActive }) => {
    return {
      color: isActive ? "red" : "",
    };
  };
  return (
    <>
      <NavBar
        showMobileMenu={showMobileMenu}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />
      <div className="lg:grid grid-cols-12 gap-4  ">
        <div className="lg:col-span-2 max-md:hidden  bg-gray-200 dark:bg-blue-950 dark:text-white min-h-screen p-4 ">
          <ul className="list-none p-0 m-0">
            {sidebarItems.map((item) => (
              <li className="" key={item.label}>
                {/* TODO: check NavLink to set active link bg, color */}
                <NavLink
                  className="flex gap-x-3 bg-white py-2 px-3 text-base text-slate-800 rounded-md hover:bg-slate-950/25 hover:text-white transition duration-300 ease-in-out  dark:bg-blue-500/25 dark:text-slate-300 dark:hover:bg-blue-500/75"
                  style={activeLink}
                  to={item.to}
                >
                  <LucideIcon name={item.icon} /> {item.label}
                </NavLink>
                <div className=" w-full border border-slate-100 dark:border-blue-600 my-5"></div>
              </li>
            ))}
          </ul>
        </div>
        {/* mobile navbar */}
        {showMobileMenu && (
          <div className="absolute z-30 bg-gray-200 dark:bg-blue-950 dark:text-white lg:hidden ">
            <ul className="list-none p-0 m-5">
              {sidebarItems.map((item) => (
                <li className="" key={item.label}>
                  {/* TODO: check NavLink to set active link bg, color */}
                  <Link
                    className=" flex gap-x-3 bg-white py-2 px-3 text-base text-slate-800 rounded-md hover:bg-slate-950/25 hover:text-white transition duration-300 ease-in-out  dark:bg-blue-500/25 dark:text-slate-300 dark:hover:bg-blue-500/75"
                    to={item.to}
                    onClick={handleMobileMenuToggle}
                  >
                    <LucideIcon name={item.icon} /> {item.label}
                  </Link>
                  <div className=" w-full border border-slate-100 dark:border-blue-600 my-3"></div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="col-span-10 bg-white dark:bg-blue-950 dark:text-slate-300 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default App;

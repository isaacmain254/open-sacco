import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import ProfileImage from "@/assets/mainawambui.jpg";
import Logo from "@/assets/open-sacco.png";
// components
import LucideIcon from "./LucideIcon";

interface NavBarProps {
  showMobileMenu: boolean;
  handleMobileMenuToggle: () => void;
}

const NavBar: FC<NavBarProps> = ({
  showMobileMenu,
  handleMobileMenuToggle,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    const initialValue = JSON.parse(saved!);
    return initialValue || false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    const htmlClassList = document.querySelector("html")?.classList;
    if (darkMode) {
      htmlClassList?.add("dark");
    } else {
      htmlClassList?.remove("dark");
    }
  }, [darkMode]);

  const handleShowDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const darkModeToggleHandler = () => {
    setDarkMode(!darkMode);
  };

  const navigate = useNavigate();
  // handle logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/api/logout/");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // TODO: Confirm dialog before logout and redirect to login page - modal with different sizes
      navigate("/login");
    } catch {
      console.log("error");
    }
  };
  return (
    <div className="w-full flex items-center justify-between text-white bg-blue-700 h-16 dark:bg-blue-800 dark:text-slate-300 rounded-lg px-3 ">
      <div className="flex items-center">
        <img src={Logo} alt="Open SACCO logo" className="w-20 h-20" />
        <div className="lg:hidden" onClick={handleMobileMenuToggle}>
          {showMobileMenu ? (
            <LucideIcon name="X" size={27} />
          ) : (
            <LucideIcon name="AlignJustify" size={27} />
          )}
        </div>
      </div>

      <div className="flex gap-x-5 items-center">
        <div onClick={darkModeToggleHandler}>
          {darkMode ? (
            <LucideIcon name="Moon" size={24} />
          ) : (
            <LucideIcon name="Sun" size={24} />
          )}
        </div>
        <div>
          <img
            className="rounded-full relative border border-white w-10 h-10"
            src={ProfileImage}
            alt=" mr Isaac"
            onClick={handleShowDropdown}
          />
          <div
            className={` ${
              showDropdown ? "block" : "hidden"
            } bg-gray-200 text-black  absolute z-50 mt-2 -ms-16 rounded-md dark:bg-blue-700 dark:text-white`}
          >
            <div className="p-4">
              <p className="">
                Isaac
                <small className="bg-blue-700 dark:bg-blue-950 rounded-md text-white text-xs ms-3 p-0.5">
                  Admin
                </small>
              </p>
              <p>admin@gmail.com</p>
              <Link to="/profile" className="text-blue-500 dark:text-blue-300">
                Profile
              </Link>
              <div
                className="flex items-center text-sm gap-x-1 cursor-pointer hover:bg-blue-500/25 p-2 my-2 rounded-md dark:hover:bg-blue-500/75"
                onClick={handleLogout}
              >
                <LucideIcon name="LogOut" size={16} /> Logout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

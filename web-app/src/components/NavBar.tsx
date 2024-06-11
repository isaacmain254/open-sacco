import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileImage from "@/assets/mainawambui.jpg";
// components
import LucideIcon from "./LucideIcon";
import axios from "axios";

const NavBar = () => {
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
    <div className="w-full flex items-center justify-between text-white bg-blue-700 h-16 dark:bg-blue-800 dark:text-slate-300 rounded-lg px-5 ">
      <p>Navbar</p>

      <div className="flex gap-x-5 items-center">
        <div onClick={darkModeToggleHandler}>
          {darkMode ? (
            <LucideIcon name="Moon" size={20} />
          ) : (
            <LucideIcon name="Sun" size={20} />
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
              <p>Admin</p>
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

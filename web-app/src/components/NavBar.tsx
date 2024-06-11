import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileImage from "@/assets/mainawambui.jpg";
// components
import LucideIcon from "./LucideIcon";

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
    // document.querySelector("html")?.classList.toggle("dark");
  };
  return (
    <div className="w-full flex items-center justify-between bg-blue-700 h-16 dark:bg-gray-800 dark:text-white rounded-lg px-5 ">
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
            } bg-gray-200 text-black  absolute z-50 mt-2 -ms-10 rounded-md dark:bg-gray-800 dark:text-white`}
          >
            <div className="p-4">
              <p className="">
                Isaac
                <small className="bg-blue-700 rounded-md text-white text-xs ms-3 p-0.5">
                  Admin
                </small>
              </p>
              <p>Admin</p>
              <Link className="flex items-center text-sm gap-x-1" to="/logout">
                <LucideIcon name="LogOut" size={16} /> Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

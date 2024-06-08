import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProfileImage from "@/assets/mainawambui.jpg";
// components
import LucideIcon from "./LucideIcon";

const NavBar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const handleShowDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  return (
    <div className="w-full flex items-center justify-between bg-blue-700 h-16 rounded-lg px-5 ">
      <p>Navbar</p>
      <div>
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
            } bg-gray-200 text-black absolute z-50 mt-2 -ms-10 rounded-md`}
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

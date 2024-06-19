import { FC, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import ProfileImage from "@/assets/mainawambui.jpg";
import Logo from "@/assets/open-sacco.png";
// components
import LucideIcon from "./LucideIcon";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useUserProfileInfo } from "@/hooks/useUserProfile";

interface NavBarProps {
  showMobileMenu: boolean;
  handleMobileMenuToggle: () => void;
}

const NavBar: FC<NavBarProps> = ({
  showMobileMenu,
  handleMobileMenuToggle,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  // dark mode context consumer
  const { toggleDarkTheme, darkTheme } = useContext(ThemeContext);
  // custom hook for user profile
  const { username, email, role, imageUrl } = useUserProfileInfo();

  const handleShowDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // close dropdown when user clicks outside
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <div className="max-w-full relative flex items-center justify-between text-white bg-blue-700 h-16 dark:bg-blue-800 dark:text-slate-300 rounded-lg px-3 ">
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
        <div onClick={toggleDarkTheme}>
          {darkTheme ? (
            <LucideIcon name="Moon" size={24} />
          ) : (
            <LucideIcon name="Sun" size={24} />
          )}
        </div>
        <div>
          <img
            className="rounded-full  border border-white w-10 h-10"
            src={`http://localhost:8000${imageUrl}` || ProfileImage}
            alt=" mr Isaac"
            onClick={handleShowDropdown}
          />
          {/* dropdown menu start here */}
          <div
            ref={dropdownRef}
            className={` ${
              showDropdown ? "block" : "hidden"
            } bg-gray-200 text-black absolute mt-3 me-3 right-0 rounded-md dark:bg-blue-700 dark:text-white`}
          >
            <div className="p-4">
              <p className="">
                {username}
                <small className="bg-blue-700 dark:bg-blue-950 rounded-md text-white text-xs p-0.5">
                  {role}
                </small>
              </p>
              <p className="pb-2">{email}</p>
              <Link
                to="/profile"
                className="flex hover:bg-blue-500/25 p-2  rounded-md dark:hover:bg-blue-500/75"
                onClick={handleShowDropdown}
              >
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

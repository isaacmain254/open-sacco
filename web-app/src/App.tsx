import { FC, useState } from "react";
import { Outlet } from "react-router-dom";
// components
import NavBar from "./components/NavBar";
import SidebarLinks from "./components/SidebarLinks";

const App: FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <NavBar
        showMobileMenu={showMobileMenu}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />
      <div className="flex-1 h-full lg:grid grid-cols-12 max-w-screen-2xl w-full mx-auto mt-16">
        <div className="hidden lg:block lg:col-span-2 bg-gray-200 dark:bg-blue-900 dark:text-white h-full overflow-y-auto p-4 ">
          <ul className="list-none p-0 m-0">
            <SidebarLinks />
          </ul>
        </div>

        {/* mobile navbar */}
        {showMobileMenu && (
          <div className="absolute z-30 block bg-gray-200 dark:bg-blue-950 dark:text-white lg:hidden rounded-md">
            <ul className="list-none p-0 m-5">
              <SidebarLinks onClick={handleMobileMenuToggle} />
            </ul>
          </div>
        )}
      
        <div className="col-span-10 bg-white dark:bg-blue-950 dark:text-slate-300 py-4 px-8 h-full overflow-y-auto  pb-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;

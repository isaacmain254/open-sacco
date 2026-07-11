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
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <NavBar
        showMobileMenu={showMobileMenu}
        handleMobileMenuToggle={handleMobileMenuToggle}
      />
      <div className="mt-16 min-h-0 flex-1 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-0">
        <div className="hidden h-full overflow-y-auto border-r border-slate-200 bg-slate-100/95 p-4 dark:border-slate-800 dark:bg-slate-900/90 lg:block">
          <ul className="flex h-full flex-col list-none p-0 m-0">
            <SidebarLinks />
          </ul>
        </div>

        {/* mobile navbar */}
        {showMobileMenu && (
          <div className="absolute left-3 top-20 z-30 block rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
            <ul className="list-none p-0 m-5">
              <SidebarLinks onClick={handleMobileMenuToggle} />
            </ul>
          </div>
        )}
      
        <div className="h-full min-h-0 overflow-y-auto px-3 py-3 pb-16 sm:px-4 lg:px-6 xl:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;

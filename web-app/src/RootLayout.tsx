import { Outlet } from "react-router-dom";
import Providers from "./contexts/providers";

export const RootLayout = () => {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
};

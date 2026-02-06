import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import { ThemeContextProvider } from "./contexts/ThemeContext.tsx";
import { router } from "./routes/index.tsx";




// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </ThemeContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

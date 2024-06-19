import { createContext, useState, useEffect, ReactNode } from "react";

export interface ThemeProps {
  children: ReactNode;
}
interface ThemeContextProps {
  toggleDarkTheme: () => void;
  darkTheme: boolean;
}
export const ThemeContext = createContext<ThemeContextProps>(null!);

export const ThemeContextProvider = ({ children }: ThemeProps) => {
  const [darkTheme, setDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    const initialValue = JSON.parse(saved!);
    return initialValue || false;
  });
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkTheme));
    const htmlClassList = document.querySelector("html")?.classList;
    if (darkTheme) {
      htmlClassList?.add("dark");
    } else {
      htmlClassList?.remove("dark");
    }
  }, [darkTheme]);
  // function to toggle dark theme
  const toggleDarkTheme = () => {
    setDarkTheme(!darkTheme);
  };
  return (
    <ThemeContext.Provider value={{ toggleDarkTheme, darkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

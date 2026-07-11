import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

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
    if (saved !== null) {
      return JSON.parse(saved);
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkTheme));
    const htmlClassList = document.documentElement.classList;
    if (darkTheme) {
      htmlClassList.add("dark");
    } else {
      htmlClassList.remove("dark");
    }
  }, [darkTheme]);

  // function to toggle dark theme
  const toggleDarkTheme = () => {
    setDarkTheme((currentTheme) => !currentTheme);
  };

  return (
    <ThemeContext.Provider value={{ toggleDarkTheme, darkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const Theme = () => {
  const context = useContext(ThemeContext);
  return context;
};

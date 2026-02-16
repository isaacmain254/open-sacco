import Spinner from "@/components/Spinner";
import { useRefreshToken } from "@/hooks/api/auth";
import { AuthResponse } from "@/services/auth";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
}
// FIXME: BUG - check for access and refresh token validity on backend.
//  I changed some access token characters ans I'm still authenticated and token was not refreshed
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: generateRefreshToken } = useRefreshToken();

  const SESSION_DURATION = 12 * 60 * 60 * 1000; // session expires in 12 hours

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    setIsAuthenticated(false);
    navigate("/login");
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    // const accessExpiresAt = localStorage.getItem("expiresAt");

    if (!refreshToken) {
      logout();
      setIsLoading(false);
      navigate("/login");
      return;
    }

    // 1 Access token still valid
    if (accessToken) {
      setIsAuthenticated(true);
      setIsLoading(false);
      // Only navigate to dashboard if user is on a public/auth page
      if (location.pathname === "/login" || location.pathname === "/register") {
        navigate("/");
      }
      return;
    }

  
      generateRefreshToken(
        { refresh: refreshToken },
        {
          onSuccess: (data) => {
            const newExpiresAt = Date.now() + SESSION_DURATION;
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("expiresAt", newExpiresAt.toString());
            setIsAuthenticated(true);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Failed to refresh token - invalid or expired:", error);
            setIsLoading(false);
            logout(); // Logout user when refresh token is invalid
          },
        },
      );
   
  }, [isAuthenticated]);

  const login = (data: AuthResponse) => {
    const expiresAt = Date.now() + SESSION_DURATION;
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh || "");
    localStorage.setItem("expiresAt", expiresAt.toString());
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const Auth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

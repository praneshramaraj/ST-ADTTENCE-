import { createContext, useContext, useMemo, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      if (!localStorage.getItem("st_token")) return null;
      return JSON.parse(localStorage.getItem("st_user"));
    } catch {
      return null;
    }
  });

  const login = async (loginValue, password) => {
    const { data } = await api.post("/auth/login", { login: loginValue, password });
    localStorage.setItem("st_token", data.token);
    localStorage.setItem("st_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const registerStudent = async (payload) => {
    const { data } = await api.post("/auth/register-student", payload);
    localStorage.setItem("st_token", data.token);
    localStorage.setItem("st_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("st_token");
    localStorage.removeItem("st_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, registerStudent, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

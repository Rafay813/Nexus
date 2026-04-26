import { createContext, useState, useEffect, useCallback } from "react";
import { getMeAPI, loginAPI, logoutAPI, registerAPI } from "../api/authAPI";
import { saveToken, removeToken } from "../utils/tokenHelper";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // initial auth check

  // ── On mount: restore session ─────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await getMeAPI();
        setUser(data.data.user);
      } catch {
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const { data } = await registerAPI(formData);
    saveToken(data.data.accessToken);
    setUser(data.data.user);
    toast.success("Account created successfully! 🎉");
    return data.data.user;
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    const { data } = await loginAPI(formData);
    saveToken(data.data.accessToken);
    setUser(data.data.user);
    toast.success(`Welcome back, ${data.data.user.name}!`);
    return data.data.user;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutAPI();
    } catch {
      // fail silently
    } finally {
      removeToken();
      setUser(null);
      toast.success("Logged out successfully.");
    }
  }, []);

  // ── Update local user state (after profile update) ────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
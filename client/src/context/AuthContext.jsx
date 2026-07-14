import { useCallback, useEffect, useState } from "react";
import { signupRequest, loginRequest, logoutRequest, meRequest } from "../authApi";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meRequest()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async (username, email, password) => {
    const newUser = await signupRequest(username, email, password);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(async (identifier, password) => {
    const loggedInUser = await loginRequest(identifier, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

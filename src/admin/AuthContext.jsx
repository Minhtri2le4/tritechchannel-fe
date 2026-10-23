/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ADMIN_TOKEN_KEY } from '../lib/api';
import { adminApi } from './adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Có token trong máy -> cần hỏi server xem còn hợp lệ không trước khi vào trang
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(ADMIN_TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(ADMIN_TOKEN_KEY)) return;
    adminApi
      .me()
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem(ADMIN_TOKEN_KEY))
      .finally(() => setChecking(false));
  }, []);

  // api.js phát sự kiện này khi server trả 401 (token hết hạn / tài khoản bị khóa)
  useEffect(() => {
    window.addEventListener('tritech:admin-unauthorized', logout);
    return () => window.removeEventListener('tritech:admin-unauthorized', logout);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await adminApi.login(email, password);
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

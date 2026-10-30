/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CUSTOMER_TOKEN_KEY } from '../lib/api';
import { shopApi } from '../services/shop';

const CustomerContext = createContext(null);

const readToken = () => {
  try {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    return null;
  }
};

// Tài khoản khách hàng: token lưu ở trình duyệt, thông tin tải lại từ server khi mở web
export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(readToken()));

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    } catch {
      // bỏ qua
    }
    setCustomer(null);
  }, []);

  // Nhận kết quả đăng nhập / đăng ký từ server: { token, customer }
  const signIn = useCallback(({ token, customer: c }) => {
    try {
      localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    } catch {
      // trình duyệt chặn bộ nhớ: vẫn đăng nhập trong phiên này
    }
    setCustomer(c);
  }, []);

  useEffect(() => {
    if (!readToken()) return;
    shopApi
      .me()
      .then(({ data }) => setCustomer(data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('tritech:customer-unauthorized', logout);
    return () => window.removeEventListener('tritech:customer-unauthorized', logout);
  }, [logout]);

  return (
    <CustomerContext.Provider value={{ customer, loading, signIn, logout, setCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);

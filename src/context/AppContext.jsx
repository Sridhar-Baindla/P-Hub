import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const fetchCartCount = () => {
    fetch(`${API_URL}/cart`)
      .then(res => res.json())
      .then(data => {
        const count = data.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      })
      .catch(err => console.error(err));
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, cartCount, fetchCartCount }}>
      {children}
    </AppContext.Provider>
  );
};

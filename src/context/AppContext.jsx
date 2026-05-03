import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    fetchCartCount();
  }, []);

  const fetchCartCount = () => {
    fetch('http://localhost:5000/cart')
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

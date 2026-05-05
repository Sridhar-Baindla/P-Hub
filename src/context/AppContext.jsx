import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [cartCount, setCartCount] = useState(0);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    fetchCartCount();
  }, [user, token]);

  const fetchCartCount = () => {
    if (!token) {
      setCartCount(0);
      return;
    }

    fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const count = data.reduce((acc, item) => acc + item.quantity, 0);
          setCartCount(count);
        }
      })
      .catch(err => console.error(err));
  };

  const checkDeviceLimit = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/sessions?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to check sessions');
      const sessions = await response.json();
      
      const deviceId = getDeviceId();
      const existingSession = sessions.find(s => s.deviceId === deviceId);
      
      if (existingSession) return true; 
      if (sessions.length >= 3) return false; 
      
      return true;
    } catch (error) {
      console.error('Error checking device limit:', error);
      return true; 
    }
  };

  const login = async (userData, userToken) => {
    const deviceId = getDeviceId();
    
    // Check if session already exists for this device
    const res = await fetch(`${API_URL}/sessions?userId=${userData.id}&deviceId=${deviceId}`);
    const sessions = await res.json();
    
    if (sessions.length === 0) {
      await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, deviceId, lastActive: new Date().toISOString() })
      });
    }

    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    if (user) {
      const deviceId = getDeviceId();
      try {
        const res = await fetch(`${API_URL}/sessions?userId=${user.id}&deviceId=${deviceId}`);
        const sessions = await res.json();
        if (sessions.length > 0) {
          await fetch(`${API_URL}/sessions/${sessions[0].id}`, { method: 'DELETE' });
        }
      } catch (error) {
        console.error('Error removing session on logout:', error);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const authenticatedFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      cartCount, 
      fetchCartCount, 
      checkDeviceLimit, 
      getDeviceId,
      authenticatedFetch 
    }}>
      {children}
    </AppContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
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

  const checkDeviceLimit = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/sessions?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to check sessions');
      const sessions = await response.json();
      
      const deviceId = getDeviceId();
      const existingSession = sessions.find(s => s.deviceId === deviceId);
      
      if (existingSession) return true; // Already logged in on this device
      if (sessions.length >= 3) return false; // Limit reached
      
      return true;
    } catch (error) {
      console.error('Error checking device limit:', error);
      return true; // Default to allow if check fails (better UX, but maybe less secure)
    }
  };

  const login = async (userData) => {
    const deviceId = getDeviceId();
    
    // Check if session already exists for this device
    const res = await fetch(`${API_URL}/sessions?userId=${userData.id}&deviceId=${deviceId}`);
    const sessions = await res.json();
    
    if (sessions.length === 0) {
      // Add new session
      await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, deviceId, lastActive: new Date().toISOString() })
      });
    }

    setUser(userData);
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
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, cartCount, fetchCartCount, checkDeviceLimit, getDeviceId }}>
      {children}
    </AppContext.Provider>
  );
};

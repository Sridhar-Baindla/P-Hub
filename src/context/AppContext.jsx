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
  const [showProfile, setShowProfile] = useState(false);

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
    // Device limit has been removed to allow multi-device login.
    return true;
  };

  const login = async (userData, userToken) => {
    if (!userData || !userToken) {
        console.error("Invalid login data received");
        throw new Error("Invalid login response from server");
    }

    const deviceId = getDeviceId();
    
    // Background session tracking - should not block login
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for background tasks

      const res = await fetch(`${API_URL}/sessions?userId=${userData.id}&deviceId=${deviceId}`, {
        signal: controller.signal
      });
      
      if (res.ok) {
        const sessions = await res.json();
        if (Array.isArray(sessions) && sessions.length === 0) {
          await fetch(`${API_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id, deviceId, lastActive: new Date().toISOString() }),
            signal: controller.signal
          });
        }
      }
      clearTimeout(timeoutId);
    } catch (sessionError) {
      console.warn("Session tracking failed or timed out, continuing login:", sessionError);
    }

    try {
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    } catch (storageError) {
        console.error("Failed to save login state:", storageError);
        throw new Error("Could not save login information. Please check your browser settings.");
    }
  };

  const logout = async () => {
    // Clear state and storage immediately for instant UI feedback
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('warehouseAdmin'); // Cleanup any legacy keys
    
    // Perform session cleanup in background
    if (user) {
      const deviceId = getDeviceId();
      try {
        const res = await fetch(`${API_URL}/sessions?userId=${user.id}&deviceId=${deviceId}`);
        const sessions = await res.json();
        if (Array.isArray(sessions) && sessions.length > 0) {
          await fetch(`${API_URL}/sessions/${sessions[0].id}`, { method: 'DELETE' });
        }
      } catch (error) {
        console.error('Error removing session on logout:', error);
      }
    }
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
      authenticatedFetch,
      showProfile,
      setShowProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail, NOTIFICATIONS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('pms_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setNotifications(NOTIFICATIONS.filter(n => n.u_id === u.u_id));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 800));
    const found = getUserByEmail(email);
    if (!found || found.password !== password) throw new Error('Invalid email or password');
    if (!found.is_verified) throw new Error('Please verify your email first');
    const sessionUser = { ...found };
    delete sessionUser.password;
    setUser(sessionUser);
    setNotifications(NOTIFICATIONS.filter(n => n.u_id === sessionUser.u_id));
    localStorage.setItem('pms_user', JSON.stringify(sessionUser));
    return sessionUser;
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('pms_user');
  };

  const markNotifRead = (n_id) => {
    setNotifications(prev => prev.map(n => n.n_id === n_id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, notifications, markNotifRead, markAllRead, unreadCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
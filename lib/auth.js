"use client";
import { createContext, useContext, useState, useEffect } from 'react';

// Auth context
const AuthContext = createContext();

// Mock user data for login and registration
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin' },
  { id: '2', name: 'Regular User', email: 'user@example.com', password: 'password', role: 'user' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is saved in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function (using mock data)
  const login = async (email, password) => {
    setError(null);
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password);

    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password; // Don't save password
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      setError('Invalid credentials');
      return { success: false, error: 'Invalid credentials' };
    }
  };

  // Simulate Google login (using mock data)
  const loginWithGoogle = async () => {
    const userData = {
      id: '3',
      name: 'Google User',
      email: 'google@example.com',
      role: 'user',
      picture: 'https://randomuser.me/api/portraits/men/1.jpg',
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true, user: userData };
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Register function (using mock data)
  const register = async (name, email, password) => {
    setError(null);
    if (mockUsers.some((user) => user.email === email)) {
      setError('User already exists');
      return { success: false, error: 'User already exists' };
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      name,
      email,
      password,
      role: 'user',
    };

    mockUsers.push(newUser);

    const userData = { ...newUser };
    delete userData.password; // Don't save password
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true, user: userData };
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to access the Auth context
export const useAuth = () => useContext(AuthContext);

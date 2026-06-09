import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
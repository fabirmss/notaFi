import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'admin' | 'store';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isStore: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin: role === 'admin',
        isStore: role === 'store',
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

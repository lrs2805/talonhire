
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserTypeContext = createContext({});

export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('userType') || 'candidate';
  });

  useEffect(() => {
    localStorage.setItem('userType', userType);
  }, [userType]);

  return (
    <UserTypeContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => useContext(UserTypeContext);

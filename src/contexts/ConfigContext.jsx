import { createContext, useContext } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
};

export const ConfigProvider = ({ children }) => {
  const config = { enable_google_oauth: false };
  const loading = false;
  const error = null;

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

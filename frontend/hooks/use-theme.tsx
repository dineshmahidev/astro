import React, { createContext, useContext } from 'react';

type ThemeMode = 'dark';

const ThemeContext = createContext({
  colorScheme: 'dark' as 'dark',
  theme: 'dark' as 'dark',
  themeMode: 'dark' as ThemeMode,
  setThemeMode: (mode: ThemeMode) => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ 
        colorScheme: 'dark', 
        theme: 'dark', 
        themeMode: 'dark', 
        setThemeMode: () => {}, 
        toggleTheme: () => {} 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

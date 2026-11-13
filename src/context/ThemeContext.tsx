import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'navy-amber' | 'clean-minimal' | 'playful-kids';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rbe_theme') as ThemeType;
      if (saved && (saved === 'navy-amber' || saved === 'clean-minimal' || saved === 'playful-kids')) {
        return saved;
      }
    }
    return 'navy-amber';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rbe_theme', theme);
      const root = document.documentElement;
      root.classList.remove('theme-navy-amber', 'theme-clean-minimal', 'theme-playful-kids');
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('tm_theme') === 'dark' ||
      (!localStorage.getItem('tm_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tm_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label="Alternar tema"
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
    </button>
  );
};

import React, { useState } from 'react';
import {
  Home,
  Compass,
  Calendar,
  CreditCard,
  FileText,
  Users,
  Bot,
  FileSpreadsheet,
  Menu,
  X,
  LogOut,
  MapPin,
  Luggage
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onSelectTab, onLogout }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'trips', label: 'Viagens', icon: Compass },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    { id: 'finances', label: 'Financeiro', icon: CreditCard },
  ];

  const secondaryItems = [
    { id: 'documents', label: 'Documentos', icon: FileText, desc: 'Passaportes, vouchers e bilhetes' },
    { id: 'explore', label: 'Explorar', icon: MapPin, desc: 'Destinos, atrações e avaliações' },
    { id: 'family', label: 'Família & Malas', icon: Users, desc: 'Membros, contatos e bagagens' },
    { id: 'ai', label: 'Assistente IA', icon: Bot, desc: 'Roteiros inteligentes e dúvidas' },
    { id: 'reports', label: 'Relatórios & Backup', icon: FileSpreadsheet, desc: 'PDF, Excel e backup completo' },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Travel Manager
              </span>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold tracking-wider uppercase">Familiar & Pessoal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <Menu className="w-4 h-4" />
              <span>Mais</span>
            </button>
          </nav>

          {/* Right Action icons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs ring-2 ring-brand-500/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Sair do sistema"
                  aria-label="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[11px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              secondaryItems.some(i => i.id === activeTab)
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">Mais</span>
          </button>
        </div>
      </nav>

      {/* Slide-over Drawer for Secondary Modules */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <Luggage className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Módulos do Sistema</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 ring-1 ring-brand-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

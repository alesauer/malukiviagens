import React, { useState } from 'react';
import {
  Home,
  Compass,
  Map,
  Calendar,
  CreditCard,
  ListCheck,
  Luggage,
  FileText,
  MapPin,
  Users,
  Bot,
  FileSpreadsheet,
  Menu,
  X,
  LogOut
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

  // Jornada da Viagem (História do usuário: Viagem -> Roteiro -> Reservas -> Financeiro -> Checklists -> Malas)
  const journeyItems = [
    { id: 'trips', label: 'Viagens', step: '1', icon: Compass, desc: 'Criar e gerenciar viagens' },
    { id: 'roteiro', label: 'Roteiros', step: '2', icon: Map, desc: 'Roteiro diário e atividades' },
    { id: 'reservations', label: 'Reservas', step: '3', icon: Calendar, desc: 'Hotéis, voos e transportes' },
    { id: 'finances', label: 'Financeiro', step: '4', icon: CreditCard, desc: 'Gastos, orçamentos e custos' },
    { id: 'checklists', label: 'Checklists', step: '5', icon: ListCheck, desc: 'Tarefas e preparativos' },
    { id: 'malas', label: 'Malas', step: '6', icon: Luggage, desc: 'Bagagens da família por pessoa' },
  ];

  // Ferramentas e Recursos Complementares
  const secondaryItems = [
    { id: 'documents', label: 'Documentos', icon: FileText, desc: 'Passaportes, vouchers e bilhetes' },
    { id: 'explore', label: 'Explorar', icon: MapPin, desc: 'Destinos, atrações e avaliações' },
    { id: 'family', label: 'Família', icon: Users, desc: 'Integrantes e contatos de emergência' },
    { id: 'ai', label: 'Assistente IA', icon: Bot, desc: 'Roteiros inteligentes e dúvidas' },
    { id: 'reports', label: 'Relatórios & Backup', icon: FileSpreadsheet, desc: 'PDF, Excel e segurança' },
  ];

  // Itens na barra inferior mobile (Início + Passos 1 a 3 da Jornada + Mais)
  const mobileBottomItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'trips', label: 'Viagens', icon: Compass },
    { id: 'roteiro', label: 'Roteiros', icon: Map },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
  ];

  // Itens da jornada que aparecem no Drawer mobile (Passos 4 a 6)
  const drawerJourneyItems = journeyItems.slice(3);

  const isDrawerActive =
    drawerJourneyItems.some(item => item.id === activeTab) ||
    secondaryItems.some(item => item.id === activeTab);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP SIDEBAR (Aparece em telas md: e maiores)        */}
      {/* ========================================================= */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:shrink-0 md:sticky md:top-0 md:h-screen md:bg-white md:dark:bg-slate-900 md:border-r md:border-slate-200 md:dark:border-slate-800 md:z-30 transition-colors">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white block leading-tight">
                Travel Manager
              </span>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold tracking-wider uppercase">
                Familiar & Pessoal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Visão Geral */}
          <div>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>Início</span>
            </button>
          </div>

          {/* Jornada da Viagem (História do Usuário) */}
          <div>
            <div className="px-3 flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Jornada da Viagem
              </p>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-1.5 py-0.5 rounded-full">
                Passo a Passo
              </span>
            </div>
            <nav className="space-y-1">
              {journeyItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                      }`}
                      title={`Passo ${item.step}`}
                    >
                      {item.step}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Recursos Complementares */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Recursos & Família
            </p>
            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer (Tema, Perfil e Logout) */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Theme toggle bar */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tema do Sistema</span>
            <ThemeToggle />
          </div>

          {/* User profile card */}
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs ring-2 ring-brand-500/20 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                title="Encerrar sessão"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE TOP HEADER (Apenas em smartphones < md:)        */}
      {/* ========================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between transition-colors">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectTab('dashboard')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-sm">
            <Luggage className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            Travel Manager
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (Acessos no rodapé em mobile) */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-5 h-16">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-semibold'
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
              isDrawerActive
                ? 'text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {isDrawerActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-600" />
              )}
            </div>
            <span className="text-[11px] font-medium mt-1">Mais</span>
          </button>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* 4. SLIDE-OVER DRAWER FOR SECONDARY & JOURNEY CONTINUATION */}
      {/* ========================================================= */}
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
                  <h3 className="font-bold text-slate-900 dark:text-white">Mais Opções</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Continuação da Jornada da Viagem */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Jornada da Viagem (Passos 4 a 6)
                  </p>
                  <span className="text-[9px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950 px-1.5 py-0.5 rounded-full">
                    Etapas
                  </span>
                </div>
                <div className="space-y-1.5">
                  {drawerJourneyItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setIsDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold ring-1 ring-brand-500/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold">{item.label}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {item.step}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recursos Complementares */}
              <div className="mt-6">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Recursos & Família
                </p>
                <div className="space-y-1.5">
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
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold ring-1 ring-brand-500/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
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

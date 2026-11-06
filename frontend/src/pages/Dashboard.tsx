import React, { useEffect, useState } from 'react';
import {
  Compass,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Luggage,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { Trip, User, FamilyGroup } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (tab: string, tripId?: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, familyData] = await Promise.all([
        api.getTrips().catch(() => []),
        api.getCurrentFamily().catch(() => null)
      ]);
      setTrips(tripsData);
      setFamily(familyData);
    } finally {
      setLoading(false);
    }
  };

  const ongoingTrip = trips.find(t => t.status === 'em_andamento');
  const upcomingTrips = trips.filter(t => t.status === 'planejamento' || t.status === 'confirmada');
  const finishedTrips = trips.filter(t => t.status === 'realizada');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-700/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Luggage className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{family ? family.name : 'Painel Familiar'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {user.name.split(' ')[0]}! Pronto para a próxima viagem?
          </h1>
          <p className="mt-2 text-brand-100 text-sm leading-relaxed">
            Centralize roteiros, reservas, documentos e orçamentos familiares em um só lugar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('trips')}
              className="bg-white text-brand-700 hover:bg-brand-50 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Viagem</span>
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 backdrop-blur-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Pedir Roteiro à IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Viagens Cadastradas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{trips.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Em Planejamento</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{upcomingTrips.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Viagens Realizadas</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{finishedTrips.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Integrantes da Família</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{family?.members.length || 1}</p>
        </div>
      </div>

      {/* Ongoing Trip Spotlight (if any) */}
      {ongoingTrip && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Viagem em Andamento Agora
              </span>
            </div>
            <button
              onClick={() => onNavigate('trips', ongoingTrip.id)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
            >
              <span>Ver detalhes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{ongoingTrip.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{ongoingTrip.main_destination || 'Destino da Família'}</span>
            <span>•</span>
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{new Date(ongoingTrip.start_date).toLocaleDateString('pt-BR')} até {new Date(ongoingTrip.end_date).toLocaleDateString('pt-BR')}</span>
          </p>
        </div>
      )}

      {/* Upcoming Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Próximas Viagens da Família</h2>
            <p className="text-xs text-slate-500">Viagens com reservas e roteiros em preparação</p>
          </div>
          <button
            onClick={() => onNavigate('trips')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingTrips.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center">
            <Compass className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhuma viagem em planejamento no momento</p>
            <p className="text-xs text-slate-400 mt-1">Que tal planejar as próximas férias ou um passeio de fim de semana?</p>
            <button
              onClick={() => onNavigate('trips')}
              className="mt-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-500 transition-colors"
            >
              Cadastrar Viagem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTrips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                onClick={() => onNavigate('trips', trip.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-500 transition-all cursor-pointer shadow-sm hover:shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {trip.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {trip.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mt-3 text-base group-hover:text-brand-600 transition-colors">
                  {trip.title}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trip.main_destination || 'A definir'}</span>
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} a{' '}
                    {new Date(trip.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  <span>Abrir planejamento</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


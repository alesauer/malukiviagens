import React, { useEffect, useState } from 'react';
import { Compass, Plus, MapPin, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import { api } from '../services/api';
import { Trip } from '../types';
import { TripDetails } from './TripDetails';

interface TripsProps {
  initialTripId?: number;
  onClearInitialTripId?: () => void;
}

export const Trips: React.FC<TripsProps> = ({ initialTripId, onClearInitialTripId }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(initialTripId || null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal: Nova Viagem
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ferias');
  const [status, setStatus] = useState('planejamento');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mainDest, setMainDest] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (initialTripId) {
      setSelectedTripId(initialTripId);
    }
  }, [initialTripId]);

  useEffect(() => {
    loadTrips();
  }, [categoryFilter, statusFilter]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await api.getTrips(categoryFilter || undefined, statusFilter || undefined);
      setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    try {
      const newTrip = await api.createTrip({
        title,
        category,
        status: status as any,
        start_date: startDate,
        end_date: endDate,
        main_destination: mainDest,
        description: desc
      });
      setTrips([newTrip, ...trips]);
      setShowCreateModal(false);
      setSelectedTripId(newTrip.id);
      setTitle('');
      setStartDate('');
      setEndDate('');
      setMainDest('');
      setDesc('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (selectedTripId) {
    return (
      <TripDetails
        tripId={selectedTripId}
        onBack={() => {
          setSelectedTripId(null);
          if (onClearInitialTripId) onClearInitialTripId();
          loadTrips();
        }}
      />
    );
  }

  const filteredTrips = trips.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.main_destination && t.main_destination.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Viagens da Família
          </h1>
          <p className="text-sm text-slate-500">
            Planejamento, roteiros diários e histórico completo de viagens
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Viagem</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por viagem ou destino..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">Todas Categorias</option>
            <option value="ferias">Férias</option>
            <option value="nacional">Viagem Nacional</option>
            <option value="internacional">Viagem Internacional</option>
            <option value="fim_de_semana">Final de Semana</option>
            <option value="feriado">Feriado</option>
            <option value="passeio">Passeio de um dia</option>
            <option value="excursao">Excursão</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">Todos os Status</option>
            <option value="planejamento">Planejamento</option>
            <option value="confirmada">Confirmada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Carregando viagens...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Nenhuma viagem encontrada</h3>
          <p className="text-xs text-slate-500 mt-1">Crie sua primeira viagem para começar a planejar destinos e roteiros.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-500 transition-colors"
          >
            Cadastrar Primeira Viagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map(trip => (
            <div
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {trip.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {trip.status}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-3 group-hover:text-brand-600 transition-colors">
                {trip.title}
              </h3>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{trip.main_destination || 'Vários destinos'}</span>
              </p>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} a{' '}
                  {new Date(trip.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-semibold">
                <span>Ver Roteiro e Detalhes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Cadastrar Viagem */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Planejar Nova Viagem
            </h2>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Viagem
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Férias de Verão em Florianópolis"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="ferias">Férias</option>
                    <option value="nacional">Viagem Nacional</option>
                    <option value="internacional">Viagem Internacional</option>
                    <option value="fim_de_semana">Final de Semana</option>
                    <option value="feriado">Feriado</option>
                    <option value="passeio">Passeio de um dia</option>
                    <option value="excursao">Excursão</option>
                    <option value="profissional">Profissional</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destino Principal
                  </label>
                  <input
                    type="text"
                    value={mainDest}
                    onChange={e => setMainDest(e.target.value)}
                    placeholder="Ex: Florianópolis"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição ou Objetivo (opcional)
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Informações adicionais sobre o objetivo da viagem..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Criar Viagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


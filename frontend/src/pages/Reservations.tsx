import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Filter, Plane, Hotel, Car, Utensils, Ticket, Shield, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Reservation, Trip } from '../types';

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // New reservation modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [resType, setResType] = useState<'hospedagem' | 'voo' | 'transporte' | 'restaurante' | 'ingresso' | 'seguro'>('hospedagem');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente'>('pendente');
  const [autoExpense, setAutoExpense] = useState(true);

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tripsData = await api.getTrips();
      setTrips(tripsData);
      if (tripsData.length > 0 && selectedTripId === 0) {
        setSelectedTripId(tripsData[0].id);
      }

      // Collect reservations from all trips
      const allRes: Reservation[] = [];
      for (const t of tripsData) {
        const resList = await api.getReservations(t.id, typeFilter || undefined);
        allRes.push(...resList);
      }
      setReservations(allRes);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedTripId) return;

    try {
      const newRes = await api.createReservation({
        trip_id: selectedTripId,
        type: resType,
        title,
        provider,
        booking_code: bookingCode,
        total_value: parseFloat(totalValue) || 0,
        payment_status: paymentStatus
      }, autoExpense);

      setReservations([newRes, ...reservations]);
      setShowModal(false);
      setTitle('');
      setProvider('');
      setBookingCode('');
      setTotalValue('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'voo': return Plane;
      case 'hospedagem': return Hotel;
      case 'transporte': return Car;
      case 'restaurante': return Utensils;
      case 'ingresso': return Ticket;
      case 'seguro': return Shield;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reservas e Passagens
          </h1>
          <p className="text-sm text-slate-500">
            Hospedagens, voos, transportes, ingressos, restaurantes e seguros
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={trips.length === 0}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Reserva</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
        {[
          { id: '', label: 'Todas' },
          { id: 'hospedagem', label: 'Hospedagens' },
          { id: 'voo', label: 'Voos' },
          { id: 'transporte', label: 'Transportes' },
          { id: 'restaurante', label: 'Restaurantes' },
          { id: 'ingresso', label: 'Ingressos & Passeios' },
          { id: 'seguro', label: 'Seguro-Viagem' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTypeFilter(item.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === item.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Carregando reservas...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Nenhuma reserva encontrada</h3>
          <p className="text-xs text-slate-500 mt-1">Adicione passagens aéreas, hotéis, aluguel de carros ou ingressos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map(res => {
            const Icon = getIcon(res.type);
            const associatedTrip = trips.find(t => t.id === res.trip_id);
            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {res.type}
                      </span>
                      {associatedTrip && (
                        <p className="text-[11px] font-semibold text-brand-600 line-clamp-1">
                          {associatedTrip.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    res.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {res.payment_status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-2">
                  {res.title}
                </h3>
                {res.provider && <p className="text-xs text-slate-500 mt-0.5">{res.provider}</p>}

                {res.booking_code && (
                  <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300">
                    Cód: <span className="font-bold">{res.booking_code}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Valor</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    R$ {Number(res.total_value).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Nova Reserva */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Cadastrar Reserva
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Viagem Associada
                </label>
                <select
                  value={selectedTripId}
                  onChange={e => setSelectedTripId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Reserva
                  </label>
                  <select
                    value={resType}
                    onChange={e => setResType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="hospedagem">Hospedagem</option>
                    <option value="voo">Voo</option>
                    <option value="transporte">Transporte</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="ingresso">Ingresso / Passeio</option>
                    <option value="seguro">Seguro-Viagem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código / Localizador
                  </label>
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={e => setBookingCode(e.target.value)}
                    placeholder="Ex: ABC123"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título / Estabelecimento
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Hotel Grand Palace / Voo GOL 1234"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fornecedor / Cia
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    placeholder="Ex: Booking / Latam"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalValue}
                    onChange={e => setTotalValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoExpense}
                    onChange={e => setAutoExpense(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Lançar automaticamente como despesa no módulo financeiro (RF17)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

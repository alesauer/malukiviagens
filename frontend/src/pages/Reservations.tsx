import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Filter,
  Plane,
  Hotel,
  Car,
  Utensils,
  Ticket,
  Shield,
  Clock,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  MapPin,
  FileText,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Reservation, Trip } from '../types';

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedTripFilter, setSelectedTripFilter] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // New reservation modal
  const [showModal, setShowModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [resType, setResType] = useState<'hospedagem' | 'voo' | 'transporte' | 'restaurante' | 'ingresso' | 'seguro'>('hospedagem');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente'>('pendente');
  const [notes, setNotes] = useState('');
  const [autoExpense, setAutoExpense] = useState(true);

  // Specific detail fields
  const [flightOrigin, setFlightOrigin] = useState('');
  const [flightDest, setFlightDest] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightSeat, setFlightSeat] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelRoom, setHotelRoom] = useState('');
  const [transpCompany, setTranspCompany] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  const [insurCoverage, setInsurCoverage] = useState('');

  // Editing state
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'hospedagem' | 'voo' | 'transporte' | 'restaurante' | 'ingresso' | 'seguro'>('hospedagem');
  const [editProvider, setEditProvider] = useState('');
  const [editBookingCode, setEditBookingCode] = useState('');
  const [editStartDatetime, setEditStartDatetime] = useState('');
  const [editEndDatetime, setEditEndDatetime] = useState('');
  const [editTotalValue, setEditTotalValue] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'pago' | 'pendente'>('pendente');
  const [editNotes, setEditNotes] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Viewing detail state
  const [viewingRes, setViewingRes] = useState<Reservation | null>(null);

  // Delete confirmation
  const [deletingRes, setDeletingRes] = useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
      const detailsObj: Record<string, any> = {};
      if (resType === 'voo') {
        detailsObj.flight_number = flightNumber;
        detailsObj.origin = flightOrigin;
        detailsObj.destination = flightDest;
        detailsObj.seat = flightSeat;
      } else if (resType === 'hospedagem') {
        detailsObj.address = hotelAddress;
        detailsObj.room_type = hotelRoom;
      } else if (resType === 'transporte') {
        detailsObj.company = transpCompany;
      } else if (resType === 'restaurante') {
        detailsObj.cuisine = restCuisine;
      } else if (resType === 'seguro') {
        detailsObj.coverage = insurCoverage;
      }

      const newRes = await api.createReservation({
        trip_id: selectedTripId,
        type: resType,
        title,
        provider: provider || undefined,
        booking_code: bookingCode || undefined,
        start_datetime: startDatetime || undefined,
        end_datetime: endDatetime || undefined,
        contact_phone: contactPhone || undefined,
        contact_email: contactEmail || undefined,
        total_value: parseFloat(totalValue) || 0,
        currency,
        payment_status: paymentStatus,
        details_json: JSON.stringify(detailsObj),
        notes: notes || undefined
      }, autoExpense);

      setReservations([newRes, ...reservations]);
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (res: Reservation) => {
    setEditingRes(res);
    setEditTitle(res.title);
    setEditType(res.type);
    setEditProvider(res.provider || '');
    setEditBookingCode(res.booking_code || '');
    setEditStartDatetime(res.start_datetime ? res.start_datetime.substring(0, 16) : '');
    setEditEndDatetime(res.end_datetime ? res.end_datetime.substring(0, 16) : '');
    setEditTotalValue(res.total_value ? res.total_value.toString() : '0');
    setEditPaymentStatus(res.payment_status);
    setEditNotes(res.notes || '');
    setEditPhone(res.contact_phone || '');
    setEditEmail(res.contact_email || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes || !editTitle) return;

    try {
      setIsSubmitting(true);
      const updated = await api.updateReservation(editingRes.id, {
        title: editTitle,
        type: editType,
        provider: editProvider || undefined,
        booking_code: editBookingCode || undefined,
        start_datetime: editStartDatetime || undefined,
        end_datetime: editEndDatetime || undefined,
        total_value: parseFloat(editTotalValue) || 0,
        payment_status: editPaymentStatus,
        contact_phone: editPhone || undefined,
        contact_email: editEmail || undefined,
        notes: editNotes || undefined
      });

      setReservations(reservations.map(r => r.id === updated.id ? updated : r));
      setEditingRes(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRes) return;
    try {
      setIsSubmitting(true);
      await api.deleteReservation(deletingRes.id);
      setReservations(reservations.filter(r => r.id !== deletingRes.id));
      if (viewingRes?.id === deletingRes.id) setViewingRes(null);
      setDeletingRes(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setProvider('');
    setBookingCode('');
    setStartDatetime('');
    setEndDatetime('');
    setContactPhone('');
    setContactEmail('');
    setTotalValue('');
    setNotes('');
    setFlightOrigin('');
    setFlightDest('');
    setFlightNumber('');
    setFlightSeat('');
    setHotelAddress('');
    setHotelRoom('');
    setTranspCompany('');
    setRestCuisine('');
    setInsurCoverage('');
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

  const filteredReservations = reservations.filter(res => {
    if (selectedTripFilter && res.trip_id !== selectedTripFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = res.title.toLowerCase().includes(term);
      const matchProvider = res.provider && res.provider.toLowerCase().includes(term);
      const matchCode = res.booking_code && res.booking_code.toLowerCase().includes(term);
      if (!matchTitle && !matchProvider && !matchCode) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reservas, Transportes & Seguro
          </h1>
          <p className="text-sm text-slate-500">
            Gerenciamento completo de voos, hotéis, veículos, restaurantes, ingressos e apólices
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={trips.length === 0}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Reserva</span>
        </button>
      </div>

      {/* Filters Bar: Search & Trip Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, fornecedor ou código de reserva..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Viagem:</span>
          <select
            value={selectedTripFilter}
            onChange={e => setSelectedTripFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-brand-500 font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="">Todas as Viagens ({trips.length})</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs by Category */}
      <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
        {[
          { id: '', label: 'Todas' },
          { id: 'voo', label: 'Voos' },
          { id: 'hospedagem', label: 'Hospedagens' },
          { id: 'transporte', label: 'Transportes' },
          { id: 'restaurante', label: 'Restaurantes' },
          { id: 'ingresso', label: 'Ingressos & Atrações' },
          { id: 'seguro', label: 'Seguro-Viagem' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTypeFilter(item.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              typeFilter === item.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Reservations Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Carregando reservas...</div>
      ) : filteredReservations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Nenhuma reserva encontrada</h3>
          <p className="text-xs text-slate-500 mt-1">Adicione passagens aéreas, hotéis, aluguel de carros, restaurantes ou apólices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map(res => {
            const Icon = getIcon(res.type);
            const associatedTrip = trips.find(t => t.id === res.trip_id);
            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-brand-500/50 transition-all flex flex-col justify-between"
              >
                <div>
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
                      res.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {res.payment_status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-2">
                    {res.title}
                  </h3>
                  {res.provider && <p className="text-xs text-slate-500 mt-0.5 font-medium">{res.provider}</p>}

                  {res.start_datetime && (
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(res.start_datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  )}

                  {res.booking_code && (
                    <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300">
                      Localizador: <span className="font-bold">{res.booking_code}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      R$ {Number(res.total_value).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingRes(res)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(res)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar reserva"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingRes(res)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir reserva"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Nova Reserva */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Nova Reserva ou Transporte
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Viagem Associada *
                </label>
                <select
                  required
                  value={selectedTripId}
                  onChange={e => setSelectedTripId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Reserva *
                  </label>
                  <select
                    value={resType}
                    onChange={e => setResType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 capitalize"
                  >
                    <option value="hospedagem">Hospedagem</option>
                    <option value="voo">Voo</option>
                    <option value="transporte">Transporte / Locação</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="ingresso">Ingresso / Passeio</option>
                    <option value="seguro">Seguro Viagem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fornecedor / Cia
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    placeholder="Ex: Latam / Ibis / Localiza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Reserva *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Voo São Paulo - Paris / Hotel Mercure"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Specific fields by type */}
              {resType === 'voo' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Origem (Aeroporto)</label>
                    <input
                      type="text"
                      value={flightOrigin}
                      onChange={e => setFlightOrigin(e.target.value)}
                      placeholder="Ex: GRU"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Destino (Aeroporto)</label>
                    <input
                      type="text"
                      value={flightDest}
                      onChange={e => setFlightDest(e.target.value)}
                      placeholder="Ex: CDG"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nº do Voo</label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={e => setFlightNumber(e.target.value)}
                      placeholder="Ex: LA8072"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assento</label>
                    <input
                      type="text"
                      value={flightSeat}
                      onChange={e => setFlightSeat(e.target.value)}
                      placeholder="Ex: 14A, 14B"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {resType === 'hospedagem' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Endereço do Hotel</label>
                    <input
                      type="text"
                      value={hotelAddress}
                      onChange={e => setHotelAddress(e.target.value)}
                      placeholder="Rua, número, bairro ou link"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tipo de Quarto / Comodidades</label>
                    <input
                      type="text"
                      value={hotelRoom}
                      onChange={e => setHotelRoom(e.target.value)}
                      placeholder="Ex: Quarto Família 2 camas casal, café incluído"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {resType === 'seguro' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cobertura Médica & Detalhes</label>
                  <input
                    type="text"
                    value={insurCoverage}
                    onChange={e => setInsurCoverage(e.target.value)}
                    placeholder="Ex: USD 60.000 despesas médicas hospitalares"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data e Horário Inicial
                  </label>
                  <input
                    type="datetime-local"
                    value={startDatetime}
                    onChange={e => setStartDatetime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data e Horário Final
                  </label>
                  <input
                    type="datetime-local"
                    value={endDatetime}
                    onChange={e => setEndDatetime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código Localizador / Reserva
                  </label>
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={e => setBookingCode(e.target.value)}
                    placeholder="Ex: ABC123XYZ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="pay_status"
                    checked={paymentStatus === 'pago'}
                    onChange={() => setPaymentStatus('pago')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>Pago</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="pay_status"
                    checked={paymentStatus === 'pendente'}
                    onChange={() => setPaymentStatus('pendente')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>Pendente</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações & Contatos
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Informações sobre cancelamento, franquia de bagagem, etc..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Reserva */}
      {editingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingRes(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Editar Reserva
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Reserva
                  </label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500 capitalize"
                  >
                    <option value="hospedagem">Hospedagem</option>
                    <option value="voo">Voo</option>
                    <option value="transporte">Transporte / Locação</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="ingresso">Ingresso / Passeio</option>
                    <option value="seguro">Seguro Viagem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fornecedor / Cia
                  </label>
                  <input
                    type="text"
                    value={editProvider}
                    onChange={e => setEditProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Reserva *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data e Horário Inicial
                  </label>
                  <input
                    type="datetime-local"
                    value={editStartDatetime}
                    onChange={e => setEditStartDatetime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data e Horário Final
                  </label>
                  <input
                    type="datetime-local"
                    value={editEndDatetime}
                    onChange={e => setEditEndDatetime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Código Localizador
                  </label>
                  <input
                    type="text"
                    value={editBookingCode}
                    onChange={e => setEditBookingCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTotalValue}
                    onChange={e => setEditTotalValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="edit_pay_status"
                    checked={editPaymentStatus === 'pago'}
                    onChange={() => setEditPaymentStatus('pago')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>Pago</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="edit_pay_status"
                    checked={editPaymentStatus === 'pendente'}
                    onChange={() => setEditPaymentStatus('pendente')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>Pendente</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRes(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Reserva */}
      {viewingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setViewingRes(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {viewingRes.type}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                viewingRes.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {viewingRes.payment_status}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {viewingRes.title}
            </h2>
            {viewingRes.provider && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{viewingRes.provider}</p>
            )}

            <div className="mt-5 space-y-3 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {viewingRes.booking_code && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Código Localizador:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{viewingRes.booking_code}</span>
                </div>
              )}
              {viewingRes.start_datetime && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Início:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(viewingRes.start_datetime).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
              {viewingRes.end_datetime && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Término:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(viewingRes.end_datetime).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500 font-semibold">Valor Total:</span>
                <span className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                  R$ {Number(viewingRes.total_value).toFixed(2)}
                </span>
              </div>
            </div>

            {viewingRes.notes && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Notas:</span>
                {viewingRes.notes}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  const res = viewingRes;
                  setViewingRes(null);
                  handleStartEdit(res);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 hover:bg-brand-100 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setViewingRes(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão */}
      {deletingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Excluir Reserva
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Tem certeza que deseja excluir a reserva <span className="font-bold text-slate-800 dark:text-slate-200">"{deletingRes.title}"</span>? Esta ação é definitiva e não pode ser desfeita.
            </p>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setDeletingRes(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

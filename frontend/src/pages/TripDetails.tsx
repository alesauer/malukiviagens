import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  FileDown,
  Share2,
  DollarSign,
  Luggage,
  ListCheck,
  Image as ImageIcon,
  Star,
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api';
import {
  Trip,
  Destination,
  Activity,
  Reservation,
  Expense,
  ChecklistItem,
  LuggageItem
} from '../types';

interface TripDetailsProps {
  tripId: number;
  onBack: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ tripId, onBack }) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [luggage, setLuggage] = useState<LuggageItem[]>([]);

  const [activeTab, setActiveTab] = useState<'roteiro' | 'reservas' | 'financeiro' | 'checklists' | 'bagagem' | 'destinos'>('roteiro');
  const [loading, setLoading] = useState(true);

  // New Activity Modal state
  const [showAddAct, setShowAddAct] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState('passeio');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('');
  const [actCost, setActCost] = useState('0');

  // New Expense Modal state
  const [showAddExp, setShowAddExp] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('alimentacao');
  const [expAmount, setExpAmount] = useState('');
  const [expStatus, setExpStatus] = useState<'pago' | 'pendente'>('pago');

  // New Checklist Modal state
  const [showAddCheck, setShowAddCheck] = useState(false);
  const [checkTitle, setCheckTitle] = useState('');
  const [checkPriority, setCheckPriority] = useState<'baixa' | 'media' | 'alta'>('media');

  // Finish Trip Modal state
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishRating, setFinishRating] = useState<number>(5);
  const [finishHoverRating, setFinishHoverRating] = useState<number | null>(null);
  const [finishComments, setFinishComments] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    loadAllTripData();
  }, [tripId]);

  const loadAllTripData = async () => {
    try {
      setLoading(true);
      const [t, d, act, res, exp, chk, lug] = await Promise.all([
        api.getTrip(tripId),
        api.getDestinations(tripId).catch(() => []),
        api.getActivities(tripId).catch(() => []),
        api.getReservations(tripId).catch(() => []),
        api.getExpenses(tripId).catch(() => []),
        api.getChecklists(tripId).catch(() => []),
        api.getLuggageItems(tripId).catch(() => [])
      ]);
      setTrip(t);
      setDestinations(d);
      setActivities(act);
      setReservations(res);
      setExpenses(exp);
      setChecklists(chk);
      setLuggage(lug);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;
    try {
      const newAct = await api.createActivity({
        trip_id: tripId,
        title: actTitle,
        category: actCategory,
        date: actDate || undefined,
        time: actTime || undefined,
        estimated_cost: parseFloat(actCost) || 0
      });
      setActivities([...activities, newAct]);
      setShowAddAct(false);
      setActTitle('');
      setActCost('0');
      setActDate('');
      setActTime('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActivity = async (activity: Activity) => {
    const updated = await api.updateActivity(activity.id, { is_completed: !activity.is_completed });
    setActivities(activities.map(a => a.id === updated.id ? updated : a));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    try {
      const newExp = await api.createExpense({
        trip_id: tripId,
        title: expTitle,
        category: expCategory,
        amount: parseFloat(expAmount),
        date: new Date().toISOString().split('T')[0],
        payment_status: expStatus
      });
      setExpenses([newExp, ...expenses]);
      setShowAddExp(false);
      setExpTitle('');
      setExpAmount('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkTitle) return;
    try {
      const item = await api.createChecklistItem({
        trip_id: tripId,
        title: checkTitle,
        priority: checkPriority,
        is_completed: false
      });
      setChecklists([...checklists, item]);
      setShowAddCheck(false);
      setCheckTitle('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    const updated = await api.updateChecklistItem(item.id, { is_completed: !item.is_completed });
    setChecklists(checklists.map(c => c.id === updated.id ? updated : c));
  };

  const handleOpenFinishModal = () => {
    setFinishRating(trip?.general_rating || 5);
    setFinishComments(trip?.review_comments || '');
    setShowFinishModal(true);
  };

  const handleFinishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsFinishing(true);
      const updated = await api.finishTrip(tripId, finishRating, finishComments.trim() || undefined);
      setTrip(updated);
      setShowFinishModal(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao concluir viagem.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Deseja realmente excluir esta viagem? A exclusão é definitiva conforme regra do sistema.')) return;
    try {
      await api.deleteTrip(tripId);
      onBack();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !trip) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Carregando detalhes da viagem...</p>
      </div>
    );
  }

  const totalSpent = expenses.filter(e => e.payment_status === 'pago').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPending = expenses.filter(e => e.payment_status === 'pendente').reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para viagens</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.getPdfReportUrl(trip.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileDown className="w-4 h-4 text-rose-500" />
            <span>PDF</span>
          </a>
          <a
            href={api.getExcelReportUrl(trip.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </a>
          <a
            href={api.getCalendarIcsUrl(trip.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Google Agenda (.ics)</span>
          </a>

          {trip.status !== 'realizada' ? (
            <button
              onClick={handleOpenFinishModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Viagem</span>
            </button>
          ) : (
            <button
              onClick={handleOpenFinishModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-amber-600 dark:text-amber-400"
              title="Editar avaliação da viagem"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Avaliação</span>
            </button>
          )}

          <button
            onClick={handleDeleteTrip}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Excluir viagem"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trip Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {trip.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {trip.status}
              </span>
              {trip.general_rating && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{trip.general_rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{trip.main_destination || 'Vários destinos'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>
                  {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} até{' '}
                  {new Date(trip.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </span>
            </div>

            {trip.description && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                {trip.description}
              </p>
            )}

            {trip.review_comments && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 max-w-2xl">
                <span className="font-semibold block mb-0.5">Comentários e Avaliação da Família:</span>
                "{trip.review_comments}"
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 min-w-[200px] text-right">
            <p className="text-xs text-slate-500 font-medium">Total Gasto (Pago)</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              R$ {totalSpent.toFixed(2)}
            </p>
            {totalPending > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                + R$ {totalPending.toFixed(2)} pendente
              </p>
            )}
          </div>
        </div>

        {/* Tab navigation bar */}
        <div className="flex overflow-x-auto gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {[
            { id: 'roteiro', label: `Roteiro (${activities.length})` },
            { id: 'destinos', label: `Destinos (${destinations.length})` },
            { id: 'reservas', label: `Reservas (${reservations.length})` },
            { id: 'financeiro', label: `Financeiro (${expenses.length})` },
            { id: 'checklists', label: `Checklists (${checklists.length})` },
            { id: 'bagagem', label: `Malas (${luggage.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Roteiro e Atividades (RF09) */}
      {activeTab === 'roteiro' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Roteiro Diário e Passeios</h2>
              <p className="text-xs text-slate-500">Atividades programadas por data e horários ou catálogo sem data</p>
            </div>
            <button
              onClick={() => setShowAddAct(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Atividade</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-sm">Nenhuma atividade cadastrada no roteiro</p>
              <p className="text-xs text-slate-400 mt-1">Adicione passeios, visitas a pontos turísticos ou restaurantes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(act => (
                <div
                  key={act.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    act.is_completed
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActivity(act)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        act.is_completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 text-transparent hover:border-brand-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className={`font-semibold text-sm ${act.is_completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {act.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        {act.date ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(act.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                            Sem data definida
                          </span>
                        )}
                        {act.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{act.time.slice(0, 5)}</span>
                          </span>
                        )}
                        {Number(act.estimated_cost) > 0 && (
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            R$ {Number(act.estimated_cost).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Destinos (RF05) */}
      {activeTab === 'destinos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Destinos da Viagem</h2>
              <p className="text-xs text-slate-500">Múltiplos destinos, cidades e períodos (RF05)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{d.city}</h3>
                <p className="text-xs text-slate-500">{d.state_region ? `${d.state_region}, ` : ''}{d.country}</p>

                {(d.arrival_date || d.departure_date) && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 mt-3 font-medium">
                    {d.arrival_date ? new Date(d.arrival_date + 'T00:00:00').toLocaleDateString('pt-BR') : ''} até{' '}
                    {d.departure_date ? new Date(d.departure_date + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reservas (RF11 a RF15) */}
      {activeTab === 'reservas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reservas Confirmadas e Pendentes</h2>
              <p className="text-xs text-slate-500">Hospedagens, voos, transportes, ingressos e seguro-viagem</p>
            </div>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-sm">Nenhuma reserva registrada para esta viagem</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {res.type}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      res.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {res.payment_status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">{res.title}</h3>
                  {res.provider && <p className="text-xs text-slate-400">{res.provider}</p>}

                  {res.booking_code && (
                    <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-300">
                      Código / Localizador: <span className="font-bold">{res.booking_code}</span>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Valor Total</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      R$ {Number(res.total_value).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Financeiro (RF16) */}
      {activeTab === 'financeiro' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Despesas da Viagem</h2>
              <p className="text-xs text-slate-500">Controle financeiro em reais com divisão por categorias</p>
            </div>
            <button
              onClick={() => setShowAddExp(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Despesa</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">Pago</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">R$ {totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">Pendente</span>
              <p className="text-xl font-extrabold text-amber-500 mt-0.5">R$ {totalPending.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{e.title}</td>
                    <td className="py-3 px-4 text-slate-500">{e.category}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        e.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {e.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      R$ {Number(e.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Checklists (RF27) */}
      {activeTab === 'checklists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Checklists e Tarefas</h2>
              <p className="text-xs text-slate-500">Passagens, passaportes, seguros e preparativos da viagem</p>
            </div>
            <button
              onClick={() => setShowAddCheck(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Tarefa</span>
            </button>
          </div>

          <div className="space-y-2">
            {checklists.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    item.is_completed ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {item.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm font-medium ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.title}
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  item.priority === 'alta' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Malas e Bagagem (RF28) */}
      {activeTab === 'bagagem' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Organização de Bagagem</h2>
            <p className="text-xs text-slate-500">Roupas, medicamentos, eletrônicos e itens essenciais por familiar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['roupas', 'higiene', 'eletronicos', 'medicamentos', 'acessorios'].map(cat => (
              <div key={cat} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize mb-2">{cat}</h3>
                <div className="text-xs text-slate-400 italic">
                  Itens preparados para a viagem da família
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Atividade */}
      {showAddAct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nova Atividade no Roteiro</h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={e => setActTitle(e.target.value)}
                  placeholder="Ex: Visita ao Museu / Passeio de Barco"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data (opcional)</label>
                  <input
                    type="date"
                    value={actDate}
                    onChange={e => setActDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Horário (opcional)</label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={e => setActTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custo Estimado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={actCost}
                  onChange={e => setActCost(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAct(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Atividade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Despesa */}
      {showAddExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Lançar Nova Despesa</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={e => setExpTitle(e.target.value)}
                  placeholder="Ex: Jantar em Família"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={expCategory}
                    onChange={e => setExpCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="alimentacao">Alimentação</option>
                    <option value="hospedagem">Hospedagem</option>
                    <option value="passagens">Passagens</option>
                    <option value="transporte">Transporte</option>
                    <option value="passeios">Passeios</option>
                    <option value="compras">Compras</option>
                    <option value="seguro_viagem">Seguro Viagem</option>
                    <option value="outras">Outras</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Situação</label>
                <div className="flex gap-4 text-xs font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={expStatus === 'pago'}
                      onChange={() => setExpStatus('pago')}
                    />
                    <span>Pago</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={expStatus === 'pendente'}
                      onChange={() => setExpStatus('pendente')}
                    />
                    <span>Pendente</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExp(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Registrar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Tarefa de Checklist */}
      {showAddCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Nova Tarefa</h3>
            <form onSubmit={handleAddChecklist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarefa</label>
                <input
                  type="text"
                  required
                  value={checkTitle}
                  onChange={e => setCheckTitle(e.target.value)}
                  placeholder="Ex: Renovar passaporte / Comprar adaptadores de tomada"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                <select
                  value={checkPriority}
                  onChange={e => setCheckPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCheck(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Avaliação e Conclusão de Viagem */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowFinishModal(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Concluir Viagem e Avaliar
                </h3>
                <p className="text-xs text-slate-500">
                  {trip.title}
                </p>
              </div>
            </div>

            <form onSubmit={handleFinishSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Avaliação Geral da Viagem
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (finishHoverRating ?? finishRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFinishHoverRating(star)}
                          onMouseLeave={() => setFinishHoverRating(null)}
                          onClick={() => setFinishRating(star)}
                          className="p-1 rounded-lg hover:scale-115 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {finishRating === 5 && '5 - Excelente / Inesquecível!'}
                    {finishRating === 4 && '4 - Muito boa!'}
                    {finishRating === 3 && '3 - Boa'}
                    {finishRating === 2 && '2 - Regular'}
                    {finishRating === 1 && '1 - Deixou a desejar'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Comentários e Memórias de Encerramento (opcional)
                </label>
                <textarea
                  rows={4}
                  value={finishComments}
                  onChange={e => setFinishComments(e.target.value)}
                  placeholder="Conte como foi a viagem em família, destaques de passeios, dicas para futuras viagens ou lembranças marcantes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  disabled={isFinishing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isFinishing}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFinishing ? 'Salvando...' : 'Salvar e Concluir'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


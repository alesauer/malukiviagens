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
  X,
  Pencil
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
  initialTab?: 'roteiro' | 'reservas' | 'financeiro' | 'checklists' | 'bagagem' | 'destinos';
  allTrips?: Trip[];
  onChangeTripId?: (newId: number) => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({
  tripId,
  onBack,
  initialTab = 'roteiro',
  allTrips,
  onChangeTripId
}) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [luggage, setLuggage] = useState<LuggageItem[]>([]);

  const [activeTab, setActiveTab] = useState<'roteiro' | 'reservas' | 'financeiro' | 'checklists' | 'bagagem' | 'destinos'>(initialTab);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // New Activity Modal state
  const [showAddAct, setShowAddAct] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState('passeio');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('');
  const [actCost, setActCost] = useState('0');

  // Edit Activity Modal state
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editActTitle, setEditActTitle] = useState('');
  const [editActCategory, setEditActCategory] = useState('passeio');
  const [editActDate, setEditActDate] = useState('');
  const [editActTime, setEditActTime] = useState('');
  const [editActCost, setEditActCost] = useState('0');
  const [editActNotes, setEditActNotes] = useState('');

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

  // Destination Modal states
  const [showAddDest, setShowAddDest] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [destCity, setDestCity] = useState('');
  const [destState, setDestState] = useState('');
  const [destCountry, setDestCountry] = useState('Brasil');
  const [destArrival, setDestArrival] = useState('');
  const [destDeparture, setDestDeparture] = useState('');
  const [destNotes, setDestNotes] = useState('');

  // Reservation Modal states
  const [showAddRes, setShowAddRes] = useState(false);
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [resType, setResType] = useState<'hospedagem' | 'voo' | 'transporte' | 'restaurante' | 'ingresso' | 'seguro'>('hospedagem');
  const [resTitle, setResTitle] = useState('');
  const [resProvider, setResProvider] = useState('');
  const [resBookingCode, setResBookingCode] = useState('');
  const [resTotalValue, setResTotalValue] = useState('0');
  const [resPaymentStatus, setResPaymentStatus] = useState<'pago' | 'pendente'>('pago');
  const [resCheckin, setResCheckin] = useState('');
  const [resCheckout, setResCheckout] = useState('');
  const [resNotes, setResNotes] = useState('');

  // Edit Expense Modal state
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [editExpTitle, setEditExpTitle] = useState('');
  const [editExpCategory, setEditExpCategory] = useState('alimentacao');
  const [editExpAmount, setEditExpAmount] = useState('');
  const [editExpStatus, setEditExpStatus] = useState<'pago' | 'pendente'>('pago');
  const [editExpDate, setEditExpDate] = useState('');

  // Edit Checklist Modal state
  const [editingCheck, setEditingCheck] = useState<ChecklistItem | null>(null);
  const [editCheckTitle, setEditCheckTitle] = useState('');
  const [editCheckPriority, setEditCheckPriority] = useState<'baixa' | 'media' | 'alta'>('media');

  // Luggage Modal states
  const [showAddLug, setShowAddLug] = useState(false);
  const [editingLug, setEditingLug] = useState<LuggageItem | null>(null);
  const [lugDesc, setLugDesc] = useState('');
  const [lugCategory, setLugCategory] = useState('roupas');
  const [lugQuantity, setLugQuantity] = useState('1');
  const [lugNotes, setLugNotes] = useState('');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

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

  const handleStartEditActivity = (act: Activity) => {
    setEditingActivity(act);
    setEditActTitle(act.title);
    setEditActCategory(act.category || 'passeio');
    setEditActDate(act.date || '');
    setEditActTime(act.time ? act.time.slice(0, 5) : '');
    setEditActCost(act.estimated_cost ? String(act.estimated_cost) : '0');
    setEditActNotes(act.notes || '');
  };

  const handleSaveEditActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !editActTitle) return;
    try {
      const updated = await api.updateActivity(editingActivity.id, {
        title: editActTitle,
        category: editActCategory,
        date: editActDate ? editActDate : null as any,
        time: editActTime ? editActTime : null as any,
        estimated_cost: parseFloat(editActCost) || 0,
        notes: editActNotes.trim() || undefined
      });
      setActivities(activities.map(a => a.id === updated.id ? updated : a));
      setEditingActivity(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar atividade.');
    }
  };

  const handleDeleteActivity = async (act: Activity) => {
    if (!confirm(`Deseja realmente excluir a atividade "${act.title}" do roteiro?`)) return;
    try {
      await api.deleteActivity(act.id);
      setActivities(activities.filter(a => a.id !== act.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir atividade.');
    }
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

  const handleDownloadPdf = async () => {
    try {
      setDownloadingFormat('pdf');
      await api.downloadPdfReport(tripId, trip?.title);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar PDF.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingFormat('excel');
      await api.downloadExcelReport(tripId, trip?.title);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar Excel.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadIcs = async () => {
    try {
      setDownloadingFormat('ics');
      await api.downloadCalendarIcs(tripId, trip?.title);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar compromissos para Google Agenda (.ics).');
    } finally {
      setDownloadingFormat(null);
    }
  };

  // ---------------- Handlers: Destinos ----------------
  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destCity) return;
    try {
      const created = await api.createDestination({
        trip_id: tripId,
        city: destCity,
        country: destCountry,
        state_region: destState || undefined,
        arrival_date: destArrival || undefined,
        departure_date: destDeparture || undefined,
        notes: destNotes || undefined
      });
      setDestinations([...destinations, created]);
      setShowAddDest(false);
      setDestCity('');
      setDestState('');
      setDestCountry('Brasil');
      setDestArrival('');
      setDestDeparture('');
      setDestNotes('');
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar destino.');
    }
  };

  const handleStartEditDest = (dest: Destination) => {
    setEditingDest(dest);
    setDestCity(dest.city);
    setDestState(dest.state_region || '');
    setDestCountry(dest.country);
    setDestArrival(dest.arrival_date || '');
    setDestDeparture(dest.departure_date || '');
    setDestNotes(dest.notes || '');
  };

  const handleSaveEditDest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDest || !destCity) return;
    try {
      const updated = await api.updateDestination(editingDest.id, {
        city: destCity,
        country: destCountry,
        state_region: destState || undefined,
        arrival_date: destArrival || null as any,
        departure_date: destDeparture || null as any,
        notes: destNotes || undefined
      });
      setDestinations(destinations.map(d => d.id === updated.id ? updated : d));
      setEditingDest(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar destino.');
    }
  };

  const handleDeleteDest = async (dest: Destination) => {
    if (!confirm(`Deseja realmente remover o destino "${dest.city}"?`)) return;
    try {
      await api.deleteDestination(dest.id);
      setDestinations(destinations.filter(d => d.id !== dest.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover destino.');
    }
  };

  // ---------------- Handlers: Reservas ----------------
  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle) return;
    try {
      const created = await api.createReservation({
        trip_id: tripId,
        type: resType,
        title: resTitle,
        provider: resProvider || undefined,
        booking_code: resBookingCode || undefined,
        total_value: parseFloat(resTotalValue) || 0,
        payment_status: resPaymentStatus,
        start_datetime: resCheckin ? resCheckin + 'T00:00:00' : undefined,
        end_datetime: resCheckout ? resCheckout + 'T00:00:00' : undefined,
        notes: resNotes || undefined
      });
      setReservations([...reservations, created]);
      setShowAddRes(false);
      setResTitle('');
      setResProvider('');
      setResBookingCode('');
      setResTotalValue('0');
      setResCheckin('');
      setResCheckout('');
      setResNotes('');
    } catch (err: any) {
      alert(err.message || 'Erro ao criar reserva.');
    }
  };

  const handleStartEditRes = (res: Reservation) => {
    setEditingRes(res);
    setResType(res.type);
    setResTitle(res.title);
    setResProvider(res.provider || '');
    setResBookingCode(res.booking_code || '');
    setResTotalValue(String(res.total_value));
    setResPaymentStatus(res.payment_status);
    setResCheckin(res.start_datetime ? res.start_datetime.slice(0, 10) : '');
    setResCheckout(res.end_datetime ? res.end_datetime.slice(0, 10) : '');
    setResNotes(res.notes || '');
  };

  const handleSaveEditRes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes || !resTitle) return;
    try {
      const updated = await api.updateReservation(editingRes.id, {
        type: resType,
        title: resTitle,
        provider: resProvider || undefined,
        booking_code: resBookingCode || undefined,
        total_value: parseFloat(resTotalValue) || 0,
        payment_status: resPaymentStatus,
        start_datetime: resCheckin ? resCheckin + 'T00:00:00' : null as any,
        end_datetime: resCheckout ? resCheckout + 'T00:00:00' : null as any,
        notes: resNotes || undefined
      });
      setReservations(reservations.map(r => r.id === updated.id ? updated : r));
      setEditingRes(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar reserva.');
    }
  };

  const handleDeleteRes = async (res: Reservation) => {
    if (!confirm(`Deseja realmente remover a reserva "${res.title}"?`)) return;
    try {
      await api.deleteReservation(res.id);
      setReservations(reservations.filter(r => r.id !== res.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover reserva.');
    }
  };

  // ---------------- Handlers: Financeiro ----------------
  const handleStartEditExp = (exp: Expense) => {
    setEditingExp(exp);
    setEditExpTitle(exp.title);
    setEditExpCategory(exp.category);
    setEditExpAmount(String(exp.amount));
    setEditExpStatus(exp.payment_status);
    setEditExpDate(exp.date);
  };

  const handleSaveEditExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp || !editExpTitle) return;
    try {
      const updated = await api.updateExpense(editingExp.id, {
        title: editExpTitle,
        category: editExpCategory,
        amount: parseFloat(editExpAmount) || 0,
        payment_status: editExpStatus,
        date: editExpDate
      });
      setExpenses(expenses.map(exp => exp.id === updated.id ? updated : exp));
      setEditingExp(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar despesa.');
    }
  };

  const handleDeleteExp = async (exp: Expense) => {
    if (!confirm(`Deseja realmente remover a despesa "${exp.title}"?`)) return;
    try {
      await api.deleteExpense(exp.id);
      setExpenses(expenses.filter(e => e.id !== exp.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover despesa.');
    }
  };

  // ---------------- Handlers: Checklists ----------------
  const handleStartEditCheck = (item: ChecklistItem) => {
    setEditingCheck(item);
    setEditCheckTitle(item.title);
    setEditCheckPriority(item.priority);
  };

  const handleSaveEditCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheck || !editCheckTitle) return;
    try {
      const updated = await api.updateChecklistItem(editingCheck.id, {
        title: editCheckTitle,
        priority: editCheckPriority
      });
      setChecklists(checklists.map(c => c.id === updated.id ? updated : c));
      setEditingCheck(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar item do checklist.');
    }
  };

  const handleDeleteCheck = async (item: ChecklistItem) => {
    if (!confirm(`Deseja realmente remover a tarefa "${item.title}"?`)) return;
    try {
      await api.deleteChecklistItem(item.id);
      setChecklists(checklists.filter(c => c.id !== item.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover tarefa.');
    }
  };

  // ---------------- Handlers: Malas e Bagagem ----------------
  const handleToggleLuggagePacked = async (item: LuggageItem) => {
    try {
      const updated = await api.updateLuggageItem(item.id, { is_packed: !item.is_packed });
      setLuggage(luggage.map(l => l.id === updated.id ? updated : l));
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar mala.');
    }
  };

  const handleAddLuggage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lugDesc) return;
    try {
      const created = await api.createLuggageItem({
        trip_id: tripId,
        description: lugDesc,
        category: lugCategory,
        quantity: parseInt(lugQuantity, 10) || 1,
        notes: lugNotes || undefined
      });
      setLuggage([...luggage, created]);
      setShowAddLug(false);
      setLugDesc('');
      setLugQuantity('1');
      setLugNotes('');
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar item na mala.');
    }
  };

  const handleStartEditLug = (item: LuggageItem) => {
    setEditingLug(item);
    setLugDesc(item.description);
    setLugCategory(item.category);
    setLugQuantity(String(item.quantity));
    setLugNotes(item.notes || '');
  };

  const handleSaveEditLug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLug || !lugDesc) return;
    try {
      const updated = await api.updateLuggageItem(editingLug.id, {
        description: lugDesc,
        category: lugCategory,
        quantity: parseInt(lugQuantity, 10) || 1,
        notes: lugNotes || undefined
      });
      setLuggage(luggage.map(l => l.id === updated.id ? updated : l));
      setEditingLug(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar item da mala.');
    }
  };

  const handleDeleteLug = async (item: LuggageItem) => {
    if (!confirm(`Deseja realmente remover o item "${item.description}" da mala?`)) return;
    try {
      await api.deleteLuggageItem(item.id);
      setLuggage(luggage.filter(l => l.id !== item.id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover item da mala.');
    }
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para viagens</span>
          </button>

          {allTrips && allTrips.length > 1 && onChangeTripId && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Trocar viagem:</span>
              <select
                value={tripId}
                onChange={(e) => onChangeTripId(Number(e.target.value))}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
              >
                {allTrips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingFormat === 'pdf'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Baixar relatório completo em PDF"
          >
            <FileDown className="w-4 h-4 text-rose-500" />
            <span>{downloadingFormat === 'pdf' ? 'Gerando...' : 'PDF'}</span>
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingFormat === 'excel'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Baixar planilha de despesas e roteiro em Excel"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>{downloadingFormat === 'excel' ? 'Gerando...' : 'Excel'}</span>
          </button>
          <button
            onClick={handleDownloadIcs}
            disabled={downloadingFormat === 'ics'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Exportar compromissos e reservas para Google Agenda (.ics)"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{downloadingFormat === 'ics' ? 'Gerando...' : 'Google Agenda (.ics)'}</span>
          </button>

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
                        {act.notes && (
                          <span className="text-slate-500 italic max-w-xs truncate" title={act.notes}>
                            • {act.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações da Atividade: Editar e Excluir */}
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button
                      onClick={() => handleStartEditActivity(act)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar atividade"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(act)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir atividade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <button
              onClick={() => setShowAddDest(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Destino</span>
            </button>
          </div>

          {destinations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <MapPin className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-sm">Nenhum destino cadastrado</p>
              <p className="text-xs text-slate-400 mt-1">Adicione as cidades ou países por onde a família passará.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map(d => (
                <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditDest(d)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar destino"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDest(d)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Excluir destino"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{d.city}</h3>
                  <p className="text-xs text-slate-500">{d.state_region ? `${d.state_region}, ` : ''}{d.country}</p>

                  {(d.arrival_date || d.departure_date) && (
                    <p className="text-xs text-brand-600 dark:text-brand-400 mt-3 font-medium">
                      {d.arrival_date ? new Date(d.arrival_date + 'T00:00:00').toLocaleDateString('pt-BR') : ''} até{' '}
                      {d.departure_date ? new Date(d.departure_date + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                    </p>
                  )}

                  {d.notes && (
                    <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                      {d.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
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
            <button
              onClick={() => setShowAddRes(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Reserva</span>
            </button>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-sm">Nenhuma reserva registrada para esta viagem</p>
              <p className="text-xs text-slate-400 mt-1">Cadastre hotéis, passagens aéreas ou aluguel de veículos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {res.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        res.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {res.payment_status}
                      </span>
                      <button
                        onClick={() => handleStartEditRes(res)}
                        className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar reserva"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRes(res)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Excluir reserva"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2">{res.title}</h3>
                  {res.provider && <p className="text-xs text-slate-400">{res.provider}</p>}

                  {res.booking_code && (
                    <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-300">
                      Código / Localizador: <span className="font-bold">{res.booking_code}</span>
                    </div>
                  )}

                  {(res.start_datetime || res.end_datetime) && (
                    <div className="mt-2 text-xs text-slate-500">
                      <span>Período: </span>
                      {res.start_datetime ? new Date(res.start_datetime).toLocaleDateString('pt-BR') : ''}
                      {res.end_datetime ? ` até ${new Date(res.end_datetime).toLocaleDateString('pt-BR')}` : ''}
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
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
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
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhuma despesa cadastrada nesta viagem.
                    </td>
                  </tr>
                ) : (
                  expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{e.title}</td>
                      <td className="py-3 px-4 text-slate-500 capitalize">{e.category}</td>
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEditExp(e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar despesa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExp(e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Tarefa</span>
            </button>
          </div>

          {checklists.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <ListCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-sm">Nenhuma tarefa no checklist</p>
              <p className="text-xs text-slate-400 mt-1">Crie lembretes de documentos, vacinas ou compras antes de viajar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checklists.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-500 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      item.is_completed ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {item.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-sm font-medium ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.priority === 'alta' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.priority}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditCheck(item);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar tarefa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCheck(item);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Malas e Bagagem (RF28) */}
      {activeTab === 'bagagem' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Organização de Bagagem</h2>
              <p className="text-xs text-slate-500">Roupas, medicamentos, eletrônicos e itens essenciais por familiar (RF28)</p>
            </div>
            <button
              onClick={() => setShowAddLug(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Item à Mala</span>
            </button>
          </div>

          {luggage.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <Luggage className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-sm">Nenhum item na mala ainda</p>
              <p className="text-xs text-slate-400 mt-1">Organize roupas, calçados, nécessaires e eletrônicos para não esquecer nada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {luggage.map(item => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    item.is_packed
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleLuggagePacked(item)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        item.is_packed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 text-transparent hover:border-brand-500'
                      }`}
                      title={item.is_packed ? 'Item na mala' : 'Marcar como guardado'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className={`font-semibold text-sm ${item.is_packed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">
                          {item.category}
                        </span>
                        {item.quantity > 1 && (
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Qtd: {item.quantity}
                          </span>
                        )}
                        {item.notes && (
                          <span className="italic text-slate-500 truncate max-w-xs" title={item.notes}>
                            • {item.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleStartEditLug(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar item da mala"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLug(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir item da mala"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Modal: Editar Atividade */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingActivity(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-brand-600" />
              <span>Editar Atividade</span>
            </h3>

            <form onSubmit={handleSaveEditActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editActTitle}
                  onChange={e => setEditActTitle(e.target.value)}
                  placeholder="Ex: Visita ao Museu / Passeio de Barco"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select
                  value={editActCategory}
                  onChange={e => setEditActCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="passeio">Passeio / Ponto Turístico</option>
                  <option value="alimentacao">Alimentação / Restaurante</option>
                  <option value="transporte">Transporte / Deslocamento</option>
                  <option value="cultura">Cultura / Museu / Show</option>
                  <option value="hospedagem">Hospedagem</option>
                  <option value="compras">Compras</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data (opcional)</label>
                  <input
                    type="date"
                    value={editActDate}
                    onChange={e => setEditActDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Horário (opcional)</label>
                  <input
                    type="time"
                    value={editActTime}
                    onChange={e => setEditActTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custo Estimado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editActCost}
                  onChange={e => setEditActCost(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações / Dicas (opcional)</label>
                <textarea
                  rows={2}
                  value={editActNotes}
                  onChange={e => setEditActNotes(e.target.value)}
                  placeholder="Ex: Ingressos comprados, ponto de encontro..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Alterações
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

      {/* Modal: Adicionar Destino */}
      {showAddDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddDest(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Adicionar Destino</span>
            </h3>
            <form onSubmit={handleAddDestination} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  value={destCity}
                  onChange={e => setDestCity(e.target.value)}
                  placeholder="Ex: Gramado / Paris / Rio de Janeiro"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado / Região</label>
                  <input
                    type="text"
                    value={destState}
                    onChange={e => setDestState(e.target.value)}
                    placeholder="Ex: RS / RJ / Île-de-France"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">País</label>
                  <input
                    type="text"
                    required
                    value={destCountry}
                    onChange={e => setDestCountry(e.target.value)}
                    placeholder="Brasil"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Chegada (opcional)</label>
                  <input
                    type="date"
                    value={destArrival}
                    onChange={e => setDestArrival(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Partida (opcional)</label>
                  <input
                    type="date"
                    value={destDeparture}
                    onChange={e => setDestDeparture(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas / Dicas</label>
                <textarea
                  rows={2}
                  value={destNotes}
                  onChange={e => setDestNotes(e.target.value)}
                  placeholder="Informações adicionais do destino..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDest(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Destino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Destino */}
      {editingDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingDest(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-brand-600" />
              <span>Editar Destino</span>
            </h3>
            <form onSubmit={handleSaveEditDest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  required
                  value={destCity}
                  onChange={e => setDestCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado / Região</label>
                  <input
                    type="text"
                    value={destState}
                    onChange={e => setDestState(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">País</label>
                  <input
                    type="text"
                    required
                    value={destCountry}
                    onChange={e => setDestCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Chegada</label>
                  <input
                    type="date"
                    value={destArrival}
                    onChange={e => setDestArrival(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Partida</label>
                  <input
                    type="date"
                    value={destDeparture}
                    onChange={e => setDestDeparture(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas / Dicas</label>
                <textarea
                  rows={2}
                  value={destNotes}
                  onChange={e => setDestNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Reserva */}
      {showAddRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddRes(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>Nova Reserva</span>
            </h3>
            <form onSubmit={handleAddReservation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Reserva</label>
                <select
                  value={resType}
                  onChange={e => setResType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="hospedagem">Hospedagem / Hotel / Pousada</option>
                  <option value="voo">Voo / Passagem Aérea</option>
                  <option value="transporte">Transporte / Aluguel de Carro</option>
                  <option value="restaurante">Restaurante / Alimentação</option>
                  <option value="ingresso">Ingresso / Passeio</option>
                  <option value="seguro">Seguro Viagem</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={e => setResTitle(e.target.value)}
                  placeholder="Ex: Hotel Fasano / Voo GOL G3 1234"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fornecedor / Cia</label>
                  <input
                    type="text"
                    value={resProvider}
                    onChange={e => setResProvider(e.target.value)}
                    placeholder="Booking / Latam / etc."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Código / Localizador</label>
                  <input
                    type="text"
                    value={resBookingCode}
                    onChange={e => setResBookingCode(e.target.value)}
                    placeholder="Ex: XYZ123"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-in / Início</label>
                  <input
                    type="date"
                    value={resCheckin}
                    onChange={e => setResCheckin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-out / Fim</label>
                  <input
                    type="date"
                    value={resCheckout}
                    onChange={e => setResCheckout(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={resTotalValue}
                    onChange={e => setResTotalValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pagamento</label>
                  <select
                    value={resPaymentStatus}
                    onChange={e => setResPaymentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRes(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Reserva */}
      {editingRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingRes(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-brand-600" />
              <span>Editar Reserva</span>
            </h3>
            <form onSubmit={handleSaveEditRes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Reserva</label>
                <select
                  value={resType}
                  onChange={e => setResType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="hospedagem">Hospedagem / Hotel / Pousada</option>
                  <option value="voo">Voo / Passagem Aérea</option>
                  <option value="transporte">Transporte / Aluguel de Carro</option>
                  <option value="restaurante">Restaurante / Alimentação</option>
                  <option value="ingresso">Ingresso / Passeio</option>
                  <option value="seguro">Seguro Viagem</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={e => setResTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fornecedor / Cia</label>
                  <input
                    type="text"
                    value={resProvider}
                    onChange={e => setResProvider(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Código / Localizador</label>
                  <input
                    type="text"
                    value={resBookingCode}
                    onChange={e => setResBookingCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-in / Início</label>
                  <input
                    type="date"
                    value={resCheckin}
                    onChange={e => setResCheckin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Check-out / Fim</label>
                  <input
                    type="date"
                    value={resCheckout}
                    onChange={e => setResCheckout(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={resTotalValue}
                    onChange={e => setResTotalValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pagamento</label>
                  <select
                    value={resPaymentStatus}
                    onChange={e => setResPaymentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRes(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Despesa */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingExp(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-brand-600" />
              <span>Editar Despesa</span>
            </h3>
            <form onSubmit={handleSaveEditExp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={editExpTitle}
                  onChange={e => setEditExpTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={editExpCategory}
                    onChange={e => setEditExpCategory(e.target.value)}
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
                    value={editExpAmount}
                    onChange={e => setEditExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={editExpDate}
                    onChange={e => setEditExpDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Situação</label>
                  <select
                    value={editExpStatus}
                    onChange={e => setEditExpStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Checklist */}
      {editingCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingCheck(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-brand-600" />
              <span>Editar Tarefa</span>
            </h3>
            <form onSubmit={handleSaveEditCheck} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarefa</label>
                <input
                  type="text"
                  required
                  value={editCheckTitle}
                  onChange={e => setEditCheckTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                <select
                  value={editCheckPriority}
                  onChange={e => setEditCheckPriority(e.target.value as any)}
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
                  onClick={() => setEditingCheck(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Item à Mala */}
      {showAddLug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddLug(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Luggage className="w-5 h-5 text-brand-600" />
              <span>Adicionar à Mala</span>
            </h3>
            <form onSubmit={handleAddLuggage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição do Item</label>
                <input
                  type="text"
                  required
                  value={lugDesc}
                  onChange={e => setLugDesc(e.target.value)}
                  placeholder="Ex: Protetor Solar / Camisetas / Carregador"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={lugCategory}
                    onChange={e => setLugCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="roupas">Roupas</option>
                    <option value="higiene">Higiene / Nécessaire</option>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="documentos">Documentos</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lugQuantity}
                    onChange={e => setLugQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas / Detalhes (opcional)</label>
                <input
                  type="text"
                  value={lugNotes}
                  onChange={e => setLugNotes(e.target.value)}
                  placeholder="Ex: Levar na mala de mão"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLug(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar na Mala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Item da Mala */}
      {editingLug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingLug(null)}
              className="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-brand-600" />
              <span>Editar Item da Mala</span>
            </h3>
            <form onSubmit={handleSaveEditLug} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição do Item</label>
                <input
                  type="text"
                  required
                  value={lugDesc}
                  onChange={e => setLugDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={lugCategory}
                    onChange={e => setLugCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="roupas">Roupas</option>
                    <option value="higiene">Higiene / Nécessaire</option>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="documentos">Documentos</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lugQuantity}
                    onChange={e => setLugQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas / Detalhes (opcional)</label>
                <input
                  type="text"
                  value={lugNotes}
                  onChange={e => setLugNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLug(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


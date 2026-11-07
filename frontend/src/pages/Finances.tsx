import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  DollarSign,
  PieChart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Pencil,
  Trash2,
  X,
  Target,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { Trip, Expense, FinancialSummary, BudgetCategory } from '../types';

export const Finances: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // New Expense Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('alimentacao');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente'>('pago');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Edit Expense Modal
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('alimentacao');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'pago' | 'pendente'>('pago');
  const [editNotes, setEditNotes] = useState('');

  // Delete Expense Confirmation
  const [deletingExp, setDeletingExp] = useState<Expense | null>(null);

  // Budget Modal
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('alimentacao');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Delete Budget Confirmation
  const [deletingBudget, setDeletingBudget] = useState<BudgetCategory | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      loadTripFinances(selectedTripId);
    }
  }, [selectedTripId]);

  const loadTrips = async () => {
    try {
      const tripsData = await api.getTrips();
      setTrips(tripsData);
      if (tripsData.length > 0) {
        setSelectedTripId(tripsData[0].id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const loadTripFinances = async (tripId: number) => {
    try {
      setLoading(true);
      const [expList, sum, budList] = await Promise.all([
        api.getExpenses(tripId).catch(() => []),
        api.getFinancialSummary(tripId).catch(() => null),
        api.getTripBudgets(tripId).catch(() => [])
      ]);
      setExpenses(expList);
      setSummary(sum);
      setBudgets(budList);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !selectedTripId) return;

    try {
      setIsSubmitting(true);
      const newExp = await api.createExpense({
        trip_id: selectedTripId,
        title,
        category,
        amount: parseFloat(amount),
        date: expenseDate,
        payment_status: paymentStatus,
        notes: notes || undefined
      });
      setExpenses([newExp, ...expenses]);
      setShowModal(false);
      setTitle('');
      setAmount('');
      setNotes('');
      loadTripFinances(selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Erro ao lançar despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingExp(exp);
    setEditTitle(exp.title);
    setEditCategory(exp.category);
    setEditAmount(exp.amount.toString());
    setEditDate(exp.date);
    setEditPaymentStatus(exp.payment_status);
    setEditNotes(exp.notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp || !editTitle || !editAmount) return;

    try {
      setIsSubmitting(true);
      const updated = await api.updateExpense(editingExp.id, {
        title: editTitle,
        category: editCategory,
        amount: parseFloat(editAmount),
        date: editDate,
        payment_status: editPaymentStatus,
        notes: editNotes || undefined
      });

      setExpenses(expenses.map(e => e.id === updated.id ? updated : e));
      setEditingExp(null);
      loadTripFinances(selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExp) return;
    try {
      setIsSubmitting(true);
      await api.deleteExpense(deletingExp.id);
      setExpenses(expenses.filter(e => e.id !== deletingExp.id));
      setDeletingExp(null);
      loadTripFinances(selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || !selectedTripId) return;

    try {
      setIsSubmitting(true);
      await api.setTripBudget({
        trip_id: selectedTripId,
        category: budgetCategory,
        budgeted_amount: parseFloat(budgetAmount)
      });
      setShowBudgetModal(false);
      setBudgetAmount('');
      loadTripFinances(selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar meta de orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deletingBudget) return;
    try {
      setIsSubmitting(true);
      await api.deleteTripBudget(deletingBudget.id);
      setBudgets(budgets.filter(b => b.id !== deletingBudget.id));
      setDeletingBudget(null);
      loadTripFinances(selectedTripId);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover meta de orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (categoryFilter && exp.category !== categoryFilter) return false;
    if (statusFilter && exp.payment_status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!exp.title.toLowerCase().includes(term) && !exp.category.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestão Financeira & Orçamentos
          </h1>
          <p className="text-sm text-slate-500">
            Controle de orçamentos, gastos reais por categoria e extrato de despesas familiares
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {trips.length > 0 && (
            <select
              value={selectedTripId}
              onChange={e => setSelectedTripId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowBudgetModal(true)}
            disabled={!selectedTripId}
            className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Target className="w-4 h-4 text-brand-600" />
            <span>Definir Meta / Teto</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedTripId}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Despesa</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Total Gasto (Pago)</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              R$ {summary.total_spent.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Contas Pendentes</span>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">
              R$ {summary.total_pending.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Orçamento Total Planejado</span>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
              R$ {summary.total_budget.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Saldo Restante</span>
            <p className={`text-2xl font-extrabold mt-1 ${summary.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              R$ {summary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Seção de Metas Orçamentárias por Categoria */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Tetos e Metas Orçamentárias por Categoria
            </h2>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            + Adicionar / Ajustar Teto
          </button>
        </div>

        {budgets.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            Nenhuma meta de orçamento definida para esta viagem. Clique em "Definir Meta / Teto" para planejar limites por categoria (hospedagem, alimentação, passeios, compras, etc.).
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgets.map(b => {
              const spent = summary?.by_category?.[b.category]?.spent || 0;
              const pending = summary?.by_category?.[b.category]?.pending || 0;
              const totalCat = spent + pending;
              const pct = b.budgeted_amount > 0 ? Math.min(Math.round((totalCat / b.budgeted_amount) * 100), 100) : 0;
              const isOver = totalCat > b.budgeted_amount;

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                        {b.category}
                      </span>
                      <button
                        onClick={() => setDeletingBudget(b)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Excluir meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Gasto: R$ {totalCat.toFixed(2)}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Teto: R$ {Number(b.budgeted_amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] font-semibold text-right">
                    {isOver ? (
                      <span className="text-rose-600 flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3 h-3" /> Excedeu R$ {(totalCat - b.budgeted_amount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Resta R$ {(b.budgeted_amount - totalCat).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extrato de Lançamentos com Busca e Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Extrato de Despesas
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filteredExpenses.length} de {expenses.length} lançamentos
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar despesa..."
                className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
            >
              <option value="">Todas categorias</option>
              <option value="alimentacao">Alimentação</option>
              <option value="hospedagem">Hospedagem</option>
              <option value="transporte">Transporte</option>
              <option value="passagens">Passagens</option>
              <option value="passeios">Passeios</option>
              <option value="compras">Compras</option>
              <option value="seguro_viagem">Seguro Viagem</option>
              <option value="outras">Outras</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
            >
              <option value="">Todos status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Nenhuma despesa encontrada para esta viagem com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{e.title}</td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{e.category}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        e.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {e.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      R$ {Number(e.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStartEdit(e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar despesa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingExp(e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Excluir despesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Nova Despesa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Lançar Despesa
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Almoço no Restaurante / Combustível"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="alimentacao">Alimentação</option>
                    <option value="hospedagem">Hospedagem</option>
                    <option value="transporte">Transporte</option>
                    <option value="passagens">Passagens</option>
                    <option value="passeios">Passeios</option>
                    <option value="compras">Compras</option>
                    <option value="seguro_viagem">Seguro Viagem</option>
                    <option value="outras">Outras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Despesa
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status do Pagamento
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Dividido com amigos, pago no cartão de crédito..."
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
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
              onClick={() => setEditingExp(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Editar Despesa
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Gasto *
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
                    Categoria
                  </label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="alimentacao">Alimentação</option>
                    <option value="hospedagem">Hospedagem</option>
                    <option value="transporte">Transporte</option>
                    <option value="passagens">Passagens</option>
                    <option value="passeios">Passeios</option>
                    <option value="compras">Compras</option>
                    <option value="seguro_viagem">Seguro Viagem</option>
                    <option value="outras">Outras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Despesa
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status do Pagamento
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={e => setEditPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Detalhes
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
                  onClick={() => setEditingExp(null)}
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

      {/* Modal: Definir Meta / Teto de Orçamento */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowBudgetModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Definir Meta Orçamentária
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Defina o teto máximo desejado para cada categoria nesta viagem.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={budgetCategory}
                  onChange={e => setBudgetCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="alimentacao">Alimentação</option>
                  <option value="hospedagem">Hospedagem</option>
                  <option value="transporte">Transporte</option>
                  <option value="passagens">Passagens</option>
                  <option value="passeios">Passeios</option>
                  <option value="compras">Compras</option>
                  <option value="seguro_viagem">Seguro Viagem</option>
                  <option value="outras">Outras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Teto Planejado (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(e.target.value)}
                  placeholder="Ex: 2500.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Despesa */}
      {deletingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Excluir Despesa
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Deseja realmente remover o lançamento <span className="font-bold text-slate-800 dark:text-slate-200">"{deletingExp.title}"</span> no valor de R$ {Number(deletingExp.amount).toFixed(2)}? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setDeletingExp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteExpense}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Meta Orçamentária */}
      {deletingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Excluir Teto Orçamentário
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Deseja remover o teto da categoria <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">"{deletingBudget.category}"</span> de R$ {Number(deletingBudget.budgeted_amount).toFixed(2)}?
            </p>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setDeletingBudget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBudget}
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

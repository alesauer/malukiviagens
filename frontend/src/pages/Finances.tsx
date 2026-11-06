import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, DollarSign, PieChart, Users, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { api } from '../services/api';
import { Trip, Expense, FinancialSummary } from '../types';

export const Finances: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('alimentacao');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente'>('pago');

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
      const [expList, sum] = await Promise.all([
        api.getExpenses(tripId).catch(() => []),
        api.getFinancialSummary(tripId).catch(() => null)
      ]);
      setExpenses(expList);
      setSummary(sum);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !selectedTripId) return;

    try {
      const newExp = await api.createExpense({
        trip_id: selectedTripId,
        title,
        category,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        payment_status: paymentStatus
      });
      setExpenses([newExp, ...expenses]);
      setShowModal(false);
      setTitle('');
      setAmount('');
      loadTripFinances(selectedTripId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestão Financeira
          </h1>
          <p className="text-sm text-slate-500">
            Controle de orçamentos, gastos em reais e divisão de despesas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {trips.length > 0 && (
            <select
              value={selectedTripId}
              onChange={e => setSelectedTripId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedTripId}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Gasto</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Gasto (Pago)</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              R$ {summary.total_spent.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Contas Pendentes</span>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">
              R$ {summary.total_pending.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Orçamento Definido</span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              R$ {summary.total_budget.toFixed(2)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Saldo Restante</span>
            <p className={`text-2xl font-extrabold mt-1 ${summary.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              R$ {summary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Category breakdown & Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category distribution */}
        {summary && Object.keys(summary.by_category).length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
              Gastos por Categoria
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.by_category).map(([cat, values]) => {
                const totalCat = values.spent + values.pending;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="capitalize text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-slate-900 dark:text-white">R$ {totalCat.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, summary.total_spent > 0 ? (totalCat / summary.total_spent) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm ${
          summary && Object.keys(summary.by_category).length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Extrato de Lançamentos
            </h3>
            <span className="text-xs text-slate-400 font-medium">{expenses.length} registros</span>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Nenhuma despesa registrada para esta viagem.
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{e.title}</td>
                      <td className="py-3.5 px-4 text-slate-500 capitalize">{e.category}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          e.payment_status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {e.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        R$ {Number(e.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nova Despesa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Lançar Despesa
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Gasto
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Almoço no Centro / Combustível"
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
                    <option value="alimentacao">Alimentação</option>
                    <option value="hospedagem">Hospedagem</option>
                    <option value="passagens">Passagens</option>
                    <option value="transporte">Transporte</option>
                    <option value="passeios">Passeios</option>
                    <option value="compras">Compras</option>
                    <option value="seguro_viagem">Seguro Viagem</option>
                    <option value="documentacao">Documentação</option>
                    <option value="outras">Outras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Situação do Pagamento
                </label>
                <div className="flex gap-4 text-xs font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentStatus === 'pago'}
                      onChange={() => setPaymentStatus('pago')}
                    />
                    <span>Pago</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentStatus === 'pendente'}
                      onChange={() => setPaymentStatus('pendente')}
                    />
                    <span>Pendente</span>
                  </label>
                </div>
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
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


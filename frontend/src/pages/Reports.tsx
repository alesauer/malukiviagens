import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Upload,
  Archive,
  Download,
  ShieldCheck,
  RefreshCw,
  Clock,
  History
} from 'lucide-react';
import { api, API_BASE_URL } from '../services/api';
import { Trip } from '../types';

export const Reports: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [backups, setBackups] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, backupList] = await Promise.all([
        api.getTrips(),
        api.listBackups().catch(() => [])
      ]);
      setTrips(tripsData);
      setBackups(backupList);

      // Fetch audit logs
      const res = await fetch(`${API_BASE_URL}/audit/logs`, {
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      if (res.ok) {
        const logs = await res.json();
        setAuditLogs(logs);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await api.createBackup();
      alert(`Backup criado com sucesso: ${res.detail}`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadPdf = async (tripId: number, title?: string) => {
    try {
      setDownloadingId(`pdf_${tripId}`);
      await api.downloadPdfReport(tripId, title);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadExcel = async (tripId: number, title?: string) => {
    try {
      setDownloadingId(`excel_${tripId}`);
      await api.downloadExcelReport(tripId, title);
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar Excel.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Relatórios, Auditoria e Backups
        </h1>
        <p className="text-sm text-slate-500">
          Exportação de documentos, rastreabilidade de alterações e backup completo para portabilidade (RF36, RF40, RF41)
        </p>
      </div>

      {/* Reports Export Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Exportação de Relatórios por Viagem
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Baixe relatórios consolidados contendo itinerários, comprovantes de reservas e extrato de gastos
        </p>

        {trips.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhuma viagem disponível para emissão de relatório.</p>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => (
              <div
                key={trip.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{trip.title}</h4>
                  <p className="text-xs text-slate-400">
                    {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} a{' '}
                    {new Date(trip.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf(trip.id, trip.title)}
                    disabled={downloadingId === `pdf_${trip.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-brand-500 transition-colors disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>{downloadingId === `pdf_${trip.id}` ? 'Gerando...' : 'Relatório PDF'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadExcel(trip.id, trip.title)}
                    disabled={downloadingId === `excel_${trip.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-brand-500 transition-colors disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{downloadingId === `excel_${trip.id}` ? 'Gerando...' : 'Planilha Excel'}</span>
                  </button>

                  <a
                    href={api.getJsonExportUrl(trip.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-brand-500 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>JSON</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Backup Section (RF40) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-brand-600" />
              <span>Backups do Sistema e Portabilidade</span>
            </h2>
            <p className="text-xs text-slate-500">
              Gera compactação contendo banco de dados PostgreSQL e todos os documentos anexados (RF40)
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
            <span>{isBackingUp ? 'Gerando Backup...' : 'Gerar Novo Backup'}</span>
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl text-center text-xs text-slate-400">
            Nenhum arquivo de backup gerado ainda. Clique em "Gerar Novo Backup" para criar a primeira cópia integral.
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map(b => (
              <div
                key={b}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-slate-400" />
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{b}</span>
                </div>

                <a
                  href={api.getBackupDownloadUrl(b)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-brand-600 hover:text-brand-500"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar ZIP</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Section (RF41) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-brand-600" />
          <span>Histórico de Auditoria Familiar (RF41)</span>
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Registro das operações de criação, alteração e exclusão realizadas pelos familiares
        </p>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400">Nenhum evento registrado ainda.</p>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
            {auditLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{log.entity_type}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


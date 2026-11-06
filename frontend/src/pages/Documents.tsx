import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  Lock,
  Plus,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, FamilyGroup, Trip, User } from '../types';

interface DocumentsProps {
  user: User;
}

export const Documents: React.FC<DocumentsProps> = ({ user }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('passaporte');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiExtractData, setAiExtractData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fam, tripsData] = await Promise.all([
        api.getCurrentFamily(),
        api.getTrips()
      ]);
      setFamily(fam);
      setTrips(tripsData);
      if (fam) {
        const docs = await api.getFamilyDocuments(fam.id);
        setDocuments(docs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      // Automatically trigger AI extraction preview (RF23)
      try {
        setIsAiParsing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', docType);
        const parsed = await api.parseDocumentAI(formData);
        setAiExtractData(parsed);
      } catch (err) {
        console.warn('AI parsing preview skipped', err);
      } finally {
        setIsAiParsing(false);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !family) return;

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('doc_type', docType);
      if (selectedTripId) formData.append('trip_id', selectedTripId);
      formData.append('file', selectedFile);

      const newDoc = await api.uploadDocument(formData);
      setDocuments([newDoc, ...documents]);
      setShowUploadModal(false);
      setTitle('');
      setSelectedFile(null);
      setAiExtractData(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    try {
      // In production calls delete
      const res = await fetch(`http://localhost:8000/api/v1/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${api.getToken()}` }
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== docId));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const personalDocs = documents.filter(d => ['passaporte', 'rg', 'cpf', 'cnh', 'visto', 'vacina'].includes(d.doc_type));
  const tripDocs = documents.filter(d => !['passaporte', 'rg', 'cpf', 'cnh', 'visto', 'vacina'].includes(d.doc_type));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Documentos da Família e Viagens
          </h1>
          <p className="text-sm text-slate-500">
            Passaportes, vistos, comprovantes de reserva, bilhetes e apólices de seguro protegidos
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Anexar Documento</span>
        </button>
      </div>

      {/* Security alert info banner */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Lock className="w-5 h-5 text-brand-600 shrink-0" />
        <span>
          Todos os documentos cadastrados são compartilhados exclusivamente com os integrantes do seu grupo familiar (RF22) e protegidos por criptografia e controle de acesso.
        </span>
      </div>

      {/* Personal Documents Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Documentos Pessoais dos Familiares</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700">
            {personalDocs.length}
          </span>
        </h2>

        {personalDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            Nenhum documento pessoal cadastrado. Anexe passaportes, RG ou CNH dos integrantes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {doc.doc_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {(doc.file_size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{doc.file_name}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={api.getDocumentDownloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-500"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trip Documents Section */}
      <div className="space-y-3 pt-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Comprovantes, Vouchers e Passagens das Viagens</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700">
            {tripDocs.length}
          </span>
        </h2>

        {tripDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            Nenhum comprovante ou voucher anexado para as viagens da família.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tripDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {doc.doc_type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {(doc.file_size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{doc.file_name}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={api.getDocumentDownloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-500"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Upload de Documento com extração IA */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Anexar Documento
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arquivo (PDF, JPG, PNG - máx 25MB)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              {isAiParsing && (
                <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-xs text-brand-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                  <span>A inteligência artificial está interpretando o documento anexado...</span>
                </div>
              )}

              {aiExtractData && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dados extraídos com sucesso pela IA (RF23)</span>
                  </div>
                  <p className="text-[11px] opacity-90">{aiExtractData.raw_summary}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Documento
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Passaporte Maria / Voucher Hotel Gramado"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="passaporte">Passaporte</option>
                    <option value="rg">RG / Identidade</option>
                    <option value="cpf">CPF</option>
                    <option value="cnh">CNH</option>
                    <option value="visto">Visto Consular</option>
                    <option value="vacina">Carteira de Vacinação</option>
                    <option value="voucher">Voucher Hospedagem</option>
                    <option value="bilhete">Bilhete de Embarque</option>
                    <option value="apolice">Apólice de Seguro</option>
                    <option value="outros">Outros Documentos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Associar à Viagem
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={e => setSelectedTripId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="">Documento Pessoal Geral</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

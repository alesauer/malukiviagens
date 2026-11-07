import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Pencil,
  Eye,
  Lock,
  Plus,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Search,
  Filter
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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('passaporte');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // AI Document scanning state (RF21)
  const [isScanning, setIsScanning] = useState(false);
  const [aiExtractData, setAiExtractData] = useState<any>(null);

  // Edit modal state
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDocType, setEditDocType] = useState('');
  const [editDocNumber, setEditDocNumber] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editExpirationDate, setEditExpirationDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // View modal state
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);

  // Delete modal state
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fam, tripsData] = await Promise.all([
        api.getCurrentFamily(),
        api.getTrips().catch(() => [])
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

  const handleScanWithAI = async (file: File) => {
    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.parseDocumentAI(formData);
      if (res && res.extracted_data) {
        setAiExtractData(res.extracted_data);
        if (res.extracted_data.doc_type) setDocType(res.extracted_data.doc_type);
        if (res.extracted_data.document_number) setDocNumber(res.extracted_data.document_number);
        if (res.extracted_data.expiration_date) setExpirationDate(res.extracted_data.expiration_date);
        if (!title && res.extracted_data.name) setTitle(`Documento - ${res.extracted_data.name}`);
      }
    } catch (err: any) {
      console.warn('Falha na IA:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (file.type.includes('image') || file.type.includes('pdf')) {
        handleScanWithAI(file);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !family) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('doc_type', docType);
      if (selectedTripId) formData.append('trip_id', selectedTripId);
      if (docNumber) formData.append('doc_number', docNumber);
      if (issueDate) formData.append('issue_date', issueDate);
      if (expirationDate) formData.append('expiration_date', expirationDate);
      if (notes) formData.append('notes', notes);
      formData.append('file', selectedFile);

      const newDoc = await api.uploadDocument(formData);
      setDocuments([newDoc, ...documents]);
      setShowUploadModal(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Erro ao enviar documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditDocType(doc.doc_type);
    setEditDocNumber(doc.doc_number || '');
    setEditIssueDate(doc.issue_date || '');
    setEditExpirationDate(doc.expiration_date || '');
    setEditNotes(doc.notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editTitle) return;

    try {
      setIsSubmitting(true);
      const updated = await api.updateDocument(editingDoc.id, {
        title: editTitle,
        doc_type: editDocType,
        doc_number: editDocNumber || undefined,
        issue_date: editIssueDate || undefined,
        expiration_date: editExpirationDate || undefined,
        notes: editNotes || undefined
      });

      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
      setEditingDoc(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    try {
      setIsSubmitting(true);
      await api.deleteDocument(deletingDoc.id);
      setDocuments(documents.filter(d => d.id !== deletingDoc.id));
      if (viewingDoc?.id === deletingDoc.id) setViewingDoc(null);
      setDeletingDoc(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDocType('passaporte');
    setSelectedTripId('');
    setDocNumber('');
    setIssueDate('');
    setExpirationDate('');
    setNotes('');
    setSelectedFile(null);
    setAiExtractData(null);
  };

  const filteredDocs = documents.filter(doc => {
    if (typeFilter && doc.doc_type !== typeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!doc.title.toLowerCase().includes(term) && !doc.file_name.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const personalDocs = filteredDocs.filter(d => ['passaporte', 'rg', 'cpf', 'cnh', 'visto', 'vacina'].includes(d.doc_type));
  const tripDocs = filteredDocs.filter(d => !['passaporte', 'rg', 'cpf', 'cnh', 'visto', 'vacina'].includes(d.doc_type));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Documentos da Família & Viagens
          </h1>
          <p className="text-sm text-slate-500">
            Passaportes, vistos, comprovantes de reserva, bilhetes e apólices de seguro protegidos
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Anexar Documento</span>
        </button>
      </div>

      {/* Security alert info banner */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Lock className="w-5 h-5 text-brand-600 shrink-0" />
        <span>
          Todos os documentos cadastrados são compartilhados exclusivamente com os integrantes do seu grupo familiar ({family?.name || 'Família'}) e protegidos por criptografia e controle de acesso.
        </span>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do documento ou arquivo..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex overflow-x-auto gap-1.5 no-scrollbar">
          {[
            { id: '', label: 'Todos' },
            { id: 'passaporte', label: 'Passaportes' },
            { id: 'rg', label: 'RG / CPF / CNH' },
            { id: 'visto', label: 'Vistos' },
            { id: 'voucher', label: 'Vouchers' },
            { id: 'apolice', label: 'Apólices de Seguro' },
            { id: 'outros', label: 'Outros' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === f.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
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
            Nenhum documento pessoal cadastrado. Anexe passaportes, RG, CPF ou CNH dos integrantes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-brand-500/50 transition-all flex flex-col justify-between"
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
                  {doc.doc_number && (
                    <p className="text-xs font-mono text-slate-500 mt-1">Nº: {doc.doc_number}</p>
                  )}
                  {doc.expiration_date && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                      Vencimento: {new Date(doc.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 truncate">{doc.file_name}</p>
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                      title="Editar metadados"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingDoc(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Travel Documents Section */}
      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Vouchers, Reservas e Apólices de Viagens</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {tripDocs.length}
          </span>
        </h2>

        {tripDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            Nenhum comprovante de viagem anexado. Anexe bilhetes aéreos, reservas de hotéis ou seguros.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tripDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-brand-500/50 transition-all flex flex-col justify-between"
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
                  <p className="text-xs text-slate-400 mt-1 truncate">{doc.file_name}</p>
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                      title="Editar metadados"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingDoc(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Anexar Documento */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Anexar Novo Documento
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File upload drag/input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arquivo (PDF ou Imagem) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300 hover:file:bg-brand-100"
                />
              </div>

              {isScanning && (
                <div className="p-3 bg-brand-50 dark:bg-brand-950/60 rounded-xl text-xs text-brand-700 dark:text-brand-300 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Escaneando documento com IA para preenchimento inteligente...</span>
                </div>
              )}

              {aiExtractData && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dados extraídos automaticamente do documento com sucesso!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Documento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Passaporte Alexandre / Voucher Hotel Paris"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="passaporte">Passaporte</option>
                    <option value="rg">RG</option>
                    <option value="cpf">CPF</option>
                    <option value="cnh">CNH</option>
                    <option value="visto">Visto</option>
                    <option value="vacina">Certificado de Vacina</option>
                    <option value="voucher">Voucher de Reserva</option>
                    <option value="bilhete">Bilhete de Passagem</option>
                    <option value="apolice">Apólice de Seguro Viagem</option>
                    <option value="comprovante">Comprovante</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número do Documento / Apólice
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                    placeholder="Ex: YA123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vincular a uma Viagem (Opcional)
                </label>
                <select
                  value={selectedTripId}
                  onChange={e => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Documento Geral da Família</option>
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Informações adicionais..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Salvar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Documento */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setEditingDoc(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Editar Metadados do Documento
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Documento *
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
                    Tipo de Documento
                  </label>
                  <select
                    value={editDocType}
                    onChange={e => setEditDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="passaporte">Passaporte</option>
                    <option value="rg">RG</option>
                    <option value="cpf">CPF</option>
                    <option value="cnh">CNH</option>
                    <option value="visto">Visto</option>
                    <option value="vacina">Certificado de Vacina</option>
                    <option value="voucher">Voucher de Reserva</option>
                    <option value="bilhete">Bilhete de Passagem</option>
                    <option value="apolice">Apólice de Seguro</option>
                    <option value="comprovante">Comprovante</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número do Documento / Apólice
                  </label>
                  <input
                    type="text"
                    value={editDocNumber}
                    onChange={e => setEditDocNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={editIssueDate}
                    onChange={e => setEditIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={editExpirationDate}
                    onChange={e => setEditExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
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
                  onClick={() => setEditingDoc(null)}
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

      {/* Modal: Detalhes do Documento */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setViewingDoc(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              {viewingDoc.doc_type}
            </span>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              {viewingDoc.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{viewingDoc.file_name}</p>

            <div className="mt-5 space-y-2.5 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {viewingDoc.doc_number && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Número do Documento:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingDoc.doc_number}</span>
                </div>
              )}
              {viewingDoc.expiration_date && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Data de Vencimento:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(viewingDoc.expiration_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {viewingDoc.issue_date && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Data de Emissão:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(viewingDoc.issue_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Tamanho:</span>
                <span className="text-slate-600 dark:text-slate-400">{(viewingDoc.file_size / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            {viewingDoc.notes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">Notas:</span>
                {viewingDoc.notes}
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <a
                href={api.getDocumentDownloadUrl(viewingDoc.id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Arquivo</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const doc = viewingDoc;
                    setViewingDoc(null);
                    handleStartEdit(doc);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Documento */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Excluir Documento
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Deseja realmente excluir o documento <span className="font-bold text-slate-800 dark:text-slate-200">"{deletingDoc.title}"</span>? O arquivo físico e os metadados serão removidos definitivamente.
            </p>

            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setDeletingDoc(null)}
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

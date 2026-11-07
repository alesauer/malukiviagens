import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Phone, ShieldAlert, Plus, Trash2, Edit2, Mail, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { api } from '../services/api';
import { FamilyGroup, EmergencyContact, User } from '../types';

interface FamilyProps {
  user: User;
}

export const Family: React.FC<FamilyProps> = ({ user }) => {
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Emergency contact modal state
  const [showEmergModal, setShowEmergModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [emergRel, setEmergRel] = useState('');
  const [submittingEmerg, setSubmittingEmerg] = useState(false);

  // Delete confirmations
  const [deletingContact, setDeletingContact] = useState<EmergencyContact | null>(null);
  const [deletingMember, setDeletingMember] = useState<{ id: number; name: string } | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fam, emerg] = await Promise.all([
        api.getCurrentFamily(),
        api.getEmergencyContacts()
      ]);
      setFamily(fam);
      setEmergencyContacts(emerg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setSubmittingInvite(true);
      await api.inviteFamilyMember(inviteEmail);
      setInviteFeedback(`Convite enviado com sucesso para ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteFeedback(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingInvite(false);
    }
  };

  const openNewEmergency = () => {
    setEditingContact(null);
    setEmergName('');
    setEmergPhone('');
    setEmergRel('');
    setShowEmergModal(true);
  };

  const openEditEmergency = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setEmergName(contact.name);
    setEmergPhone(contact.phone);
    setEmergRel(contact.relationship_label || '');
    setShowEmergModal(true);
  };

  const handleSaveEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergName || !emergPhone) return;

    try {
      setSubmittingEmerg(true);
      if (editingContact) {
        const updated = await api.updateEmergencyContact(editingContact.id, {
          name: emergName,
          phone: emergPhone,
          relationship_label: emergRel
        });
        setEmergencyContacts(emergencyContacts.map(c => c.id === updated.id ? updated : c));
      } else {
        const contact = await api.createEmergencyContact({
          name: emergName,
          phone: emergPhone,
          relationship_label: emergRel
        });
        setEmergencyContacts([...emergencyContacts, contact]);
      }
      setShowEmergModal(false);
      setEditingContact(null);
      setEmergName('');
      setEmergPhone('');
      setEmergRel('');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar contato');
    } finally {
      setSubmittingEmerg(false);
    }
  };

  const handleDeleteEmergency = async () => {
    if (!deletingContact) return;
    try {
      setSubmittingDelete(true);
      await api.deleteEmergencyContact(deletingContact.id);
      setEmergencyContacts(emergencyContacts.filter(c => c.id !== deletingContact.id));
      setDeletingContact(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir contato');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!deletingMember) return;
    try {
      setSubmittingDelete(true);
      await api.removeFamilyMember(deletingMember.id);
      if (family) {
        setFamily({
          ...family,
          members: family.members.filter(m => m.id !== deletingMember.id)
        });
      }
      setDeletingMember(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover membro da família');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Grupo Familiar e Emergência
          </h1>
          <p className="text-sm text-slate-500">
            Gerenciamento dos integrantes da família, convites e contatos de emergência (RF02, RF29)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openNewEmergency}
            className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Contato Emergência</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Convidar Familiar</span>
          </button>
        </div>
      </div>

      {/* Family Members Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Integrantes de {family ? family.name : 'Família'}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700">
            {family?.members.length || 1}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {family?.members.map(member => {
            const isCurrentUser = member.user.id === user.id;
            return (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{member.user.name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-normal">
                          Você
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    member.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {member.role === 'admin' ? 'Administrador' : 'Membro'}
                  </span>
                  {!isCurrentUser && (
                    <button
                      onClick={() => setDeletingMember({ id: member.id, name: member.user.name })}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remover membro da família"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Contacts Section (RF29) */}
      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Contatos de Emergência da Família</span>
          </h2>
          <p className="text-xs text-slate-500">
            Números de telefone de médicos, parentes e contatos acessíveis offline durante viagens
          </p>
        </div>

        {emergencyContacts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400">
            Nenhum contato de emergência cadastrado. Adicione telefones importantes para segurança da família.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map(c => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h4>
                  {c.relationship_label && (
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                      {c.relationship_label}
                    </span>
                  )}
                  <p className="text-xs font-mono text-slate-500 mt-1">{c.phone}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${c.phone}`}
                    className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                    title="Ligar para contato"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openEditEmergency(c)}
                    className="w-8 h-8 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-center justify-center transition-colors"
                    title="Editar contato"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingContact(c)}
                    className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                    title="Excluir contato"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Convidar Familiar */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Convidar para a Família
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Envie um convite para que outro integrante familiar acesse e colabore no planejamento de todas as viagens.
            </p>

            {inviteFeedback && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteFeedback}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail do Familiar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="familiar@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {submittingInvite ? 'Enviando...' : 'Enviar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar / Editar Contato de Emergência */}
      {showEmergModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingContact ? 'Editar Contato de Emergência' : 'Cadastrar Contato de Emergência'}
            </h2>

            <form onSubmit={handleSaveEmergency} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Contato
                </label>
                <input
                  type="text"
                  required
                  value={emergName}
                  onChange={e => setEmergName(e.target.value)}
                  placeholder="Ex: Dra. Mariana (Pediatra) / Tio Roberto"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone com DDD
                </label>
                <input
                  type="tel"
                  required
                  value={emergPhone}
                  onChange={e => setEmergPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parentesco / Relação
                </label>
                <input
                  type="text"
                  value={emergRel}
                  onChange={e => setEmergRel(e.target.value)}
                  placeholder="Ex: Médico da Família / Parente Próximo"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmergModal(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingEmerg}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  {submittingEmerg ? 'Salvando...' : 'Salvar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmação: Excluir Contato de Emergência */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Excluir Contato</h3>
            </div>
            <p className="text-xs text-slate-500">
              Tem certeza que deseja excluir o contato de emergência <strong className="text-slate-800 dark:text-slate-200">{deletingContact.name}</strong>? Esta ação é definitiva e não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingContact(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteEmergency}
                disabled={submittingDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {submittingDelete ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação: Remover Membro */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Remover Membro</h3>
            </div>
            <p className="text-xs text-slate-500">
              Deseja remover <strong className="text-slate-800 dark:text-slate-200">{deletingMember.name}</strong> do grupo familiar? A pessoa perderá o acesso às viagens compartilhadas.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRemoveMember}
                disabled={submittingDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {submittingDelete ? 'Removendo...' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Phone, ShieldAlert, Plus, Trash2, Mail, CheckCircle2 } from 'lucide-react';
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

  // Emergency contact modal state
  const [showEmergModal, setShowEmergModal] = useState(false);
  const [emergName, setEmergName] = useState('');
  const [emergPhone, setEmergPhone] = useState('');
  const [emergRel, setEmergRel] = useState('');

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
      await api.inviteFamilyMember(inviteEmail);
      setInviteFeedback(`Convite enviado com sucesso para ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteFeedback(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergName || !emergPhone) return;

    try {
      const contact = await api.createEmergencyContact({
        name: emergName,
        phone: emergPhone,
        relationship_label: emergRel
      });
      setEmergencyContacts([...emergencyContacts, contact]);
      setShowEmergModal(false);
      setEmergName('');
      setEmergPhone('');
      setEmergRel('');
    } catch (err: any) {
      alert(err.message);
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
            onClick={() => setShowEmergModal(true)}
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
          {family?.members.map(member => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {member.user.name}
                  </h4>
                  <p className="text-xs text-slate-400">{member.user.email}</p>
                </div>
              </div>

              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                member.role === 'admin'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {member.role === 'admin' ? 'Administrador' : 'Membro'}
              </span>
            </div>
          ))}
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

                <a
                  href={`tel:${c.phone}`}
                  className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                  title="Ligar para contato"
                >
                  <Phone className="w-4 h-4" />
                </a>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contato de Emergência */}
      {showEmergModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Cadastrar Contato de Emergência
            </h2>

            <form onSubmit={handleAddEmergency} className="space-y-4">
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
                  onClick={() => setShowEmergModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


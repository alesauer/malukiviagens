import React, { useState } from 'react';
import { Luggage, Lock, Mail, User as UserIcon, Phone, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isReset, setIsReset] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isReset) {
        if (!resetToken) {
          // Request reset
          const res = await fetch('http://localhost:8000/api/v1/auth/password-reset-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          setSuccessMsg(data.message + (data.detail ? ` (${data.detail})` : ''));
        } else {
          // Confirm reset
          const res = await fetch('http://localhost:8000/api/v1/auth/password-reset-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, new_password: newPassword })
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Erro ao redefinir senha');
          }
          setSuccessMsg('Senha redefinida com sucesso! Você já pode fazer login.');
          setIsReset(false);
          setPassword('');
        }
      } else if (isRegister) {
        const data = await api.register(name, email, password, phone);
        onLoginSuccess(data.user);
      } else {
        const data = await api.login(email, password);
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 p-8">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Luggage className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Travel Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isReset
              ? 'Recuperação de Acesso'
              : isRegister
              ? 'Crie a conta para sua família'
              : 'Acesse o planejamento de suas viagens'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Silva"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefone (opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {!isReset && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsReset(true);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {isReset && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Token de Recuperação (recebido por e-mail ou gerado no teste)
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Cole aqui o token de validação"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {resetToken && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha segura"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Processando...'
                : isReset
                ? resetToken
                  ? 'Salvar Nova Senha'
                  : 'Enviar Instruções'
                : isRegister
                ? 'Criar Conta Familiar'
                : 'Entrar no Sistema'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isReset ? (
            <button
              onClick={() => {
                setIsReset(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Voltar para o login
            </button>
          ) : isRegister ? (
            <p>
              Já possui cadastro?{' '}
              <button
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Faça login
              </button>
            </p>
          ) : (
            <p>
              Ainda não tem conta?{' '}
              <button
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Cadastre sua família
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

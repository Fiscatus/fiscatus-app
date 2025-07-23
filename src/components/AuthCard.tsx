import React, { useState } from 'react';
import logoUrl from '../assets/react.svg';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string) {
  return EMAIL_REGEX.test(email);
}

export default function AuthCard() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '', agree: false });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  function handleTabChange(newTab: 'login' | 'register') {
    setTab(newTab);
    setErrors({});
  }

  function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  }

  function handleRegisterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setRegisterData({ ...registerData, [name]: type === 'checkbox' ? checked : value });
  }

  function validateLogin() {
    const errs: any = {};
    if (!loginData.email) errs.email = 'Preencha este campo.';
    else if (!validateEmail(loginData.email)) errs.email = 'E-mail inválido.';
    if (!loginData.password) errs.password = 'Preencha este campo.';
    return errs;
  }

  function validateRegister() {
    const errs: any = {};
    if (!registerData.name) errs.name = 'Preencha este campo.';
    if (!registerData.email) errs.email = 'Preencha este campo.';
    else if (!validateEmail(registerData.email)) errs.email = 'E-mail inválido.';
    if (!registerData.password) errs.password = 'Preencha este campo.';
    if (!registerData.confirmPassword) errs.confirmPassword = 'Preencha este campo.';
    if (registerData.password && registerData.confirmPassword && registerData.password !== registerData.confirmPassword) errs.confirmPassword = 'As senhas não coincidem.';
    if (!registerData.agree) errs.agree = 'Você precisa aceitar a Política de Privacidade.';
    return errs;
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateLogin();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      // TODO: Integrar com API de login (POST /api/auth/login)
      await new Promise((res) => setTimeout(res, 1200));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateRegister();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      // TODO: Integrar com API de cadastro (POST /api/auth/register)
      await new Promise((res) => setTimeout(res, 1200));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-2 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center border border-gray-100">
        <div className="bg-violet-100 rounded-full p-3 mb-5 flex items-center justify-center shadow-sm">
          <img src={logoUrl} alt="Logo" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1 text-center tracking-tight">Fiscatus</h1>
        <p className="text-gray-500 text-base mb-7 text-center font-medium">Sistema de gestão de contratos para administração pública</p>
        <div className="flex w-full mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <button
            className={`flex-1 py-2 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus:z-10 ${tab === 'login' ? 'bg-white text-violet-700 border-b-2 border-violet-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => handleTabChange('login')}
            type="button"
            tabIndex={0}
          >
            Entrar
          </button>
          <button
            className={`flex-1 py-2 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus:z-10 ${tab === 'register' ? 'bg-white text-violet-700 border-b-2 border-violet-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => handleTabChange('register')}
            type="button"
            tabIndex={0}
          >
            Criar Conta
          </button>
        </div>
        {tab === 'login' ? (
          <form className="w-full" onSubmit={handleLoginSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-colors placeholder-gray-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="seu.email@exemplo.com"
                value={loginData.email}
                onChange={handleLoginChange}
                disabled={loading}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-colors placeholder-gray-400 ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="********"
                value={loginData.password}
                onChange={handleLoginChange}
                disabled={loading}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className="w-full" onSubmit={handleRegisterSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-name">Nome completo</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-colors placeholder-gray-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Seu nome completo"
                value={registerData.name}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-email">E-mail</label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-colors placeholder-gray-400 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="seu.email@exemplo.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-password">Criar senha</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-colors placeholder-gray-400 ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="********"
                value={registerData.password}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="register-confirm-password">Confirmar senha</label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-colors placeholder-gray-400 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="********"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-center mb-4">
              <input
                id="register-agree"
                name="agree"
                type="checkbox"
                className={`h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-2 focus:ring-violet-400 transition-colors ${errors.agree ? 'border-red-400' : ''}`}
                checked={registerData.agree}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              <label htmlFor="register-agree" className="ml-2 block text-sm text-gray-700 select-none">
                Li e concordo com a <a href="#" className="underline text-violet-600 hover:text-violet-800">Política de Privacidade</a>
              </label>
            </div>
            {errors.agree && <p className="text-xs text-red-500 mb-2">{errors.agree}</p>}
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              disabled={loading || !registerData.agree}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 
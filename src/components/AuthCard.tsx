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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-white px-2 py-8">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl px-8 py-10 sm:px-12 sm:py-12 flex flex-col items-center border border-violet-100 transition-all duration-300">
        <div className="bg-violet-100 rounded-full p-4 mb-7 flex items-center justify-center shadow-md animate-fade-in">
          <img src={logoUrl} alt="Logo" className="w-14 h-14 drop-shadow-md" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 text-center tracking-tight font-sans">Fiscatus</h1>
        <p className="text-gray-500 text-lg mb-8 text-center font-medium">Sistema de gestão de contratos para administração pública</p>
        <div className="flex w-full mb-8 rounded-xl overflow-hidden border border-violet-100 bg-violet-50">
          <button
            className={`flex-1 py-3 text-lg font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus:z-10 ${tab === 'login' ? 'bg-white text-violet-700 border-b-4 border-violet-600 shadow-md' : 'text-gray-500 hover:bg-violet-100'}`}
            onClick={() => handleTabChange('login')}
            type="button"
            tabIndex={0}
          >
            Entrar
          </button>
          <button
            className={`flex-1 py-3 text-lg font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus:z-10 ${tab === 'register' ? 'bg-white text-violet-700 border-b-4 border-violet-600 shadow-md' : 'text-gray-500 hover:bg-violet-100'}`}
            onClick={() => handleTabChange('register')}
            type="button"
            tabIndex={0}
          >
            Criar Conta
          </button>
        </div>
        {tab === 'login' ? (
          <form className="w-full animate-fade-in" onSubmit={handleLoginSubmit} noValidate>
            <div className="mb-5">
              <label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all duration-200 placeholder-gray-400 bg-white/80 ${errors.email ? 'border-red-400' : 'border-violet-200'}`}
                placeholder="seu.email@exemplo.com"
                value={loginData.email}
                onChange={handleLoginChange}
                disabled={loading}
              />
              {errors.email && <p className="text-xs text-red-500 mt-2 font-medium">{errors.email}</p>}
            </div>
            <div className="mb-7">
              <label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all duration-200 placeholder-gray-400 bg-white/80 ${errors.password ? 'border-red-400' : 'border-violet-200'}`}
                placeholder="********"
                value={loginData.password}
                onChange={handleLoginChange}
                disabled={loading}
              />
              {errors.password && <p className="text-xs text-red-500 mt-2 font-medium">{errors.password}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <span className="loader border-white border-2 border-t-violet-200 mr-2"></span>}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className="w-full animate-fade-in" onSubmit={handleRegisterSubmit} noValidate>
            <div className="mb-5">
              <label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="register-name">Nome completo</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all duration-200 placeholder-gray-400 bg-white/80 ${errors.name ? 'border-red-400' : 'border-violet-200'}`}
                placeholder="Seu nome completo"
                value={registerData.name}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.name && <p className="text-xs text-red-500 mt-2 font-medium">{errors.name}</p>}
            </div>
            <div className="mb-5">
              <label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="register-email">E-mail</label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all duration-200 placeholder-gray-400 bg-white/80 ${errors.email ? 'border-red-400' : 'border-violet-200'}`}
                placeholder="seu.email@exemplo.com"
                value={registerData.email}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.email && <p className="text-xs text-red-500 mt-2 font-medium">{errors.email}</p>}
            </div>
            <div className="mb-5">
              <label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="register-password">Criar senha</label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all duration-200 placeholder-gray-400 bg-white/80 ${errors.password ? 'border-red-400' : 'border-violet-200'}`}
                placeholder="********"
                value={registerData.password}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.password && <p className="text-xs text-red-500 mt-2 font-medium">{errors.password}</p>}
            </div>
            <div className="mb-5">
              <label className="block text-base font-semibold text-gray-700 mb-2" htmlFor="register-confirm-password">Confirmar senha</label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-500 transition-all duration-200 placeholder-gray-400 bg-white/80 ${errors.confirmPassword ? 'border-red-400' : 'border-violet-200'}`}
                placeholder="********"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-2 font-medium">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-center mb-5">
              <input
                id="register-agree"
                name="agree"
                type="checkbox"
                className={`h-5 w-5 text-violet-600 border-gray-300 rounded focus:ring-2 focus:ring-violet-400 transition-all duration-200 ${errors.agree ? 'border-red-400' : ''}`}
                checked={registerData.agree}
                onChange={handleRegisterChange}
                disabled={loading}
              />
              <label htmlFor="register-agree" className="ml-3 block text-base text-gray-700 select-none">
                Li e concordo com a <a href="#" className="underline text-violet-600 hover:text-violet-800">Política de Privacidade</a>
              </label>
            </div>
            {errors.agree && <p className="text-xs text-red-500 mb-3 font-medium">{errors.agree}</p>}
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 flex items-center justify-center gap-2"
              disabled={loading || !registerData.agree}
            >
              {loading && <span className="loader border-white border-2 border-t-violet-200 mr-2"></span>}
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
      {/* Loader CSS */}
      <style>{`
        .loader {
          border-radius: 9999px;
          width: 1.25rem;
          height: 1.25rem;
          border-width: 2px;
          border-style: solid;
          border-color: #fff #fff #a78bfa #fff;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 
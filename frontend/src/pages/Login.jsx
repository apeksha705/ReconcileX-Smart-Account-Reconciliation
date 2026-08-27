import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';

function deriveUserFromEmail(emailInput, customName) {
  const cleanEmail = emailInput.trim().toLowerCase();
  
  if (customName && customName.trim()) {
    const name = customName.trim();
    const domain = (cleanEmail.split('@')[1] || 'workspace.com').split('.')[0];
    const company = domain.charAt(0).toUpperCase() + domain.slice(1) + (domain === 'apexretail' ? ' Retail & Logistics Pvt Ltd' : ' Pvt Ltd');
    return {
      name,
      email: cleanEmail,
      role: 'Head of Finance',
      business: company,
      gstin: '27AAACA' + Math.floor(1000 + Math.random() * 9000) + 'B1ZX'
    };
  }

  const localPart = cleanEmail.split('@')[0] || 'User';
  const domainPart = (cleanEmail.split('@')[1] || 'workspace.com').split('.')[0];

  // Convert email prefix like "rahul.sharma" -> "Rahul Sharma", "alex" -> "Alex"
  const formattedName = localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Finance User';

  const formattedCompany = domainPart.charAt(0).toUpperCase() + domainPart.slice(1) + (domainPart === 'apexretail' ? ' Retail & Logistics Pvt Ltd' : ' Pvt Ltd');

  return {
    name: formattedName,
    email: cleanEmail,
    role: 'Head of Finance',
    business: formattedCompany,
    gstin: '27AAACA' + Math.floor(1000 + Math.random() * 9000) + 'B1ZX'
  };
}

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your work email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const user = deriveUserFromEmail(email, fullName);

      try {
        localStorage.setItem('reconcilex_auth_user', JSON.stringify(user));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      setLoading(false);
      navigate('/dashboard', { replace: true });
    }, 350);
  };

  const detectedUser = email.includes('@') ? deriveUserFromEmail(email, fullName) : null;

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Luxury Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0B3C2C] to-[#134E39] border border-[#1E6B50] flex items-center justify-center text-[#D4E2D4] shadow-xl shadow-[#0B3C2C]/40">
            <ShieldCheck className="w-8 h-8 text-[#D4E2D4]" />
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-black text-[#FAF9F6] tracking-wider">RECONCILE</span>
            <span className="text-2xl font-black text-[#D4E2D4]">X</span>
          </div>
          <p className="mt-1 text-xs text-[#A3A3A3] font-medium tracking-wide">
            Smart Account Reconciliation
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#FAF9F6] py-8 px-6 sm:px-10 border border-[#E2DFD4] rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#FDEBE8] border border-[#F2C0B8] text-xs font-semibold text-[#9E3626]">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DBD7CB] rounded-xl text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Optional Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Full Name <span className="text-[#8C8C8C] font-normal normal-case">(Optional)</span>
                </label>
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={detectedUser ? detectedUser.name : "e.g. John Doe"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DBD7CB] rounded-xl text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions sent to email.');
                  }}
                  className="text-xs text-[#0B3C2C] font-bold hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DBD7CB] rounded-xl text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] transition-all font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A7A] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Dynamic User Profile Preview */}
            {detectedUser && (
              <div className="p-3 rounded-xl bg-[#EBF2EB] border border-[#B8CEB8] text-[11px] text-[#0B3C2C] space-y-0.5 animate-in fade-in duration-150">
                <p className="font-bold">
                  Signing in as: <span className="underline">{detectedUser.name}</span>
                </p>
                <p className="text-[#4A554A] font-medium">
                  Workspace: {detectedUser.business} ({detectedUser.role})
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B3C2C] focus:ring-[#0B3C2C] accent-[#0B3C2C] cursor-pointer"
                />
                <span className="text-xs text-[#4A554A] font-medium">Remember this device</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0B3C2C] hover:bg-[#134E39] text-[#FAF9F6] font-bold text-sm rounded-xl shadow-md shadow-[#0B3C2C]/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Security / Compliance Footnote */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-[#A3A3A3]">
          <span className="flex items-center gap-1 text-[#D4E2D4]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4E2D4]" />
            256-Bit Bank TLS
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#A3A3A3]">
            <Building2 className="w-3.5 h-3.5 text-[#8C8C8C]" />
            GSTIN & RBI Compliant
          </span>
        </div>
      </div>
    </div>
  );
}

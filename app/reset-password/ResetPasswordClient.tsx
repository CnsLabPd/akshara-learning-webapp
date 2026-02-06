'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Icons for the visual style
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="#5D4037">
    {open ? (
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    ) : (
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.45-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4.01.7l2.16 2.16C10.5 7.17 11.24 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
    )}
  </svg>
);

export default function ResetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');

    if (!email.trim() || !code.trim() || !newPassword) {
      return setErr('Email, code, and new password are required');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setMsg('Password reset successful. You can sign in now.');
      router.push(`/login?email=${encodeURIComponent(email.trim())}`);
    } catch (e: any) {
      setErr(e?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; }
      `}</style>

      {/* Main Background - Jungle/Sky gradient */}
      <main className="min-h-screen bg-gradient-to-b from-[#B4AEE8] via-[#F4D9F0] to-[#A8D5BA] flex items-center justify-center p-4 relative overflow-hidden">

        {/* Decorative Leaf Elements */}
        <div className="absolute top-0 left-0 text-9xl select-none opacity-80 -translate-x-10 -translate-y-10 rotate-45">🌿</div>
        <div className="absolute top-0 right-0 text-9xl select-none opacity-80 translate-x-10 -translate-y-10 -rotate-45">🌿</div>
        <div className="absolute bottom-0 left-0 text-9xl select-none opacity-80 -translate-x-10 translate-y-10 -rotate-45">🌿</div>
        <div className="absolute bottom-0 right-0 text-9xl select-none opacity-80 translate-x-10 translate-y-10 rotate-45">🌿</div>

        {/* Card Container */}
        <div className="relative w-full max-w-md mt-12">

          {/* Mascot / Monkey Placeholder */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-20 w-40 h-32 flex items-end justify-center">
            <div className="relative w-32 h-32">
              <span className="text-[100px] absolute top-2 left-2 drop-shadow-xl">🐵</span>
            </div>
          </div>

          {/* The Parchment Card */}
          <div className="bg-[#FFF9F0] rounded-[2.5rem] p-8 pt-12 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_0_8px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] relative z-10">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🔐</div>
              <h1 className="text-3xl font-extrabold text-[#9C3877] drop-shadow-sm mb-1 tracking-tight">Reset Password</h1>
              <p className="text-[#8D6E63] font-bold text-base">Enter the code sent to your email</p>
            </div>

            <form onSubmit={onReset} className="space-y-4">

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all"
                  disabled={loading}
                  required
                />
              </div>

              {/* Reset Code Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <KeyIcon />
                </div>
                <input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all text-center text-xl tracking-[0.3em] font-mono"
                  maxLength={6}
                  disabled={loading}
                  required
                />
              </div>

              {/* New Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Success Message */}
              {msg && (
                <div className="bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span>✅</span> {msg}
                </div>
              )}

              {/* Error Message */}
              {err && (
                <div className="bg-[#FFE5E5] border border-[#FFBDBD] text-[#D32F2F] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
                  <span>⚠️</span> {err}
                </div>
              )}

              {/* Submit Button - 3D Effect */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#9C27B0] via-[#E91E63] to-[#FF9800] text-white font-extrabold text-xl py-4 rounded-full shadow-[0_6px_0_rgb(123,31,162)] active:shadow-none active:translate-y-1.5 transition-all hover:brightness-110 mt-4 border-b-2 border-white/20 disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Footer */}
              <div className="text-center pt-2">
                <Link href="/login" className="text-[#8E24AA] underline decoration-2 underline-offset-2 hover:text-[#BA68C8] font-bold">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

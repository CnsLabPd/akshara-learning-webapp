'use client';

import { useState, useEffect } from 'react';
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

function ConfirmEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    // Prefill email from query param
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 6 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setResendMessage('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!code || code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccessMessage('Email verified successfully! Redirecting to login...');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMessage('');
    setResendMessage('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      setResendMessage('A new verification code has been sent to your email!');
      setCode(''); // Clear the code field
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

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
              <div className="text-6xl mb-3">📧</div>
              <h1 className="text-3xl font-extrabold text-[#9C3877] drop-shadow-sm mb-1 tracking-tight">Verify Your Email</h1>
              <p className="text-[#8D6E63] font-bold text-base">We&apos;ve sent a 6-digit code to your email</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">

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
                  disabled={isVerifying}
                  required
                />
              </div>

              {/* Verification Code Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <KeyIcon />
                </div>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  disabled={isVerifying}
                  required
                />
              </div>
              <p className="text-xs text-[#8D6E63] text-center font-semibold -mt-2">Enter the 6-digit code sent to your email</p>

              {/* Success Message */}
              {successMessage && (
                <div className="bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span>✅</span> {successMessage}
                </div>
              )}

              {/* Resend Message */}
              {resendMessage && (
                <div className="bg-[#E3F2FD] border border-[#90CAF9] text-[#1565C0] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span>ℹ️</span> {resendMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-[#FFE5E5] border border-[#FFBDBD] text-[#D32F2F] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Verify Button - 3D Effect */}
              <button
                type="submit"
                disabled={isVerifying || !!successMessage}
                className="w-full bg-gradient-to-r from-[#9C27B0] via-[#E91E63] to-[#FF9800] text-white font-extrabold text-xl py-4 rounded-full shadow-[0_6px_0_rgb(123,31,162)] active:shadow-none active:translate-y-1.5 transition-all hover:brightness-110 mt-4 border-b-2 border-white/20 disabled:opacity-70"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>

              {/* Resend Button */}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || isVerifying || !!successMessage}
                className="w-full bg-[#FFF0D9] border-2 border-[#EBD6B5] text-[#8D6E63] font-bold py-3 rounded-full hover:bg-[#FFE4C4] transition-all disabled:opacity-50"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#8D6E63] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Resending...
                  </div>
                ) : (
                  'Resend Code'
                )}
              </button>

              {/* Footer Links */}
              <div className="text-center pt-2 space-y-2">
                <p className="text-[#8D6E63] font-bold text-sm">
                  Already verified?{' '}
                  <Link href="/login" className="text-[#8E24AA] underline decoration-2 underline-offset-2 hover:text-[#BA68C8]">
                    Sign in
                  </Link>
                </p>
                <Link href="/" className="inline-flex items-center text-[#8D6E63] hover:text-[#5D4037] text-sm font-bold">
                  ← Back to Home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ConfirmEmailClient() {
  return <ConfirmEmailInner />;
}

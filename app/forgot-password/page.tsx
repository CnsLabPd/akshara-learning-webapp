"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Icons for the visual style
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSendCode(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!email.trim()) return setErr("Email is required");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send reset code");

      setMsg("Reset code sent. Please check your email.");
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to send reset code");
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
              <div className="text-6xl mb-3">🔑</div>
              <h1 className="text-3xl font-extrabold text-[#9C3877] drop-shadow-sm mb-1 tracking-tight">Forgot Password</h1>
              <p className="text-[#8D6E63] font-bold text-base">We&apos;ll send a reset code to your email</p>
            </div>

            <form onSubmit={onSendCode} className="space-y-4">

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all"
                  disabled={loading}
                  required
                />
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
                    Sending...
                  </div>
                ) : (
                  'Send Reset Code'
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

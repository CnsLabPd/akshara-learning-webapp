"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h1>
        <p className="text-gray-600 text-center mb-6">We’ll send a reset code to your email.</p>

        <form onSubmit={onSendCode} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 font-semibold"
              placeholder="Enter your registered email"
              required
            />
          </div>

          {msg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {msg}
            </div>
          )}
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-purple-600 hover:text-purple-800 font-semibold">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

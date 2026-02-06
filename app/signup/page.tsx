// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Importing icons for the visual style
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
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

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 chars long";
    if (!/[A-Z]/.test(pwd)) return "Must contain an uppercase letter";
    if (!/[0-9]/.test(pwd)) return "Must contain a number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) return setError("Full name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password) return setError("Password is required");

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);

    if (password !== confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Signup failed");
      }

      // Redirect to confirm email page
      router.push(`/confirm-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&display=swap');
        body { font-family: 'Nunito', sans-serif; }
      `}</style>

      {/* Main Background - Simulating the Jungle/Sky gradient */}
      <main className="min-h-screen bg-gradient-to-b from-[#B4AEE8] via-[#F4D9F0] to-[#A8D5BA] flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Decorative Leaf Elements (CSS representations) */}
        <div className="absolute top-0 left-0 text-9xl select-none opacity-80 -translate-x-10 -translate-y-10 rotate-45">🌿</div>
        <div className="absolute top-0 right-0 text-9xl select-none opacity-80 translate-x-10 -translate-y-10 -rotate-45">🌿</div>
        <div className="absolute bottom-0 left-0 text-9xl select-none opacity-80 -translate-x-10 translate-y-10 -rotate-45">🌿</div>
        <div className="absolute bottom-0 right-0 text-9xl select-none opacity-80 translate-x-10 translate-y-10 rotate-45">🌿</div>

        {/* Card Container */}
        <div className="relative w-full max-w-md mt-12">
          
          {/* Mascot / Monkey Placeholder - Positioned on top */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-20 w-40 h-32 flex items-end justify-center">
            {/* REPLACE THIS IMG WITH YOUR MONKEY IMAGE */}
            <div className="relative w-32 h-32">
                {/* Fallback emoji/div if image is missing */}
                <span className="text-[100px] absolute top-2 left-2 drop-shadow-xl">🐵</span>
            </div>
          </div>

          {/* The Parchment Card */}
          <div className="bg-[#FFF9F0] rounded-[2.5rem] p-8 pt-12 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_0_8px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] relative z-10">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-[#9C3877] drop-shadow-sm mb-1 tracking-tight">Create Account</h1>
              <p className="text-[#8D6E63] font-bold text-lg">Sign up to start learning</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <UserIcon />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all"
                  disabled={isLoading}
                />
              </div>

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
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D6E63]">
                  <LockIcon />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] placeholder-[#ACA199] font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#C490E4] focus:bg-white transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-[#FFE5E5] border border-[#FFBDBD] text-[#D32F2F] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Submit Button - 3D Effect */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#9C27B0] via-[#E91E63] to-[#FF9800] text-white font-extrabold text-xl py-4 rounded-full shadow-[0_6px_0_rgb(123,31,162)] active:shadow-none active:translate-y-1.5 transition-all hover:brightness-110 mt-4 border-b-2 border-white/20"
              >
                {isLoading ? "Creating..." : "Sign Up"}
              </button>

              {/* Footer */}
              <div className="text-center pt-2">
                <p className="text-[#8D6E63] font-bold">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#8E24AA] underline decoration-2 underline-offset-2 hover:text-[#BA68C8]">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default SignupPage;
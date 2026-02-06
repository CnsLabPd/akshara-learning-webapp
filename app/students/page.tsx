// app/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  userSub: string;
  email: string;
  fullName: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface ProgressData {
  totalLessons: number;
  completedLessons: number;
  practiceScore: number;
  testScore: number;
  lastActivity: string;
}

// Animated Stat Card
function StatCard({
  value,
  label,
  color,
  icon,
}: {
  value: string | number;
  label: string;
  color: string;
  icon: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-400 to-purple-600',
    pink: 'from-pink-400 to-pink-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 text-center text-white shadow-lg transform hover:scale-105 transition-all duration-300 cursor-default`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-extrabold drop-shadow-md">{value}</div>
      <div className="text-sm font-bold opacity-90 mt-1">{label}</div>
    </div>
  );
}

// Action Card Component
function ActionCard({
  href,
  icon,
  title,
  subtitle,
  gradient,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <Link href={href} className="block group">
      <div
        className={`${gradient} rounded-3xl p-8 text-center text-white shadow-xl transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300 border-4 border-white/30 relative overflow-hidden`}
      >
        <div className="text-6xl mb-4">{icon}</div>
        <div className="font-extrabold text-2xl mb-2 drop-shadow-md">{title}</div>
        <div className="text-base opacity-90 font-semibold">{subtitle}</div>
      </div>
    </Link>
  );
}

export default function StudentsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("aksharaUser");

    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProgress(parsedUser.userSub);
    } catch {
      localStorage.removeItem("aksharaUser");
      router.push("/login");
    }
  }, [router]);

  const fetchProgress = async (userSub: string) => {
    try {
      const response = await fetch(`/api/auth/profile?userSub=${userSub}`);

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress || {
          totalLessons: 26,
          completedLessons: 0,
          practiceScore: 0,
          testScore: 0,
          lastActivity: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("aksharaUser");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#B4AEE8] via-[#F4D9F0] to-[#A8D5BA] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Leaves */}
        <div className="absolute top-0 left-0 text-9xl select-none opacity-80 -translate-x-10 -translate-y-10 rotate-45">🌿</div>
        <div className="absolute top-0 right-0 text-9xl select-none opacity-80 translate-x-10 -translate-y-10 -rotate-45">🌿</div>
        <div className="absolute bottom-0 left-0 text-9xl select-none opacity-80 -translate-x-10 translate-y-10 -rotate-45">🌿</div>
        <div className="absolute bottom-0 right-0 text-9xl select-none opacity-80 translate-x-10 translate-y-10 rotate-45">🌿</div>

        <div className="relative">
          <div className="text-center mb-4">
            <span className="text-8xl drop-shadow-xl animate-bounce">🐵</span>
          </div>
          <div className="bg-[#FFF9F0] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_0_8px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA]">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 border-4 border-[#9C27B0] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#8D6E63] font-bold text-xl">Loading your jungle...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const progressPercentage = progress
    ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#B4AEE8] via-[#F4D9F0] to-[#A8D5BA] p-4 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="fixed top-20 left-10 text-3xl animate-bounce z-0 opacity-60">🦋</div>
      <div className="fixed top-40 right-16 text-3xl animate-bounce z-0 opacity-60" style={{ animationDelay: '0.5s' }}>🦋</div>
      <div className="fixed bottom-32 left-20 text-3xl animate-bounce z-0 opacity-60" style={{ animationDelay: '1s' }}>🦋</div>

      {/* Floating Leaves */}
      <div className="fixed top-1/4 left-5 text-4xl animate-pulse opacity-50">🍃</div>
      <div className="fixed top-1/3 right-8 text-4xl animate-pulse opacity-50" style={{ animationDelay: '0.7s' }}>🌿</div>
      <div className="fixed bottom-1/4 left-12 text-4xl animate-pulse opacity-50" style={{ animationDelay: '1.2s' }}>🌱</div>
      <div className="fixed bottom-1/3 right-10 text-4xl animate-pulse opacity-50" style={{ animationDelay: '0.3s' }}>🍃</div>

      {/* Sparkles */}
      <div className="fixed top-16 left-1/4 text-yellow-300 text-xl animate-ping opacity-40">✦</div>
      <div className="fixed top-24 right-1/3 text-yellow-300 text-lg animate-ping opacity-40" style={{ animationDelay: '0.5s' }}>✦</div>
      <div className="fixed top-32 left-1/2 text-yellow-300 text-xl animate-ping opacity-40" style={{ animationDelay: '1s' }}>✦</div>

      {/* Corner Leaves */}
      <div className="fixed top-0 left-0 text-8xl select-none opacity-70 -translate-x-6 -translate-y-6 rotate-45 z-0">🌿</div>
      <div className="fixed top-0 right-0 text-8xl select-none opacity-70 translate-x-6 -translate-y-6 -rotate-45 z-0">🌿</div>
      <div className="fixed bottom-0 left-0 text-8xl select-none opacity-70 -translate-x-6 translate-y-6 -rotate-45 z-0">🌿</div>
      <div className="fixed bottom-0 right-0 text-8xl select-none opacity-70 translate-x-6 translate-y-6 rotate-45 z-0">🌿</div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header Card */}
        <div className="mb-8">
          <div className="bg-[#FFF9F0] rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#9C3877] drop-shadow-sm">
                  Hello, {user.fullName}! 👋
                </h1>
                <p className="text-[#8D6E63] font-bold text-lg flex items-center gap-2">
                  <span>📧</span> {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-extrabold py-3 px-6 rounded-full shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>🚪</span>
                {isLoggingOut ? "Leaving..." : "Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-[#FFF9F0] rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] mb-8">
          <h2 className="text-2xl font-extrabold text-[#9C3877] mb-6 flex items-center gap-2">
            <span className="text-3xl">📊</span> Your Progress
          </h2>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#8D6E63] font-bold text-lg">Overall Progress</span>
              <span className="text-[#9C3877] font-extrabold text-xl">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#EBD6B5] rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-[#9C27B0] via-[#E91E63] to-[#FF9800] h-6 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              value={progress?.completedLessons || 0}
              label="Lessons Done"
              color="purple"
              icon="📚"
            />
            <StatCard
              value={progress?.totalLessons || 26}
              label="Total Lessons"
              color="pink"
              icon="🎯"
            />
            <StatCard
              value={`${progress?.practiceScore || 0}%`}
              label="Practice Score"
              color="blue"
              icon="✏️"
            />
            <StatCard
              value={`${progress?.testScore || 0}%`}
              label="Test Score"
              color="green"
              icon="🏆"
            />
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[#FFF9F0] rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] mb-8">
          <h2 className="text-2xl font-extrabold text-[#9C3877] mb-6 flex items-center gap-2">
            <span className="text-3xl">🚀</span> Continue Learning
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              href="/choose-language?section=writing"
              icon="✍️"
              title="Writing"
              subtitle="Learn to write letters"
              gradient="bg-gradient-to-br from-[#9C27B0] via-[#AB47BC] to-[#7B1FA2]"
            />
            <ActionCard
              href="/choose-language?section=reading"
              icon="📖"
              title="Reading"
              subtitle="Learn to read letters"
              gradient="bg-gradient-to-br from-[#E91E63] via-[#EC407A] to-[#C2185B]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-[#5D4037] font-bold opacity-70">
            Made with ❤️ for young learners
          </p>
        </div>
      </div>
    </main>
  );
}

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

export default function StudentsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("aksharaUser");

    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Fetch user progress
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
      // Clear local storage
      localStorage.removeItem("aksharaUser");

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {user.fullName}!
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {progress?.completedLessons || 0}
              </div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-pink-600">
                {progress?.totalLessons || 26}
              </div>
              <div className="text-sm text-gray-600">Total Lessons</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {progress?.practiceScore || 0}%
              </div>
              <div className="text-sm text-gray-600">Practice Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {progress?.testScore || 0}%
              </div>
              <div className="text-sm text-gray-600">Test Score</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Continue Learning</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/choose-language?section=writing"
              className="block bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-6 text-center transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-2">✍️</div>
              <div className="font-bold text-lg">Practice Writing</div>
              <div className="text-sm opacity-90">Learn to write letters</div>
            </Link>

            <Link
              href="/choose-language?section=reading"
              className="block bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg p-6 text-center transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-2">📖</div>
              <div className="font-bold text-lg">Practice Reading</div>
              <div className="text-sm opacity-90">Learn to read letters</div>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-gray-100 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[100svh] w-full relative overflow-hidden bg-[#0f2a44]">
      {/* Background layer 2: main image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/homepage-bg_test.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'top', // ✅ better for mobile tall screens
          backgroundRepeat: 'no-repeat',
          maskImage:
            'linear-gradient(to top, rgba(165, 226, 23, 0) 0%, rgb(13, 207, 233) 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, rgba(155, 202, 27, 0) 0%, rgb(18, 226, 192) 100%)',
        }}
      />

      {/* Optional very light dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10 z-[5] pointer-events-none" />

      {/* Neurogati Logo - Top Left */}
      <div className="absolute top-3 left-3 md:top-6 md:left-6 z-50">
        <div className="bg-black/80 rounded-xl px-3 py-2 md:px-4 md:py-2 flex items-center gap-2 md:gap-3 backdrop-blur-sm">
          <img
            src="/neurogati.png"
            alt="Neurogati"
            className="w-9 h-9 md:w-12 md:h-12"
          />
          <span className="text-white font-extrabold text-sm md:text-xl">
            Neurogati
          </span>
        </div>
      </div>

      {/* LET'S LEARN BUTTON */}
      {/* ✅ Mobile: bottom. Desktop: moved down so it NEVER overlaps "Akshara" title */}
      <div className="absolute inset-x-0 bottom-10 sm:bottom-12 md:top-[30%] lg:top-[32%] md:bottom-auto flex justify-center px-4 z-40">
        <Link href="/signup" className="w-full max-w-[520px] flex justify-center">
          <button className="lets-learn-btn w-full">
            <span className="btn-text">Read Right! Write Right!</span>
            <span className="btn-sparkle">✨</span>
          </button>
        </Link>
      </div>

      <style jsx>{`
        .lets-learn-btn {
          position: relative;
          width: 100%;
          max-width: 520px; /* ✅ prevents huge pill on wide screens */
          background: linear-gradient(
            135deg,
            #ff6b6b 0%,
            #ff8e53 30%,
            #ff69b4 70%,
            #a855f7 100%
          );
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          color: white;
          font-weight: 800;
          padding: 1.1rem 2.2rem;
          border-radius: 9999px;
          font-size: 1.7rem;
          box-shadow: 0 10px 40px rgba(255, 105, 180, 0.5),
            0 0 0 5px rgba(255, 255, 255, 0.7),
            inset 0 -4px 0 rgba(0, 0, 0, 0.15);
          transition: all 0.25s ease;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
        }

        /* ✅ Keep text on one line for most screens */
        .btn-text {
          white-space: nowrap;
        }

        .btn-sparkle {
          animation: sparkleRotate 2s linear infinite;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        @keyframes sparkleRotate {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.3);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .lets-learn-btn:hover {
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 20px 50px rgba(255, 105, 180, 0.6),
            0 0 0 7px rgba(255, 255, 255, 0.9),
            0 0 40px rgba(255, 105, 180, 0.5),
            inset 0 -4px 0 rgba(0, 0, 0, 0.15);
        }

        .lets-learn-btn:active {
          transform: scale(1.03) translateY(-1px);
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* ✅ Mobile tuning */
        @media (max-width: 768px) {
          .lets-learn-btn {
            padding: 0.95rem 1.2rem;
            font-size: 1.25rem;
          }
          /* ✅ Allow wrap only if needed on very small screens */
          .btn-text {
            white-space: normal;
            line-height: 1.15;
          }
        }
      `}</style>
    </main>
  );
}

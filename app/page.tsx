'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[100svh] w-full relative overflow-hidden bg-[#0f2a44]">
      {/* Background layer 2: main image */}
      <div
        className="homepage-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/homepage-bg_test.png')",
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
      <div className="logo-wrap absolute z-50">
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
      <div className="cta-wrap absolute inset-x-0 flex justify-center px-4 z-40">
        <Link href="/signup" className="w-full max-w-[520px] flex justify-center">
          <button className="lets-learn-btn w-full">
            <span className="btn-text">Read Right! Write Right!</span>
            <span className="btn-sparkle">✨</span>
          </button>
        </Link>
      </div>

      <style jsx>{`
        /* ===== Background handling ===== */

        /* Mobile FIRST: show full image, no cropping */
        .homepage-bg {
          background-size: contain;
          background-position: top center;
          background-color: #0f2a44; /* fills empty space */
        }

        /* Tablet & Desktop: fill screen nicely */
        @media (min-width: 768px) {
          .homepage-bg {
            background-size: cover;
            background-position: center;
          }
        }

        /* ===== Safe area support (iOS notch) ===== */
        .logo-wrap {
          top: calc(env(safe-area-inset-top, 0px) + 12px);
          left: calc(env(safe-area-inset-left, 0px) + 12px);
        }

        .cta-wrap {
          top: 32%;
          bottom: auto;
        }

        @media (min-width: 768px) {
          .logo-wrap {
            top: calc(env(safe-area-inset-top, 0px) + 24px);
            left: calc(env(safe-area-inset-left, 0px) + 24px);
          }
          .cta-wrap {
            top: 30%;
          }
        }

        @media (min-width: 1024px) {
          .cta-wrap {
            top: 32%;
          }
        }

        /* ===== Button styling (UNCHANGED) ===== */
        .lets-learn-btn {
          position: relative;
          width: 100%;
          max-width: 520px;
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

        .btn-text {
          white-space: nowrap;
        }

        .btn-sparkle {
          animation: sparkleRotate 2s linear infinite;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        @keyframes sparkleRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .lets-learn-btn:hover {
          transform: scale(1.06) translateY(-3px);
        }

        .lets-learn-btn:active {
          transform: scale(1.03) translateY(-1px);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 768px) {
          .lets-learn-btn {
            padding: 0.95rem 1.2rem;
            font-size: 1.25rem;
          }
          .btn-text {
            white-space: normal;
            line-height: 1.15;
          }
        }
      `}</style>
    </main>
  );
}

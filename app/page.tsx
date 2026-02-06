'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[100svh] w-full relative overflow-hidden bg-[#0f2a44]">

      {/* Background layer 1: blurred "cover" to fill the sides
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/homepage-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(18px)',
          transform: 'scale(1.08)',
          opacity: 0.85,
        }}
      /> */}

      {/* Background layer 2: main image (no cropping) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/homepage-bg_test.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to top, rgba(165, 226, 23, 0) 0%, rgb(13, 207, 233) 100%)', // Mask applied from bottom
    WebkitMaskImage: 'linear-gradient(to top, rgba(155, 202, 27, 0) 0%, rgb(18, 226, 192) 100%)', // For WebKit-based browsers like Safari
        }}
      />

      {/* Optional very light dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10 z-[5] pointer-events-none" />

      {/* Neurogati Logo - Top Left */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
        <div className="bg-black/80 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm">
          <img
            src="/neurogati.png"
            alt="Neurogati"
            className="w-10 h-10 md:w-12 md:h-12"
          />
          <span className="text-white font-extrabold text-base md:text-xl">
            Neurogati
          </span>
        </div>
      </div>

      {/* LET'S LEARN BUTTON */}
      <div className="absolute top-[76%] md:top-[22%] left-1/2 -translate-x-1/2 z-40">
        <Link href="/signup">
          <button className="lets-learn-btn">
            <span className="btn-text">Read Right! Write Right!</span>
            <span className="btn-sparkle">✨</span>
          </button>
        </Link>
      </div>

      <style jsx>{`
        .lets-learn-btn {
          position: relative;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 30%, #ff69b4 70%, #a855f7 100%);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          color: white;
          font-weight: bold;
          padding: 1.2rem 4rem;
          border-radius: 9999px;
          font-size: 1.8rem;
          box-shadow: 0 10px 40px rgba(255, 105, 180, 0.5),
            0 0 0 5px rgba(255, 255, 255, 0.7),
            inset 0 -4px 0 rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-sparkle {
          animation: sparkleRotate 2s linear infinite;
          font-size: 1.5rem;
        }

        @keyframes sparkleRotate {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .lets-learn-btn:hover {
          transform: scale(1.08) translateY(-4px);
          box-shadow: 0 20px 50px rgba(255, 105, 180, 0.6),
            0 0 0 7px rgba(255, 255, 255, 0.9),
            0 0 40px rgba(255, 105, 180, 0.5),
            inset 0 -4px 0 rgba(0, 0, 0, 0.15);
        }

        .lets-learn-btn:active {
          transform: scale(1.04) translateY(-2px);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 768px) {
          .lets-learn-btn {
            padding: 0.9rem 2.5rem;
            font-size: 1.3rem;
          }
        }
      `}</style>
    </main>
  );
}

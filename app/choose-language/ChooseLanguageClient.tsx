'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇮🇳', description: 'Learn English alphabets and pronunciation' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', description: 'Coming Soon!', disabled: true },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', description: 'Coming Soon!', disabled: true },
];

export default function ChooseLanguageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubsection, setSelectedSubsection] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [preSelectedSection, setPreSelectedSection] = useState<string>('');

  useEffect(() => {
    setIsVisible(true);

    const section = searchParams.get('section');
    const subsection = searchParams.get('subsection');
    const lang = searchParams.get('lang');

    if (lang) {
      setSelectedLanguage(lang);
    }
    if (section) {
      setSelectedSection(section);
      setPreSelectedSection(section);
    }
    if (subsection) {
      setSelectedSubsection(subsection);
    }
  }, [searchParams]);

  const getCurrentStep = () => {
    if (!selectedLanguage) return 0;
    if (!selectedSection) return 1;
    if (!selectedSubsection) return 2;
    return 3;
  };

  const steps = ['Language', 'Section', 'Subsection', 'Mode'];
  const currentStep = getCurrentStep();

  const getBackAction = () => {
    switch (currentStep) {
      case 0:
        if (preSelectedSection) return () => router.push('/students');
        return null;
      case 1:
        return () => setSelectedLanguage('');
      case 2:
        if (preSelectedSection) return () => setSelectedLanguage('');
        return () => setSelectedSection('');
      case 3:
        return () => setSelectedSubsection('');
      default:
        return null;
    }
  };

  const backAction = getBackAction();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#B4AEE8] via-[#F4D9F0] to-[#A8D5BA] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed top-20 left-10 text-3xl animate-bounce z-0 opacity-60">🦋</div>
      <div className="fixed top-40 right-16 text-3xl animate-bounce z-0 opacity-60" style={{ animationDelay: '0.5s' }}>🦋</div>
      <div className="fixed bottom-32 left-20 text-3xl animate-bounce z-0 opacity-60" style={{ animationDelay: '1s' }}>🦋</div>

      <div className="fixed top-1/4 left-5 text-4xl animate-pulse opacity-50">🍃</div>
      <div className="fixed top-1/3 right-8 text-4xl animate-pulse opacity-50" style={{ animationDelay: '0.7s' }}>🌿</div>
      <div className="fixed bottom-1/4 left-12 text-4xl animate-pulse opacity-50" style={{ animationDelay: '1.2s' }}>🌱</div>
      <div className="fixed bottom-1/3 right-10 text-4xl animate-pulse opacity-50" style={{ animationDelay: '0.3s' }}>🍃</div>

      <div className="fixed top-16 left-1/4 text-yellow-300 text-xl animate-ping opacity-40">✦</div>
      <div className="fixed top-24 right-1/3 text-yellow-300 text-lg animate-ping opacity-40" style={{ animationDelay: '0.5s' }}>✦</div>

      <div className="fixed top-0 left-0 text-8xl select-none opacity-70 -translate-x-6 -translate-y-6 rotate-45 z-0">🌿</div>
      <div className="fixed top-0 right-0 text-8xl select-none opacity-70 translate-x-6 -translate-y-6 -rotate-45 z-0">🌿</div>
      <div className="fixed bottom-0 left-0 text-8xl select-none opacity-70 -translate-x-6 translate-y-6 -rotate-45 z-0">🌿</div>
      <div className="fixed bottom-0 right-0 text-8xl select-none opacity-70 translate-x-6 translate-y-6 rotate-45 z-0">🌿</div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#9C27B0] via-[#AB47BC] to-[#7B1FA2] px-6 py-4 shadow-lg relative z-10">
        {/* Neurogati Logo */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/neurogati.png"
            alt="Neurogati"
            className="w-12 h-12 md:w-14 md:h-14 drop-shadow-lg"
          />
          <span className="text-white font-extrabold text-lg md:text-xl drop-shadow-md">
            Neurogati
          </span>
        </div>

        {/* Navigation Row */}
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <div className="w-24">
            {backAction && (
              <button
                onClick={backAction}
                className="px-4 py-2 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-all flex items-center gap-2 shadow-md"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Akshara Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            AksharA
          </h1>

          {/* Profile and Logout */}
          <div className="flex items-center gap-2">
            <Link href="/students">
              <button className="px-4 py-2 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-all flex items-center gap-2 shadow-md">
                <span>👤</span>
                <span className="hidden sm:inline">Profile</span>
              </button>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('aksharaUser');
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-md"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`max-w-6xl mx-auto px-6 py-6 transition-opacity duration-500 relative z-10 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-md ${
                index === currentStep
                  ? 'bg-gradient-to-r from-[#9C27B0] to-[#E91E63] text-white'
                  : index < currentStep
                  ? 'bg-[#FFF9F0] text-[#9C3877] border-2 border-[#EADDCA]'
                  : 'bg-white/50 text-[#8D6E63] border-2 border-white/50'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === currentStep
                    ? 'bg-white text-[#9C27B0]'
                    : index < currentStep
                    ? 'bg-[#9C27B0] text-white'
                    : 'bg-[#EBD6B5] text-[#8D6E63]'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-1 rounded-full ${index < currentStep ? 'bg-[#9C27B0]' : 'bg-white/50'}`} />
              )}
            </div>
          ))}
        </div>

        {!selectedLanguage ? (
          /* Language Selection */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#9C3877] mb-2 drop-shadow-sm">
                Choose Your Language
              </h1>
              <p className="text-lg font-bold text-[#8D6E63]">
                Select a language to start learning
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-8">
                <label className="block text-[#9C3877] font-extrabold text-xl mb-4 text-center">
                  🌍 Select Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => e.target.value && setSelectedLanguage(e.target.value)}
                  className="w-full p-4 bg-[#FFF0D9] border-2 border-[#EBD6B5] rounded-full text-[#5D4037] font-bold text-xl focus:border-[#C490E4] focus:outline-none focus:bg-white transition-all duration-300 cursor-pointer"
                >
                  <option value="">Choose a language...</option>
                  {LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.disabled ? '' : lang.code}
                      disabled={lang.disabled}
                    >
                      {lang.flag} {lang.name} {lang.disabled ? '(Coming Soon)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : !selectedSection ? (
          /* Section Selection */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-[#9C3877] mb-2 drop-shadow-sm">
                Choose a Section
              </h1>
              <p className="text-lg font-bold text-[#8D6E63]">
                What would you like to practice?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Writing Section */}
              <div
                onClick={() => setSelectedSection('writing')}
                className="group bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="text-6xl mb-4 text-center">✍️</div>
                <h3 className="text-2xl font-extrabold mb-4 text-center text-[#9C27B0]">Writing</h3>
                <ul className="text-base space-y-2 text-[#5D4037] font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#9C27B0] rounded-full"></span>
                    Practice writing letters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#9C27B0] rounded-full"></span>
                    AI handwriting recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#9C27B0] rounded-full"></span>
                    Instant feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#9C27B0] rounded-full"></span>
                    Track your progress
                  </li>
                </ul>
              </div>

              {/* Reading Section */}
              <div
                onClick={() => setSelectedSection('reading')}
                className="group bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="text-6xl mb-4 text-center">🎤</div>
                <h3 className="text-2xl font-extrabold mb-4 text-center text-[#E91E63]">Reading</h3>
                <ul className="text-base space-y-2 text-[#5D4037] font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E91E63] rounded-full"></span>
                    Practice pronunciation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E91E63] rounded-full"></span>
                    Voice recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E91E63] rounded-full"></span>
                    Listen and repeat
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E91E63] rounded-full"></span>
                    Improve reading skills
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (selectedSection === 'writing' || selectedSection === 'reading') && !selectedSubsection ? (
          /* Subsection Selection */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-[#9C3877] mb-2 drop-shadow-sm">
                Choose What to Practice
              </h1>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {selectedSection === 'writing' ? (
                selectedLanguage === 'ta' ? (
                  <>
                    <div
                      onClick={() => setSelectedSubsection('capital')}
                      className="group bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-[#9C27B0]">அ</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-[#9C3877]">Vowels</h3>
                      <p className="text-center text-sm font-bold text-[#8D6E63]">உயிரெழுத்துக்கள்</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('small')}
                      className="group bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-[#4CAF50]">க</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-[#9C3877]">Consonants</h3>
                      <p className="text-center text-sm font-bold text-[#8D6E63]">மெய்யெழுத்துக்கள்</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => setSelectedSubsection('capital')}
                      className="group bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-white/30 p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-white">ABC</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-white">Capital Alphabets</h3>
                      <p className="text-center text-sm font-bold text-white/80">A to Z</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('small')}
                      className="group bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-white/30 p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-white">abc</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-white">Small Alphabets</h3>
                      <p className="text-center text-sm font-bold text-white/80">a to z</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('numbers')}
                      className="group bg-gradient-to-br from-[#FF9800] to-[#F57C00] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-white/30 p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-white">123</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-white">Numbers</h3>
                      <p className="text-center text-sm font-bold text-white/80">0 to 9</p>
                    </div>
                  </>
                )
              ) : (
                selectedLanguage === 'ta' ? (
                  <>
                    <div
                      onClick={() => setSelectedSubsection('learn')}
                      className="group bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center">🎓</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-[#9C3877]">Learn Letters</h3>
                      <p className="text-center text-sm font-bold text-[#8D6E63]">Interactive Learning</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('alphabets')}
                      className="group bg-[#FFF9F0] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15),0_0_0_6px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA] p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-[#9C27B0]">அ</div>
                      <h3 className="text-xl font-extrabold mb-2 text-center text-[#9C3877]">Tamil Letters</h3>
                      <p className="text-center text-sm font-bold text-[#8D6E63]">Vowels & Consonants</p>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => setSelectedSubsection('alphabets')}
                    className="group bg-gradient-to-br from-[#E91E63] to-[#C2185B] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-white/30 p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="text-5xl mb-3 text-center font-bold text-white">ABC</div>
                    <h3 className="text-xl font-extrabold mb-2 text-center text-white">Alphabets</h3>
                    <p className="text-center text-sm font-bold text-white/80">A to Z</p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* Mode Selection */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-[#9C3877] mb-2 drop-shadow-sm">
                Choose a Mode
              </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Practice Mode */}
              <Link href={
                selectedSection === 'writing'
                  ? selectedSubsection === 'capital'
                    ? `/practice?lang=${selectedLanguage}`
                    : selectedSubsection === 'small'
                    ? `/practice/small?lang=${selectedLanguage}`
                    : `/practice/numbers?lang=${selectedLanguage}`
                  : selectedLanguage === 'ta'
                    ? selectedSubsection === 'learn'
                      ? `/reading/learn/practice?lang=${selectedLanguage}`
                      : `/reading/practice?lang=${selectedLanguage}`
                    : `/reading/practice?lang=${selectedLanguage}`
              }>
                <div className="group bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-white/30 p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="text-6xl mb-4 text-center">✏️</div>
                  <h3 className="text-2xl font-extrabold mb-4 text-center text-white">Practice</h3>
                  <ul className="text-base space-y-2 text-white/90 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Learn at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Instant feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      No pressure
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Repeat as many times
                    </li>
                  </ul>
                </div>
              </Link>

              {/* Test Mode */}
              <Link href={
                selectedSection === 'writing'
                  ? selectedSubsection === 'capital'
                    ? `/test?lang=${selectedLanguage}`
                    : selectedSubsection === 'small'
                    ? `/test/small?lang=${selectedLanguage}`
                    : `/test/numbers?lang=${selectedLanguage}`
                  : selectedLanguage === 'ta'
                    ? selectedSubsection === 'learn'
                      ? `/reading/learn/test?lang=${selectedLanguage}`
                      : `/reading/test?lang=${selectedLanguage}`
                    : `/reading/test?lang=${selectedLanguage}`
              }>
                <div className="group bg-gradient-to-br from-[#FF9800] to-[#F57C00] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border-4 border-white/30 p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="text-6xl mb-4 text-center">📝</div>
                  <h3 className="text-2xl font-extrabold mb-4 text-center text-white">Test</h3>
                  <ul className="text-base space-y-2 text-white/90 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Test your knowledge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Single attempt per letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Score tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Corrected tests for mistakes
                    </li>
                  </ul>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

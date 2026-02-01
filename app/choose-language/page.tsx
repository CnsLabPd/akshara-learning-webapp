'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇮🇳', description: 'Learn English alphabets and pronunciation' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', description: 'Coming Soon!', disabled: true },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', description: 'Coming Soon!', disabled: true },
];

export default function ChooseLanguage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubsection, setSelectedSubsection] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  // Track if section was pre-selected from URL (coming from dashboard)
  const [preSelectedSection, setPreSelectedSection] = useState<string>('');

  useEffect(() => {
    setIsVisible(true);

    // Read URL parameters to set initial state
    const section = searchParams.get('section');
    const subsection = searchParams.get('subsection');
    const lang = searchParams.get('lang');

    if (lang) {
      setSelectedLanguage(lang);
    }
    if (section) {
      setSelectedSection(section);
      setPreSelectedSection(section); // Remember that section was pre-selected
    }
    if (subsection) {
      setSelectedSubsection(subsection);
    }
  }, [searchParams]);

  // Determine current step for indicator
  const getCurrentStep = () => {
    if (!selectedLanguage) return 0;
    if (!selectedSection) return 1;
    if (!selectedSubsection) return 2;
    return 3;
  };

  const steps = ['Language', 'Section', 'Subsection', 'Mode'];
  const currentStep = getCurrentStep();

  // Get back button action based on current step
  const getBackAction = () => {
    switch (currentStep) {
      case 0: // Language selection
        // If came from dashboard with pre-selected section, go back to dashboard
        if (preSelectedSection) return () => router.push('/students');
        return null; // No back on first step otherwise
      case 1: // Section selection
        return () => setSelectedLanguage(''); // Go back to language
      case 2: // Subsection selection
        // If section was pre-selected, go back to language (skip section)
        if (preSelectedSection) return () => setSelectedLanguage('');
        return () => setSelectedSection(''); // Go back to section
      case 3: // Mode selection
        return () => setSelectedSubsection(''); // Go back to subsection
      default:
        return null;
    }
  };

  const backAction = getBackAction();

  return (
    <main className="min-h-screen bg-warm-gradient">
      {/* Top Banner */}
      <div className="bg-indigo-600 px-6 py-4">
        {/* Neurogati Logo - Top Left Corner */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/neurogati.png"
            alt="Neurogati"
            className="w-12 h-12 md:w-14 md:h-14"
          />
          <span className="text-white font-bold text-lg md:text-xl">
            Neurogati
          </span>
        </div>

        {/* Navigation Row */}
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Back Button - Left (only show when not on first step) */}
          <div className="w-24">
            {backAction && (
              <button
                onClick={backAction}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Akshara - Center */}
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            AksharA
          </h1>

          {/* Profile and Logout Buttons - Right */}
          <div className="flex items-center gap-2">
            <Link href="/students">
              <button className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all flex items-center gap-2">
                <span>👤</span>
                <span>Profile</span>
              </button>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('aksharaUser');
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-500/80 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`max-w-6xl mx-auto px-6 py-6 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                index === currentStep
                  ? 'bg-indigo-600 text-white shadow-md'
                  : index < currentStep
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === currentStep
                    ? 'bg-white text-indigo-600'
                    : index < currentStep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-300 text-white'
                }`}>
                  {index < currentStep ? '\u2713' : index + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-indigo-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {!selectedLanguage ? (
          /* Language Selection */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
                Choose Your Language
              </h1>
              <p className="text-lg text-slate-600">
                Select a language to start learning
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <label className="block text-slate-800 font-bold text-xl mb-4 text-center">
                  Select Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => e.target.value && setSelectedLanguage(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-bold text-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 cursor-pointer"
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
          /* Section Selection (Writing or Reading) */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Choose a Section
              </h1>
              <p className="text-lg text-slate-600">
                What would you like to practice?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Writing Section */}
              <div
                onClick={() => setSelectedSection('writing')}
                className="group bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="text-5xl mb-4 text-center">✍️</div>
                <h3 className="text-2xl font-bold mb-4 text-center text-indigo-600">Writing</h3>
                <ul className="text-base space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Practice writing letters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    AI handwriting recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Instant feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Track your progress
                  </li>
                </ul>
              </div>

              {/* Reading Section */}
              <div
                onClick={() => setSelectedSection('reading')}
                className="group bg-white rounded-2xl shadow-lg p-6 border-l-4 border-violet-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="text-5xl mb-4 text-center">🎤</div>
                <h3 className="text-2xl font-bold mb-4 text-center text-violet-600">Reading</h3>
                <ul className="text-base space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    Practice pronunciation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    Voice recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    Listen and repeat
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
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
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Choose What to Practice
              </h1>
              <p className="text-lg text-slate-600">
                {selectedSection === 'writing' ? 'Writing Practice Options' : 'Speaking Practice Options'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {selectedSection === 'writing' ? (
                selectedLanguage === 'ta' ? (
                  <>
                    <div
                      onClick={() => setSelectedSubsection('capital')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-violet-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-violet-600">அ</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Vowels</h3>
                      <p className="text-center text-slate-500 text-sm">உயிரெழுத்துக்கள்</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('small')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-emerald-600">க</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Consonants</h3>
                      <p className="text-center text-slate-500 text-sm">மெய்யெழுத்துக்கள்</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => setSelectedSubsection('capital')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-violet-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-violet-600">ABC</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Capital Alphabets</h3>
                      <p className="text-center text-slate-500 text-sm">A to Z</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('small')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-emerald-600">abc</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Small Alphabets</h3>
                      <p className="text-center text-slate-500 text-sm">a to z</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('numbers')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-amber-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-amber-600">123</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Numbers</h3>
                      <p className="text-center text-slate-500 text-sm">0 to 9</p>
                    </div>
                  </>
                )
              ) : (
                selectedLanguage === 'ta' ? (
                  <>
                    <div
                      onClick={() => setSelectedSubsection('learn')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-indigo-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center">🎓</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Learn Letters</h3>
                      <p className="text-center text-slate-500 text-sm">Interactive Learning</p>
                    </div>
                    <div
                      onClick={() => setSelectedSubsection('alphabets')}
                      className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-violet-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-5xl mb-3 text-center font-bold text-violet-600">அ</div>
                      <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Tamil Letters</h3>
                      <p className="text-center text-slate-500 text-sm">Vowels & Consonants</p>
                    </div>
                  </>
                ) : (
                  /* English Reading - Only Alphabets */
                  <div
                    onClick={() => setSelectedSubsection('alphabets')}
                    className="group bg-white rounded-2xl shadow-lg p-6 border-t-4 border-violet-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="text-5xl mb-3 text-center font-bold text-violet-600">ABC</div>
                    <h3 className="text-xl font-bold mb-2 text-center text-slate-800">Alphabets</h3>
                    <p className="text-center text-slate-500 text-sm">A to Z</p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* Mode Selection (Practice or Test) */
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Choose a Mode
              </h1>
              <p className="text-lg text-slate-600">
                How would you like to learn?
              </p>
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
                <div className="group bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="text-5xl mb-4 text-center">✏️</div>
                  <h3 className="text-2xl font-bold mb-4 text-center text-emerald-600">Practice</h3>
                  <ul className="text-base space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Learn at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Instant feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      No pressure
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
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
                <div className="group bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="text-5xl mb-4 text-center">📝</div>
                  <h3 className="text-2xl font-bold mb-4 text-center text-amber-600">Test</h3>
                  <ul className="text-base space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Test your knowledge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Single attempt per letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Score tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
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

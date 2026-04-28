import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Target, Wallet, BarChart2 } from 'lucide-react';

export default function OnboardingOverlay() {
  const [show, setShow] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const onboardingDone = localStorage.getItem('mili_onboarding_done');
    if (!onboardingDone) {
      setShow(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('mili_onboarding_done', 'true');
    setShow(false);
  };

  if (!show) return null;

  const slides = [
    {
      title: "Selamat Datang di Mili",
      description: "Asisten keuangan pribadi cerdas yang siap membantu Anda mengontrol pendapatan dan pengeluaran secara optimal.",
      icon: <Sparkles className="w-12 h-12 text-[var(--accent)]" />,
      color: "from-purple-500/10 to-indigo-500/10"
    },
    {
      title: "Pencatatan Transaksi Kilat",
      description: "Catat setiap pemasukan dan pengeluaran Anda dalam hitungan detik dengan integrasi kategori pintar.",
      icon: <Wallet className="w-12 h-12 text-[var(--income)]" />,
      color: "from-green-500/10 to-emerald-500/10"
    },
    {
      title: "Pantau Anggaran & Target",
      description: "Tetapkan batas belanja bulanan dan kejar mimpi finansial dengan pelacak target modern.",
      icon: <Target className="w-12 h-12 text-[var(--expense)]" />,
      color: "from-red-500/10 to-pink-500/10"
    },
    {
      title: "Analisis Visual Menawan",
      description: "Dapatkan wawasan mendalam tentang kesehatan finansial Anda melalui laporan grafik visual yang hidup.",
      icon: <BarChart2 className="w-12 h-12 text-blue-500/10" />,
      color: "from-blue-500/10 to-sky-500/10"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.4)] backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 relative bg-gradient-to-br ${slides[currentSlide].color}`}>
        
        {/* Close button */}
        <button 
          onClick={handleFinish}
          className="absolute top-6 right-6 p-2 rounded-full bg-[var(--muted)] text-[var(--text-dim)] hover:text-[var(--text)] hover:scale-105 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-16 flex flex-col items-center text-center">
          {/* Animated Icon Container */}
          <div className="w-24 h-24 rounded-[30px] bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-md mb-8 hover:rotate-6 transition-transform duration-300">
            {slides[currentSlide].icon}
          </div>

          {/* Title */}
          <h2 className="text-[20px] font-bold text-[var(--text)] mb-3 leading-snug">
            {slides[currentSlide].title}
          </h2>

          {/* Description */}
          <p className="text-[13px] leading-relaxed text-[var(--text-dim-2)] font-medium max-w-[280px] mb-12">
            {slides[currentSlide].description}
          </p>

          {/* Slide Indicators */}
          <div className="flex gap-2 mb-8">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-[var(--border)]'}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 w-full mt-auto">
            {currentSlide > 0 && (
              <button 
                onClick={prevSlide}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-[var(--text)] hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={nextSlide}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-[var(--accent)] text-white font-bold text-[14px] shadow-lg shadow-[var(--accent)]/30 hover:opacity-90 hover:scale-[1.01] transition-all"
            >
              {currentSlide === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

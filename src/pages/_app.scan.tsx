import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file from gallery:", file.name);
      // Logic for OCR processing will go here
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
    }
  };

  const stopCamera = () => {
    setStream(currentStream => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="h-full flex flex-col animate-fade-in overflow-hidden pb-24 lg:pb-0">
      {/* ─── Close Button (top center) ─── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-black/60 active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* ─── Camera Preview / Scan Frame ─── */}
      <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 pt-20">
        <div className="relative w-full max-w-[420px] aspect-[3/4] border-2 border-white/20 rounded-[32px] overflow-hidden shadow-2xl bg-[#0a0a0a]">
          {/* Live Camera Feed */}
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Camera className="w-10 h-10 text-white/10" />
              </div>
              <p className="text-white/50 text-[15px] leading-relaxed font-medium">{error}</p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Scan Line Animation */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#15803D] shadow-[0_0_20px_#15803D] animate-scan-line z-10" />
          
          {/* Corner Decorations */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#15803D] rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#15803D] rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#15803D] rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#15803D] rounded-br-lg" />
        </div>
        <p className="mt-10 text-white/50 text-[14px] font-bold tracking-[0.1em] uppercase">Posisikan struk di dalam bingkai</p>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="bg-[var(--bg)] p-8 pb-14 lg:pb-10 flex items-center gap-5 shrink-0 border-t border-[var(--border)]">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <button 
          onClick={handleGalleryClick}
          className="flex-1 h-16 rounded-[24px] bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center gap-3 text-[16px] font-bold text-[var(--text)] transition-all active:scale-[0.96] hover:bg-[var(--border)]"
        >
          <ImageIcon className="w-6 h-6 text-[var(--text-dim-2)]" />
          Galeri
        </button>
        <button className="flex-1 h-16 rounded-[24px] bg-[#15803D] flex items-center justify-center gap-3 text-[16px] font-bold text-white transition-all active:scale-[0.96] shadow-xl shadow-[#15803D25] hover:bg-[#0E9355]">
          <Camera className="w-6 h-6" />
          Ambil Foto
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
      `}} />
    </div>
  );
}

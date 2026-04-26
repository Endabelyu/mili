import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanModal({ isOpen, onClose }: ScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop - Click anywhere to close as requested */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer" onClick={onClose} />
      
      {/* Modal Content - Slender and focused on the frame */}
      <div className="relative w-full max-w-[420px] h-fit max-h-[90vh] bg-black rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-white/10" onClick={(e) => e.stopPropagation()}>
        {/* ─── Close Button ─── */}
        <div className="absolute top-4 right-4 z-[210]">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-black/60 border border-white/10 active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Camera Preview / Scan Frame ─── */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6">
          <div className="relative w-full h-fit max-h-[50vh] aspect-[3/4] border-2 border-[#12B76A]/40 rounded-[20px] overflow-hidden shadow-2xl bg-[#111]">
            {/* Live Camera Feed */}
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/60 text-[14px] leading-relaxed">{error}</p>
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
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#12B76A] shadow-[0_0_15px_#12B76A] animate-scan-line z-10" />
          </div>
          <p className="mt-4 text-white/70 text-[13px] font-medium tracking-wide">Posisikan struk di dalam bingkai</p>
        </div>

        {/* ─── Minimal Action Buttons ─── */}
        <div className="bg-[#111] p-6 pb-8 flex items-center gap-3 shrink-0 border-t border-white/5">
          <button className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[14px] font-bold text-white/80 transition-all active:scale-[0.98] hover:bg-white/10">
            <ImageIcon className="w-4 h-4 text-white/40" />
            Galeri
          </button>
          <button className="flex-2 h-12 rounded-xl bg-[#12B76A] flex items-center justify-center gap-2 text-[14px] font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-[#12B76A30] hover:bg-[#0f9d5b]">
            <Camera className="w-4 h-4" />
            Ambil Foto
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
        @keyframes slide-up {
          from { transform: scale(0.95) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}} />
    </div>
  );
}

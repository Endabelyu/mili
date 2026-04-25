import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

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
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col animate-fade-in overflow-hidden -m-4 md:-m-8 lg:-m-10 pb-20 lg:pb-0">
      {/* ─── Close Button (top center, matching reference) ─── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white transition-colors hover:bg-black/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Camera Preview / Scan Frame ─── */}
      <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-6">
        <div className="relative w-full max-w-[400px] aspect-[3/4] border-2 border-white/30 rounded-[20px] overflow-hidden shadow-2xl bg-[#111]">
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
        <p className="mt-8 text-white/70 text-[14px] font-medium tracking-wide">Posisikan struk di dalam bingkai</p>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="bg-[var(--bg)] p-6 pb-12 lg:pb-8 flex items-center gap-4 shrink-0">
        <button className="flex-1 h-14 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center gap-3 text-[15px] font-bold text-[var(--text)] transition-all active:scale-[0.98]">
          <ImageIcon className="w-5 h-5 text-[var(--text-dim-2)]" />
          Unggah Foto
        </button>
        <button className="flex-1 h-14 rounded-2xl bg-[#12B76A] flex items-center justify-center gap-3 text-[15px] font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-[#12B76A30]">
          <Camera className="w-5 h-5" />
          Ambil Foto
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
      `}} />
    </div>
  );
}

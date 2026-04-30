import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScanModal({ isOpen, onClose }: ScanModalProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsScanning(true);
      stopCamera();
      
      // Simulate OCR processing delay
      setTimeout(() => {
        // Mock scanned data
        const scannedAmount = "50000"; 
        const scannedDescription = `Scan Struk: ${file.name}`;
        
        // Navigate to dashboard and trigger New Transaction modal with data
        onClose(); // Close the scan modal first
        navigate(`/?new_transaction=true&amount=${scannedAmount}&description=${encodeURIComponent(scannedDescription)}`, { replace: true });
        
        setIsScanning(false);
      }, 3000);
    }
  };

  const startCamera = async () => {
    try {
      if (selectedImage) return; // Don't start camera if we have an image
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
      // Reset state on close
      setSelectedImage(null);
      setIsScanning(false);
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
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 pt-10">
          <div className="relative w-full h-fit max-h-[50vh] aspect-[3/4] border-2 border-[#15803D]/40 rounded-[24px] overflow-hidden shadow-2xl bg-[#0d0d0d]">
            {/* Image Preview (Gallery) */}
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt="Receipt" 
                className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-500"
              />
            ) : error ? (
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
            {(!error || selectedImage) && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[#15803D] shadow-[0_0_15px_#15803D] animate-scan-line z-10" />
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20 animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-[#15803D] rounded-full animate-spin" />
                  <p className="text-white font-bold tracking-wider text-[12px] uppercase">Menganalisa Struk...</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 text-white/40 text-[12px] font-bold tracking-widest uppercase">
            {isScanning ? 'Mohon Tunggu' : selectedImage ? 'Struk Berhasil Dimuat' : 'Posisikan struk di dalam bingkai'}
          </p>
        </div>

        {/* ─── Minimal Action Buttons ─── */}
        <div className="bg-[#111] p-6 pb-8 flex items-center gap-3 shrink-0 border-t border-white/5">
          <div className="flex-1 relative group active:scale-[0.96] transition-transform">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={isScanning}
            />
            <div className="w-full h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[14px] font-bold text-white/80 transition-all group-hover:bg-white/10">
              <ImageIcon className="w-4 h-4 text-white/40" />
              Galeri
            </div>
          </div>
          <button 
            className="flex-2 h-12 rounded-xl bg-[#15803D] flex items-center justify-center gap-2 text-[14px] font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-[#15803D30] hover:bg-[#0f9d5b] disabled:opacity-50"
            disabled={isScanning}
          >
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

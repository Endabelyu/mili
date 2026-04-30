import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';

// Helper to extract amount from OCR text
const extractAmountFromText = (text: string): string => {
  const lines = text.split('\n');
  const possibleAmounts: number[] = [];

  // Patterns for money: Rp. 10.000, 10,000.00, etc.
  const moneyPattern = /(?:rp|[$]|)\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;

  lines.forEach(line => {
    const matches = line.matchAll(moneyPattern);
    for (const match of matches) {
      const clean = match[1].replace(/[.,]/g, '');
      const num = parseFloat(clean);
      if (!isNaN(num) && num > 100) { // Filter out small numbers like dates
        possibleAmounts.push(num);
      }
    }
  });

  if (possibleAmounts.length > 0) {
    // Usually the largest number on a receipt is the total
    const maxAmount = Math.max(...possibleAmounts);
    return Math.floor(maxAmount).toString();
  }

  return "0";
};

export default function ScanReceiptPage() {
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
      
      // Real OCR processing
      Tesseract.recognize(file, 'ind+eng', {
        logger: m => console.log(m)
      }).then(({ data: { text } }) => {
        console.log("OCR Result:", text);
        const scannedAmount = extractAmountFromText(text);
        const scannedDescription = `Scan Struk: ${file.name}`;
        
        // Small delay for UI feel
        setTimeout(() => {
          navigate(`/?new_transaction=true&amount=${scannedAmount}&description=${encodeURIComponent(scannedDescription)}`, { replace: true });
          setIsScanning(false);
        }, 1500);
      }).catch(err => {
        console.error("OCR Error:", err);
        setError("Gagal membaca struk. Silakan coba lagi.");
        setIsScanning(false);
      });
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
          {/* Selected Image Preview (from Gallery) */}
          {selectedImage ? (
            <img 
              src={selectedImage} 
              alt="Receipt preview" 
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-500"
            />
          ) : error ? (
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

          {/* Scan Line Animation (Always visible when scanning or camera active) */}
          {(!error || selectedImage) && (
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#15803D] shadow-[0_0_20px_#15803D] animate-scan-line z-10" />
          )}
          
          {/* Corner Decorations */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#15803D] rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#15803D] rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#15803D] rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#15803D] rounded-br-lg" />

          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 animate-in fade-in duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-[#15803D] rounded-full animate-spin" />
                <p className="text-white font-bold tracking-wider text-[14px]">Menganalisa Struk...</p>
              </div>
            </div>
          )}
        </div>
        <p className="mt-10 text-white/50 text-[14px] font-bold tracking-[0.1em] uppercase">
          {isScanning ? 'Mohon Tunggu' : selectedImage ? 'Struk Berhasil Dimuat' : 'Posisikan struk di dalam bingkai'}
        </p>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="bg-[var(--bg)] p-8 pb-14 lg:pb-10 flex items-center gap-5 shrink-0 border-t border-[var(--border)]">
        <div className="flex-1 relative group active:scale-[0.96] transition-transform">
          <input 
            id="gallery-upload"
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <div 
            className="w-full h-16 rounded-[24px] bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center gap-3 text-[16px] font-bold text-[var(--text)] transition-all group-hover:bg-[var(--border)]"
          >
            <ImageIcon className="w-6 h-6 text-[var(--text-dim-2)]" />
            Galeri
          </div>
        </div>
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

import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReceiptOcr } from '../features/receipt-scanner/useReceiptOcr';
import { ReceiptPreview } from '../features/receipt-scanner/ReceiptPreview';
import type { ReceiptData } from '../features/receipt-scanner/types';

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { scanFree, scanAI, status, result, error, scanMode, aiEnabled, reset } = useReceiptOcr();

  // ─── File selection (Gallery) ─────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
      stopCamera();
    }
  };

  // ─── Confirm scanned result → navigate to transaction form ────────────────
  const handleConfirm = (data: ReceiptData) => {
    const amount = data.total?.toString() || '0';
    const itemsList = data.items?.map(i => `- ${i.name}`).filter(Boolean).join('\n') || '';
    const desc = `${data.store_name || 'Struk'}${itemsList ? '\n' + itemsList : ''}`;

    navigate(`/?new_transaction=true&amount=${amount}&description=${encodeURIComponent(desc)}`, { replace: true });
  };

  // ─── Rescan → clear result, keep image ────────────────────────────────────
  const handleRescan = () => {
    reset();
  };

  // ─── Camera controls ──────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCameraError(null);
    } catch {
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
    }
  };

  const stopCamera = () => {
    setStream(current => {
      current?.getTracks().forEach(track => track.stop());
      return null;
    });
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const isScanning = status === 'scanning';
  const hasResult = status === 'success' && result;
  const hasImage = !!selectedImage;

  return (
    <div className="h-full flex flex-col animate-fade-in overflow-hidden pb-24 lg:pb-0">
      {/* ─── Close Button ─── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-black/60 active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* ─── Main Content ─── */}
      {!hasResult ? (
        <>
          {/* Camera / Image Frame */}
          <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 pt-20">
            <div className="relative w-full max-w-[420px] aspect-[3/4] border-2 border-white/20 rounded-[32px] overflow-hidden shadow-2xl bg-[#0a0a0a]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Receipt preview"
                  className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                />
              ) : cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Camera className="w-10 h-10 text-white/10" />
                  </div>
                  <p className="text-white/50 text-[15px] leading-relaxed font-medium">{cameraError}</p>
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

              {/* Scan line */}
              {(!cameraError || selectedImage) && (
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#15803D] shadow-[0_0_20px_#15803D] animate-scan-line z-10" />
              )}

              {/* Corner decorations */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#15803D] rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#15803D] rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#15803D] rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#15803D] rounded-br-lg" />

              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-[#15803D] rounded-full animate-spin" />
                    <p className="text-white font-bold tracking-wider text-[14px]">
                      {scanMode === 'ai' ? 'AI sedang menganalisa...' : 'Menganalisa Struk...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-10 text-white/50 text-[14px] font-bold tracking-[0.1em] uppercase">
              {isScanning
                ? 'Mohon Tunggu'
                : selectedImage
                  ? 'Pilih metode scan di bawah'
                  : 'Posisikan struk di dalam bingkai'}
            </p>

            {error && (
              <p className="mt-3 text-red-400 text-[13px] font-medium text-center px-6">{error}</p>
            )}
          </div>

          {/* ─── Footer Actions ─── */}
          <div className="bg-[var(--bg)] p-8 pb-14 lg:pb-10 flex flex-col gap-4 shrink-0 border-t border-[var(--border)]">
            {/* Gallery + Camera (before image selected) */}
            {!hasImage && (
              <div className="flex items-center gap-5">
                <div className="flex-1 relative group active:scale-[0.96] transition-transform">
                  <input
                    id="gallery-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="w-full h-16 rounded-[24px] bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center gap-3 text-[16px] font-bold text-[var(--text)] transition-all group-hover:bg-[var(--border)]">
                    <ImageIcon className="w-6 h-6 text-[var(--text-dim-2)]" />
                    Galeri
                  </div>
                </div>
                <button className="flex-1 h-16 rounded-[24px] bg-[#15803D] flex items-center justify-center gap-3 text-[16px] font-bold text-white transition-all active:scale-[0.96] shadow-xl shadow-[#15803D25] hover:bg-[#0E9355]">
                  <Camera className="w-6 h-6" />
                  Ambil Foto
                </button>
              </div>
            )}

            {/* Scan buttons (after image selected) */}
            {hasImage && !isScanning && (
              <div className="flex items-center gap-4">
                {/* Change image */}
                <div className="relative group active:scale-[0.96] transition-transform">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 rounded-[24px] bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-dim-2)] transition-all group-hover:bg-[var(--border)]">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                </div>

                {/* Scan Gratis */}
                <button
                  onClick={() => selectedFile && scanFree(selectedFile)}
                  className="flex-1 h-16 rounded-[24px] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center gap-3 text-[16px] font-bold text-emerald-400 transition-all active:scale-[0.96] hover:bg-emerald-500/20"
                >
                  🆓 Scan Gratis
                </button>

                {/* Scan AI */}
                <button
                  onClick={() => selectedFile && aiEnabled && scanAI(selectedFile)}
                  disabled={!aiEnabled}
                  className={`flex-1 h-16 rounded-[24px] border-2 flex items-center justify-center gap-3 text-[16px] font-bold transition-all ${
                    aiEnabled
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 active:scale-[0.96] hover:bg-purple-500/20'
                      : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  {aiEnabled ? 'Scan AI' : 'AI Coming Soon'}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ─── Receipt Preview (after scan success) ─── */
        <div className="flex-1 bg-black flex flex-col">
          <div className="flex-1 overflow-auto pt-20">
            <ReceiptPreview
              data={result!}
              scanMode={scanMode}
              onConfirm={handleConfirm}
              onRescan={handleRescan}
            />
          </div>
        </div>
      )}

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

/**
 * useReceiptOcr — Dual-strategy receipt scanning hook
 *
 * Provides two scan methods:
 * - scanFree(file)  → Tesseract.js in-browser (free, unlimited)
 * - scanAI(file)    → Claude Haiku 4.5 Vision via API (rich, daily quota)
 *
 * Both produce the same ReceiptData shape for a unified preview experience.
 */

import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import type { ReceiptData } from './types';
import { analyzeReceipt, toReceiptData } from './receiptParser';
import { ocrApi } from '../../api/client';

const API_BASE = import.meta.env.VITE_API_URL;

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

// ─── Image compression ──────────────────────────────────────────────────────
function compressImage(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // quality 0.85 = good balance of size vs clarity
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        URL.revokeObjectURL(img.src);
        resolve(base64);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  });
}

export function useReceiptOcr() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [result, setResult] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'free' | 'ai' | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);

  // Check if AI is enabled on mount
  useEffect(() => {
    ocrApi.getStatus()
      .then(data => setAiEnabled(data.enabled))
      .catch(() => setAiEnabled(false));
  }, []);

  /** Free scan — Tesseract.js in-browser, unlimited */
  async function scanFree(file: File) {
    setStatus('scanning');
    setScanMode('free');
    setError(null);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'ind+eng', {
        logger: m => console.log('[Tesseract]', m),
      });

      console.log('[Scan Gratis] OCR text:', text);
      const heuristic = analyzeReceipt(text);
      const receiptData = toReceiptData(heuristic);

      setResult(receiptData);
      setStatus('success');
    } catch (err) {
      console.error('[Scan Gratis] Error:', err);
      setError('Gagal membaca struk. Coba foto yang lebih jelas.');
      setStatus('error');
    }
  }

  /** AI scan — Claude Haiku 4.5 via server API, daily quota */
  async function scanAI(file: File) {
    setStatus('scanning');
    setScanMode('ai');
    setError(null);

    try {
      const base64 = await compressImage(file);

      const res = await fetch(`${API_BASE}/api/v1/ocr/scan-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: base64 }),
      });

      if (res.status === 429) {
        setError('Batas Scan AI harian tercapai. Gunakan Scan Gratis.');
        setStatus('error');
        return;
      }

      if (res.status === 503) {
        // API key not configured — silent fallback to free
        console.warn('[Scan AI] Service unavailable, falling back to Tesseract');
        return scanFree(file);
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: ReceiptData = await res.json();
      setResult(data);
      setStatus('success');
    } catch (err) {
      console.error('[Scan AI] Error, falling back to Tesseract:', err);
      // Automatic fallback to free scan on any error
      return scanFree(file);
    }
  }

  function reset() {
    setStatus('idle');
    setResult(null);
    setError(null);
    setScanMode(null);
  }

  return { scanFree, scanAI, status, result, error, scanMode, aiEnabled, reset };
}

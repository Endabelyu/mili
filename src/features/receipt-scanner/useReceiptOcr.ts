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
import { usePreferences } from '../../hooks/usePreferences';

const API_BASE = import.meta.env.VITE_API_URL;

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

// ─── Image preprocessing for better OCR accuracy ────────────────────────────
function preprocessForOcr(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxWidth = 1200; // Higher res for OCR
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }

        // Draw original
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get pixel data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 1. Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        // 2. Increase contrast (stretch histogram)
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] < min) min = data[i];
          if (data[i] > max) max = data[i];
        }
        const range = max - min || 1;
        for (let i = 0; i < data.length; i += 4) {
          const stretched = ((data[i] - min) / range) * 255;
          data[i] = stretched;
          data[i + 1] = stretched;
          data[i + 2] = stretched;
        }

        // 3. Adaptive threshold (binarize) — good for thermal receipts
        const threshold = 140;
        for (let i = 0; i < data.length; i += 4) {
          const val = data[i] > threshold ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }

        ctx.putImageData(imageData, 0, 0);
        URL.revokeObjectURL(img.src);

        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Failed to create blob')); return; }
          resolve(new File([blob], 'preprocessed.png', { type: 'image/png' }));
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  });
}

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
  const { t } = usePreferences();
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
      // Preprocess image for better OCR on thermal receipts
      const processedFile = await preprocessForOcr(file);
      const { data: { text } } = await Tesseract.recognize(processedFile, 'ind+eng', {
        logger: () => {},
      });
      const heuristic = analyzeReceipt(text);
      const receiptData = toReceiptData(heuristic);

      setResult(receiptData);
      setStatus('success');
    } catch (err) {
      console.error('[Scan Gratis] Error:', err);
      setError(t('scan.readError'));
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
        setError(t('scan.aiLimitReached'));
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

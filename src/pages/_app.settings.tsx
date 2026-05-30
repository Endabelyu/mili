import { useState } from 'react';
import { usePreferences, LANGUAGE_OPTIONS, CURRENCY_OPTIONS } from '../hooks/usePreferences';
import type { Language, Currency } from '../hooks/usePreferences';
import {
  Sun,
  Moon,
  Bell,
  Shield,
  ChevronRight,
  Globe,
  Coins,
  Download,
  Upload,
  Cloud,
  Trash2,
  Star,
  Info,

  Check,
  X,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import type * as ExcelJSTypes from 'exceljs';
// ExcelJS imported dynamically to avoid Vite fetch issues
// import * as ExcelJS from 'exceljs';

import { useQuery } from '@tanstack/react-query';
import { transactionsApi, accountsApi, budgetsApi, feedbacksApi } from '../api/client';
import type { Transaction } from '../types';
import { authClient } from '../lib/auth-client';

export default function SettingsPage() {
  const { language, setLanguage, currency, setCurrency, isDark, toggleDark, t } = usePreferences();
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name?.toLowerCase()?.replace(/\s+/g, '_') || 'user';

  // Sheet state for language/currency pickers
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'error' = 'warning') => {
    setAlertConfig({ isOpen: true, title, message, type, isConfirm: true, onConfirm });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  // Labels derived from current preferences
  const currentLangLabel = LANGUAGE_OPTIONS.find(l => l.value === language)?.nativeLabel || 'Bahasa Indonesia';
  const currentCurrencyLabel = CURRENCY_OPTIONS.find(c => c.value === currency)?.label || 'Rupiah (Rp)';

  const [showExportPicker, setShowExportPicker] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeAssets: true,
    includeBudgets: true,
    includeTransactions: true
  });

  // Fetch ALL transactions via pagination loop (no silent truncation)
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions', 'export-all'],
    queryFn: async () => {
      const items: Transaction[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await transactionsApi.list({ page, limit: 200 });
        items.push(...res.items);
        totalPages = res.pagination.totalPages;
        page++;
      } while (page <= totalPages);
      return items;
    },
    staleTime: 5 * 60_000,
  });
  const transactions = allTransactions;

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
  });
  const accounts = accountsData || [];

  const { data: budgetsData } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list(),
  });
  const budgets = budgetsData || [];

  const handleExportExcel = async () => {
    setShowExportPicker(false);
    try {
    const ExcelJS = await import('exceljs');
    const workbook = new (ExcelJS.Workbook || (ExcelJS as unknown as { default: { Workbook: new () => ExcelJSTypes.Workbook } }).default.Workbook)();
    const worksheet = workbook.addWorksheet(t('settings.reportTitle'));

    // 1. Setup Columns
    worksheet.columns = [
      { header: '', key: 'col1', width: 25 },
      { header: '', key: 'col2', width: 20 },
      { header: '', key: 'col3', width: 35 },
      { header: '', key: 'col4', width: 18 },
      { header: '', key: 'col5', width: 18 },
      { header: '', key: 'col6', width: 18 },
    ];

    // 2. Header Style Definitions
    const BRAND_COLOR = 'FF15803D'; // Emerald-700
    const INCOME_COLOR = 'FF10B981';
    const EXPENSE_COLOR = 'FFEF4444';

    const HEADER_STYLE: Partial<ExcelJSTypes.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_COLOR } },
      alignment: { vertical: 'middle', horizontal: 'center' }
    };
    const SUB_HEADER_STYLE: Partial<ExcelJSTypes.Style> = {
      font: { bold: true, color: { argb: 'FF334155' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } },
      border: { bottom: { style: 'thin' } }
    };

    // 3. Document Title
    worksheet.addRow(['Mili / Finance']).font = { size: 18, bold: true, color: { argb: BRAND_COLOR } };
    worksheet.addRow([t('settings.consolidatedReport')]).font = { size: 14, bold: true };
    worksheet.addRow([`${t('settings.reportFor')}: ${session?.user?.name || 'User'}`]).font = { italic: true };
    worksheet.addRow([`${t('settings.period')}: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`]);
    worksheet.addRow(['']);

    // 4. TOTAL ASSETS (TOP)
    const totalAssetAmount = (accounts || []).reduce((acc, a) => acc + parseFloat(String(a.balance)), 0);
    worksheet.addRow([t('settings.totalWealth')]).font = { bold: true, size: 12 };
    const totalAssetRow = worksheet.addRow([`Rp ${totalAssetAmount.toLocaleString('id-ID')}`]);
    totalAssetRow.font = { bold: true, size: 24, color: { argb: BRAND_COLOR } };
    worksheet.addRow(['']);

    // 5. Assets Section (SYNC COLORS)
    if (exportOptions.includeAssets) {
      const assetTitle = worksheet.addRow([t('settings.assetSummary')]);
      assetTitle.eachCell(cell => Object.assign(cell, HEADER_STYLE));
      worksheet.mergeCells(`A${assetTitle.number}:F${assetTitle.number}`);

      const assetHead = worksheet.addRow([t('settings.accountName'), t('settings.accountType'), t('settings.balance')]);
      assetHead.eachCell(cell => Object.assign(cell, SUB_HEADER_STYLE));

      (accounts || []).forEach(a => {
        const row = worksheet.addRow([a.name, a.type, parseFloat(String(a.balance))]);
        const accColor = a.color?.replace('#', '') || '334155';
        row.getCell(1).font = { color: { argb: `FF${accColor}` }, bold: true };
        row.getCell(3).numFmt = '#,##0';
        row.getCell(3).font = { color: { argb: `FF${accColor}` }, bold: true };
      });
      worksheet.addRow(['']);
    }

    // 6. Summary Section (INCOME/EXPENSE COLORS)
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);
    const balance = totalIncome - totalExpense;

    const summaryTitleRow = worksheet.addRow([t('settings.cashFlowSummary')]);
    summaryTitleRow.eachCell(cell => Object.assign(cell, HEADER_STYLE));
    worksheet.mergeCells(`A${summaryTitleRow.number}:F${summaryTitleRow.number}`);

    const sumHead = worksheet.addRow([t('settings.description'), '', t('settings.amount')]);
    sumHead.eachCell(cell => Object.assign(cell, SUB_HEADER_STYLE));

    const incRow = worksheet.addRow([t('settings.totalIncome'), '', totalIncome]);
    incRow.getCell(3).numFmt = '#,##0';
    incRow.getCell(3).font = { color: { argb: INCOME_COLOR }, bold: true };

    const expRow = worksheet.addRow([t('settings.totalExpense'), '', totalExpense]);
    expRow.getCell(3).numFmt = '#,##0';
    expRow.getCell(3).font = { color: { argb: EXPENSE_COLOR }, bold: true };

    const balRow = worksheet.addRow([t('settings.netBalance'), '', balance]);
    balRow.getCell(3).numFmt = '#,##0';
    balRow.getCell(3).font = { bold: true };
    worksheet.addRow(['']);

    // 7. Budgets Section (SYNC COLORS)
    if (exportOptions.includeBudgets) {
      const budgetTitle = worksheet.addRow([t('settings.budgetMonitoring')]);
      budgetTitle.eachCell(cell => Object.assign(cell, HEADER_STYLE));
      worksheet.mergeCells(`A${budgetTitle.number}:F${budgetTitle.number}`);

      const budgetHead = worksheet.addRow([t('settings.category'), t('settings.limit'), t('settings.used'), t('settings.percentage')]);
      budgetHead.eachCell(cell => Object.assign(cell, SUB_HEADER_STYLE));

      (budgets || []).forEach(b => {
        const perc = b.percentageUsed ?? 0;
        const filled = Math.min(Math.floor(perc / 10), 10);
        const progressBar = `[${'■'.repeat(filled)}${' '.repeat(10 - filled)}] ${perc}%`;
        
        const row = worksheet.addRow([
          b.category?.label || b.categoryId,
          parseFloat(String(b.limitAmount)),
          parseFloat(String(b.spent || 0)),
          progressBar
        ]);
        const catColor = b.category?.color?.replace('#', '') || '334155';
        row.getCell(1).font = { color: { argb: `FF${catColor}` }, bold: true };
        row.getCell(2).numFmt = '#,##0';
        row.getCell(3).numFmt = '#,##0';
        
        const barColor = perc >= 100 ? EXPENSE_COLOR : (perc >= 80 ? 'FFF59E0B' : 'FF10B981');
        row.getCell(4).font = { color: { argb: barColor }, bold: true };
      });
      worksheet.addRow(['']);
    }

    // 8. Transactions Ledger (SYNC COLORS)
    if (exportOptions.includeTransactions) {
      const ledgerTitle = worksheet.addRow([t('settings.ledgerDetail')]);
      ledgerTitle.eachCell(cell => Object.assign(cell, HEADER_STYLE));
      worksheet.mergeCells(`A${ledgerTitle.number}:F${ledgerTitle.number}`);

      const ledgerHead = worksheet.addRow([t('settings.date'), t('settings.category'), t('settings.description'), t('settings.incoming'), t('settings.outgoing'), t('settings.balance')]);
      ledgerHead.eachCell(cell => Object.assign(cell, SUB_HEADER_STYLE));

      let rb = 0;
      const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      sorted.forEach(t => {
        const amt = parseFloat(String(t.amount));
        const isInc = t.type === 'income';
        if (isInc) rb += amt; else rb -= amt;
        const row = worksheet.addRow([
          new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }),
          t.category?.label || t.categoryId,
          t.description || '-',
          isInc ? amt : 0,
          !isInc ? amt : 0,
          rb
        ]);
        const catColor = t.category?.color?.replace('#', '') || '334155';
        row.getCell(2).font = { color: { argb: `FF${catColor}` } };
        row.getCell(4).numFmt = '#,##0';
        row.getCell(5).numFmt = '#,##0';
        row.getCell(6).numFmt = '#,##0';
        if (isInc) row.getCell(4).font = { color: { argb: INCOME_COLOR }, bold: true };
        if (!isInc) row.getCell(5).font = { color: { argb: EXPENSE_COLOR }, bold: true };
      });
    }

    worksheet.addRow(['']);
    worksheet.addRow([t('settings.docGenerated')]).font = { italic: true, size: 10 };
    worksheet.addRow([new Date().toLocaleString('id-ID')]).font = { size: 9 };

    // 9. Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userName}_mili_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => showAlert(t('common.success'), t('settings.exportSuccess'), 'success'), 500);
    } catch {
      showAlert(t('settings.exportFailed'), t('settings.exportError'), 'error');
    }
  };



  const handleExportCSV = () => {
    setShowExportPicker(false);
    if (transactions.length === 0) {
      showAlert(t('settings.exportFailed'), t('settings.exportNoData'), 'error');
      return;
    }

    const headers = [t('settings.date'), t('settings.category'), t('settings.description'), t('settings.income'), t('settings.expense'), t('settings.balance')];
    let runningBalance = 0;
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const rows = sorted.map(t => {
      const amt = parseFloat(String(t.amount));
      const isInc = t.type === 'income';
      if (isInc) runningBalance += amt; else runningBalance -= amt;
      return [
        new Date(t.date).toLocaleDateString('id-ID'),
        t.category?.label || t.categoryId,
        t.description || '',
        isInc ? amt : 0,
        !isInc ? amt : 0,
        runningBalance
      ];
    });

    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${userName}_mili_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => showAlert(t('common.success'), t('settings.exportSuccess'), 'success'), 500);
  };

  const handleExportPDF = () => {
    setShowExportPicker(false);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showAlert(t('settings.popupBlocked'), t('settings.popupBlockedDesc'), 'warning');
      return;
    }

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(String(t.amount)), 0);
    const balance = totalIncome - totalExpense;
    const totalAssetAmount = (accounts || []).reduce((acc, a) => acc + parseFloat(String(a.balance)), 0);

    const html = `
      <html>
        <head>
          <title>Mili - Laporan Keuangan</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #0f172a; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 30px; }
            .brand { font-size: 28px; font-weight: 800; color: #15803D; letter-spacing: -0.02em; }
            .brand span { color: #0f172a; opacity: 0.3; font-weight: 400; margin: 0 8px; }
            .report-title { text-align: right; }
            .report-title h1 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin: 0; }
            .report-title p { font-size: 13px; font-weight: 600; color: #1e293b; margin: 4px 0 0 0; }

            .total-wealth { margin: 40px 0; }
            .total-wealth label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            .total-wealth .amount { font-size: 36px; font-weight: 800; color: #15803D; margin-top: 5px; }

            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .summary-card { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; }
            .summary-card label { display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
            .summary-card .val { font-size: 18px; font-weight: 700; }
            .val.income { color: #10b981; }
            .val.expense { color: #ef4444; }

            .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 40px 0 15px 0; display: flex; align-items: center; gap: 10px; }
            .section-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

            .asset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .asset-card { border: 1px solid #f1f5f9; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
            .asset-info h4 { margin: 0; font-size: 14px; font-weight: 700; }
            .asset-info p { margin: 2px 0 0 0; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }

            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 15px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
            .row-main { font-weight: 600; }
            .row-income { color: #10b981; font-weight: 700; }
            .row-expense { color: #ef4444; font-weight: 700; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Mili<span>/</span>Finance</div>
            <div class="report-title">
              <h1>${t('settings.reportTitle')}</h1>
              <p style="color: #64748b; font-size: 11px; margin-top: 2px;">${t('settings.reportFor')}: ${session?.user?.name || 'User'}</p>
              <p>${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="total-wealth">
            <label>${t('settings.totalWealth')}</label>
            <div class="amount">Rp ${totalAssetAmount.toLocaleString('id-ID')}</div>
          </div>

          ${exportOptions.includeAssets ? `
            <div class="section-title">${t('settings.assetSummary')}</div>
            <div class="asset-grid">
              ${(accounts || []).map(a => `
                <div class="asset-card" style="border-left: 4px solid ${a.color || '#e2e8f0'}">
                  <div class="asset-info">
                    <h4 style="color: ${a.color || '#0f172a'}">${a.name}</h4>
                    <p>${a.type}</p>
                  </div>
                  <div style="font-weight: 700; font-size: 15px; color: ${a.color || '#0f172a'}">Rp ${parseFloat(String(a.balance)).toLocaleString('id-ID')}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="section-title">${t('settings.cashFlowSummary')}</div>
          <div class="summary-grid">
            <div class="summary-card">
              <label>${t('settings.totalIncome')}</label>
              <div class="val income">Rp ${totalIncome.toLocaleString('id-ID')}</div>
            </div>
            <div class="summary-card">
              <label>${t('settings.totalExpense')}</label>
              <div class="val expense">Rp ${totalExpense.toLocaleString('id-ID')}</div>
            </div>
            <div class="summary-card">
              <label>${t('settings.netBalance')}</label>
              <div class="val">Rp ${balance.toLocaleString('id-ID')}</div>
            </div>
          </div>

          ${exportOptions.includeBudgets ? `
            <div class="section-title">${t('settings.budgetMonitoring')}</div>
            <table>
              <thead>
                <tr>
                  <th>${t('settings.category')}</th>
                  <th class="text-right">${t('settings.limit')}</th>
                  <th class="text-right">${t('settings.used')}</th>
                  <th>${t('settings.percentage')}</th>
                </tr>
              </thead>
              <tbody>
                ${(budgets || []).map(b => {
                  const perc = b.percentageUsed ?? 0;
                  const barColor = perc >= 100 ? '#ef4444' : (perc >= 80 ? '#f59e0b' : '#10b981');
                  return `
                  <tr>
                    <td style="font-weight: 700; color: ${b.category?.color || '#0f172a'}">${b.category?.label || b.categoryId}</td>
                    <td class="text-right">Rp ${parseFloat(String(b.limitAmount)).toLocaleString('id-ID')}</td>
                    <td class="text-right">Rp ${parseFloat(String(b.spent || 0)).toLocaleString('id-ID')}</td>
                    <td style="width: 150px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden;">
                          <div style="width: ${Math.min(perc, 100)}%; height: 100%; background: ${barColor};"></div>
                        </div>
                        <span style="font-size: 10px; font-weight: 800; color: ${barColor}">${perc}%</span>
                      </div>
                    </td>
                  </tr>
                `; }).join('')}
              </tbody>
            </table>
          ` : ''}

          ${exportOptions.includeTransactions ? `
            <div class="section-title">${t('settings.ledgerDetail')}</div>
            <table>
              <thead>
                <tr>
                  <th>${t('settings.date')}</th>
                  <th>${t('settings.description')}</th>
                  <th class="text-right">${t('settings.incoming')}</th>
                  <th class="text-right">${t('settings.outgoing')}</th>
                  <th class="text-right">${t('settings.balance')}</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  let rb = 0;
                  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  return sorted.map(t => {
                    const amt = parseFloat(String(t.amount));
                    const isInc = t.type === 'income';
                    if (isInc) rb += amt; else rb -= amt;
                    return `
                      <tr>
                        <td>${new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}</td>
                        <td>
                          <div style="font-weight: 700; color: ${t.category?.color || '#0f172a'}">${t.category?.label || t.categoryId}</div>
                          <div style="font-size: 11px; opacity: 0.6;">${t.description || '-'}</div>
                        </td>
                        <td class="text-right ${isInc ? 'row-income' : ''}">${isInc ? amt.toLocaleString('id-ID') : '-'}</td>
                        <td class="text-right ${!isInc ? 'row-expense' : ''}">${!isInc ? amt.toLocaleString('id-ID') : '-'}</td>
                        <td class="text-right" style="font-weight: 700; background: #f8fafc;">${rb.toLocaleString('id-ID')}</td>
                      </tr>
                    `;
                  }).join('');
                })()}
              </tbody>
            </table>
          ` : ''}

          <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
            <div>${t('settings.docGenerated')}</div>
            <div>${new Date().toLocaleString('id-ID')}</div>
          </div>

          <script>
            window.onload = () => { setTimeout(() => { window.print(); }, 500); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDeleteAll = () => {
    showConfirm(
      t('settings.deleteAllTitle'),
      t('settings.deleteAllConfirm'),
      () => {
        closeAlert();
        setTimeout(() => {
          showAlert(t('common.success'), t('settings.deleteAllSuccess'), 'success');
        }, 500);
      },
      'error'
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em] ml-1">{t('settings.title')}</h1>
        <p className="text-[14px] font-medium text-[var(--text-dim)] ml-1">{t('settings.subtitle')}</p>
      </div>

      {/* ─── Theme Selector ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.appearance')}</h3>
        <div className="flow-card p-5">
          <p className="text-[13px] font-bold text-[var(--text)] mb-4">{t('settings.appTheme')}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { if (isDark) toggleDark(); }}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-[16px] border-2 transition-all ${
                !isDark
                  ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--muted)]'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-[12px] font-bold text-center leading-tight">{t('settings.lightMode')}</span>
            </button>
            <button
              type="button"
              onClick={() => { if (!isDark) toggleDark(); }}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-[16px] border-2 transition-all ${
                isDark
                  ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--muted)]'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-[12px] font-bold text-center leading-tight">{t('settings.darkMode')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Preferences ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.preferences')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <button onClick={() => setShowLangPicker(true)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0 pr-2 text-left">
              <p className="text-[14px] font-bold text-[var(--text)]">{t('settings.language')}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{currentLangLabel}</p>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <button onClick={() => setShowCurrencyPicker(true)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0 pr-2 text-left">
              <p className="text-[14px] font-bold text-[var(--text)]">{t('settings.currency')}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{currentCurrencyLabel}</p>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer" onClick={toggleDark}>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[14px] font-bold text-[var(--text)]">{t('settings.darkMode')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={isDark} onChange={toggleDark} className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.notifications')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <SettingToggleRow
            icon={Bell}
            color="bg-blue-50"
            iconColor="text-blue-500"
            label={t('settings.pushNotif')}
            subtext={t('settings.pushNotifDesc')}
            defaultChecked={true}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.dataPrivacy')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <SettingRow icon={Download} color="bg-slate-50" iconColor="text-slate-500" label={t('settings.exportData')} value={t('settings.exportDataDesc')} onClick={() => setShowExportPicker(true)} />
          <SettingRow icon={Upload} color="bg-orange-50" iconColor="text-orange-500" label={t('settings.importData')} value={t('settings.importDataDesc')} onClick={() => showAlert(t('settings.inDevelopment'), t('settings.importDev'), 'info')} />
          <SettingToggleRow icon={Cloud} color="bg-emerald-50" iconColor="text-emerald-500" label={t('settings.autoBackup')} subtext={t('settings.autoBackupDesc')} defaultChecked={true} />
          <SettingRow icon={Trash2} color="bg-rose-50" iconColor="text-rose-500" label={t('settings.deleteAll')} labelColor="text-rose-600" subtext={t('settings.deleteAllDesc')} onClick={handleDeleteAll} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.about')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <SettingRow icon={Shield} color="bg-slate-50" iconColor="text-slate-500" label={t('settings.privacy')} subtext={t('settings.privacyDesc')} />
          {/* <SettingRow icon={Star} color="bg-amber-50" iconColor="text-amber-500" label={t('settings.rate')} /> */}
          <SettingRow 
            icon={Info} 
            color="bg-blue-50" 
            iconColor="text-blue-500" 
            label={t('settings.aboutApp')} 
            onClick={() => showAlert(
              t('settings.miliPhilosophy'),
              t('settings.miliPhilosophyDesc'),
              'info'
            )}
          />
          <SettingRow 
            icon={MessageSquare} 
            color="bg-emerald-50" 
            iconColor="text-emerald-500" 
            label={t('settings.sendFeedback')}
            subtext={t('settings.feedbackSubtext')} 
            onClick={() => setShowFeedbackModal(true)} 
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-3">
        <div className="flex gap-4 text-[11px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
          <button onClick={() => showAlert(t('settings.privacyTitle'), t('settings.privacyPolicy'), 'info')} className="hover:text-[var(--text)] transition-colors">PRIVACY</button>
          <button onClick={() => showAlert(t('settings.termsTitle'), t('settings.termsPolicy'), 'info')} className="hover:text-[var(--text)] transition-colors">TERMS</button>
        </div>
        <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-70">
          &copy; {new Date().getFullYear()} Mili • v2.0.0
        </p>
      </div>

      {showLangPicker && (
        <PickerSheet
          title={t('settings.language')}
          onClose={() => setShowLangPicker(false)}
          options={LANGUAGE_OPTIONS.map(l => ({ value: l.value, label: l.nativeLabel, sublabel: l.label }))}
          selected={language}
          onSelect={(val) => { setLanguage(val as Language); setShowLangPicker(false); }}
        />
      )}

      {showCurrencyPicker && (
        <PickerSheet
          title={t('settings.currency')}
          onClose={() => setShowCurrencyPicker(false)}
          options={CURRENCY_OPTIONS.map(c => ({ value: c.value, label: c.label }))}
          selected={currency}
          onSelect={(val) => { setCurrency(val as Currency); setShowCurrencyPicker(false); }}
        />
      )}

      {showExportPicker && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExportPicker(false)} />
          <div className="relative bg-[var(--card)] rounded-t-[32px] lg:rounded-[32px] w-full max-w-[480px] p-8 animate-slide-up lg:animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[20px] font-bold text-[var(--text)]">Konfigurasi Laporan</h3>
              <button onClick={() => setShowExportPicker(false)} className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-10">
              <button
                onClick={handleExportExcel}
                className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-bold text-[14px] shadow-lg shadow-[var(--accent)]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-[10px]">XLS</div>
                Unduh Excel (.xlsx)
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportPDF}
                  className="py-3 rounded-xl border border-[var(--border)] font-bold text-[13px] hover:bg-[var(--muted)] transition-all flex items-center justify-center gap-2"
                >
                  📄 PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="py-3 rounded-xl border border-[var(--border)] font-bold text-[13px] hover:bg-[var(--muted)] transition-all flex items-center justify-center gap-2"
                >
                  📑 CSV
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[12px] font-bold text-[var(--text-dim)] uppercase tracking-widest px-1">Opsi Laporan</h4>
              
              <div className="flex items-center justify-between p-4 bg-[var(--muted)]/50 rounded-2xl border border-[var(--border)]">
                <div>
                  <p className="text-[14px] font-bold text-[var(--text)]">Rincian Aset</p>
                  <p className="text-[11px] text-[var(--text-dim-2)]">Daftar saldo semua rekening/dompet</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeAssets} 
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeAssets: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--accent)]" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--muted)]/50 rounded-2xl border border-[var(--border)]">
                <div>
                  <p className="text-[14px] font-bold text-[var(--text)]">Rincian Anggaran</p>
                  <p className="text-[11px] text-[var(--text-dim-2)]">Status budget per kategori bulan ini</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeBudgets} 
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeBudgets: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--accent)]" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--muted)]/50 rounded-2xl border border-[var(--border)]">
                <div>
                  <p className="text-[14px] font-bold text-[var(--text)]">Buku Kas (Transaksi)</p>
                  <p className="text-[11px] text-[var(--text-dim-2)]">Daftar lengkap riwayat transaksi</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={exportOptions.includeTransactions} 
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeTransactions: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--accent)]" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center" onClick={() => setShowFeedbackModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-[var(--card)] rounded-t-[24px] lg:rounded-[32px] w-full max-w-[420px] p-6 pb-safe animate-slide-up lg:animate-fade-in lg:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[var(--text)]">Kirim Umpan Balik</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--text-dim)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[12px] font-medium text-[var(--text-dim-2)] mb-4 leading-relaxed">
              Punya ide, saran, atau menemukan bug? Ceritakan kepada kami agar Mili bisa menjadi lebih baik untuk Anda.
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition-all ${star <= rating ? 'text-[#F59E0B] scale-110' : 'text-[var(--border)] hover:text-[#F59E0B]/50'}`}
                >
                  <Star className="w-8 h-8" fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              placeholder={t('settings.feedbackPlaceholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-[14px] font-medium focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all resize-none mb-4 focus:ring-emerald-500/20"
            />

            <button
              onClick={async () => {
                if (!feedback.trim()) return;
                setIsSubmittingFeedback(true);
                try {
                  await feedbacksApi.create({ message: feedback, rating });
                  setShowFeedbackModal(false);
                  setFeedback('');
                  setRating(5);
                  showAlert(t('settings.feedbackSent'), t('settings.feedbackSentDesc'), 'success');
                } catch (error) {
                  showAlert(t('common.error'), t('settings.feedbackError'), 'error');
                } finally {
                  setIsSubmittingFeedback(false);
                }
              }}
              disabled={!feedback.trim() || isSubmittingFeedback}
              className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-bold text-[14px] shadow-lg shadow-[var(--accent)]/15 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmittingFeedback ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmittingFeedback ? t('settings.feedbackSubmitting') : t('settings.feedbackSubmit')}
            </button>
          </div>
        </div>
      )}

      <Alert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        isConfirm={alertConfig.isConfirm}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
}

function SettingRow({ icon: Icon, color, iconColor, label, value, subtext, labelColor, onClick }: {
  icon: React.ElementType; color: string; iconColor: string; label: string;
  value?: string; subtext?: string; labelColor?: string; onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className={`text-[14px] font-bold ${labelColor || 'text-[var(--text)]'}`}>{label}</p>
        {subtext && <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-60">{subtext}</p>}
      </div>
      <div className="flex items-center gap-3">
        {value && <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{value}</p>}
        <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function SettingToggleRow({ icon: Icon, color, iconColor, label, subtext, defaultChecked }: {
  icon: React.ElementType; color: string; iconColor: string; label: string;
  subtext?: string; defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer" onClick={() => setChecked(!checked)}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[14px] font-bold text-[var(--text)]">{label}</p>
        {subtext && <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-60">{subtext}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
      </label>
    </div>
  );
}

function PickerSheet({ title, onClose, options, selected, onSelect }: {
  title: string;
  onClose: () => void;
  options: { value: string; label: string; sublabel?: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--card)] rounded-t-[24px] lg:rounded-[32px] w-full max-w-[420px] p-6 pb-safe animate-slide-up lg:animate-fade-in lg:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--text)]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--text-dim)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left ${
                selected === opt.value
                  ? 'bg-[var(--accent-tint)]'
                  : 'hover:bg-[var(--muted)]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[15px] font-bold ${selected === opt.value ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                  {opt.label}
                </p>
                {opt.sublabel && (
                  <p className="text-[12px] font-medium text-[var(--text-dim-2)] mt-0.5">{opt.sublabel}</p>
                )}
              </div>
              {selected === opt.value && (
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
      `}} />
    </div>
  );
}

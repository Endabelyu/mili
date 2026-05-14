import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
export type Language = 'id' | 'en';
export type Currency = 'IDR' | 'USD' | 'SGD' | 'MYR' | 'JPY';

interface PreferencesContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Currency
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  formatMoney: (amount: number | string, options?: { short?: boolean }) => string;

  // Dark mode
  isDark: boolean;
  toggleDark: () => void;
}

// ─── Translation dictionaries ────────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    'nav.dashboard': 'Dasbor',
    'nav.transactions': 'Transaksi',
    'nav.calendar': 'Kalender',
    'nav.accounts': 'Akun',
    'nav.targets': 'Target',
    'nav.analytics': 'Analitik',
    'nav.budget': 'Anggaran',
    'nav.scheduled': 'Terjadwal',
    'nav.scan': 'Scan Struk',
    'nav.notifications': 'Notifikasi',
    'nav.profile': 'Profil',
    'nav.settings': 'Pengaturan',

    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.edit': 'Edit',
    'common.delete': 'Hapus',
    'common.logout': 'Keluar',
    'common.search': 'Cari transaksi, akun, target...',
    'common.add': 'Tambah',
    'common.viewAll': 'Lihat semua',
    'common.loading': 'Memuat...',

    // Dashboard
    'dashboard.netWorth': 'Kekayaan Bersih',
    'dashboard.cashFlow': 'Arus Kas Bulan Ini',
    'dashboard.income': 'Pemasukan',
    'dashboard.expense': 'Pengeluaran',
    'dashboard.balance': 'Saldo',
    'dashboard.pinnedTargets': 'Target Disematkan',
    'dashboard.topCategories': 'Kategori Teratas',
    'dashboard.upcomingBills': 'Tagihan Mendatang',
    'dashboard.recentTransactions': 'Transaksi Terakhir',
    'dashboard.assets': 'Aset',
    'dashboard.liabilities': 'Kewajiban',

    // Accounts
    'acc.title': 'Akun',
    'acc.netWorth': 'Kekayaan Bersih',
    'acc.assets': 'Aset',
    'acc.liabilities': 'Kewajiban',
    'acc.main': 'Utama',
    'acc.bank': 'Bank',
    'acc.eWallet': 'E-Wallet',
    'acc.cash': 'Tunai',
    'acc.investment': 'Investasi',
    'acc.creditCard': 'Kartu Kredit',
    'acc.addAccount': 'Tambah Akun',
    'acc.editAccount': 'Ubah Akun',
    'acc.saveAccount': 'Simpan Akun',
    'acc.deleteAccount': 'Hapus Akun',
    'acc.accountName': 'Nama Akun',
    'acc.accountType': 'Jenis Akun',
    'acc.initialBalance': 'Saldo Awal',
    'acc.currentBalance': 'Saldo Saat Ini',
    'acc.noAccounts': 'Belum ada akun',
    'acc.noAccountsDesc': 'Tambahkan akun bank, e-wallet, atau aset Anda untuk mulai melacak kekayaan Anda.',
    'acc.deleteConfirm': 'Apakah Anda yakin ingin menghapus akun ini?',
    'acc.setAsDefault': 'Jadikan Akun Utama',
    'acc.setAsDefaultDesc': 'Gunakan akun ini secara otomatis untuk transaksi baru',

    // Targets
    'target.title': 'Target',
    'target.dreamName': 'Nama Impian',
    'target.amount': 'Target Jumlah',
    'target.collected': 'Terkumpul',
    'target.collectedSoFar': 'Terkumpul Saat Ini',
    'target.deadline': 'Tenggat Waktu',
    'target.progress': 'Progres',
    'target.active': 'Aktif',
    'target.completed': 'Selesai',
    'target.activeTab': 'Aktif',
    'target.completedTab': 'Selesai',
    'target.noDeadline': 'Selamanya',
    'target.deleteConfirmTitle': 'Hapus Target?',
    'target.deleteConfirmMessage': 'Apakah Anda yakin ingin menghapus target ini?',
    'target.color': 'Warna',
    'target.addTarget': 'Tambah Target',
    'target.editTarget': 'Edit Target',
    'target.deleteTarget': 'Hapus Target',
    'target.saveTarget': 'Simpan Target',
    'target.noTargets': 'Belum ada target',
    'target.noTargetsDesc': 'Tentukan impian finansial Anda sekarang dan capai perlahan bersama Saku.',
    'target.deleteConfirm': 'Apakah Anda yakin ingin menghapus target ini?',
    'target.pinned': 'Target Disematkan',

    // Transactions
    'txn.daily': 'Harian',
    'txn.monthly': 'Bulanan',
    'txn.monthlyFlow': 'Arus Kas Bulanan',
    'txn.categoryBreakdown': 'Rincian Kategori',
    'txn.newExpense': 'Pengeluaran',
    'txn.newIncome': 'Pemasukan',
    'txn.transfer': 'Transfer',
    'txn.amount': 'Jumlah',
    'txn.account': 'Akun',
    'txn.description': 'Keterangan',
    'txn.descriptionPlaceholder': 'Tambahkan keterangan...',
    'txn.category': 'Kategori',
    'txn.saveTransaction': 'Simpan Transaksi',
    'txn.editTransaction': 'Edit Transaksi',
    'txn.updateTransaction': 'Simpan Perubahan',

    // Analytics
    'analytics.title': 'Analitik',
    'analytics.daily': 'Harian',
    'analytics.categoryRanking': 'Peringkat Kategori',
    'analytics.thisMonth': 'BULAN INI',
    'analytics.categories': 'kategori',

    // Budget
    'budget.title': 'Anggaran',
    'budget.budget': 'Anggaran',
    'budget.remaining': 'Sisa',
    'budget.dailyAvg': 'Rata-rata harian',
    'budget.used': 'terpakai',
    'budget.perCategory': 'Per Kategori',

    // Scheduled
    'scheduled.title': 'Terjadwal',
    'scheduled.subtitle': 'Kelola pengeluaran rutin Anda',
    'scheduled.totalMonthly': 'Total Per Bulan',
    'scheduled.active': 'aktif',
    'scheduled.paused': 'dijeda',
    'scheduled.allSchedules': 'Semua Jadwal',
    'scheduled.addSchedule': 'Tambah Jadwal',
    'scheduled.editSchedule': 'Edit Jadwal',
    'scheduled.deleteSchedule': 'Hapus Jadwal',
    'scheduled.saveSchedule': 'Simpan Jadwal',
    'scheduled.payNow': 'Bayar',
    'scheduled.postConfirm': 'Catat transaksi ini sekarang?',
    'scheduled.frequency': 'Frekuensi',
    'scheduled.startDate': 'Tanggal Mulai Tagihan',
    'scheduled.noSchedules': 'Belum ada jadwal',
    'scheduled.noSchedulesDesc': 'Jadwalkan pengeluaran rutin Anda seperti langganan Netflix, BPJS, atau tagihan listrik.',
    'scheduled.deleteConfirm': 'Apakah Anda yakin ingin menghapus jadwal ini?',
    'scheduled.daily': 'Harian',
    'scheduled.weekly': 'Mingguan',
    'scheduled.monthly': 'Bulanan',
    'scheduled.yearly': 'Tahunan',

    // Profile
    'profile.title': 'Profil',
    'profile.accountInfo': 'Informasi Akun',
    'profile.fullName': 'Nama Lengkap',
    'profile.email': 'Alamat Email',
    'profile.phone': 'Nomor Telepon',
    'profile.security': 'Keamanan',
    'profile.changePassword': 'Ubah Kata Sandi',
    'profile.appPin': 'PIN Aplikasi',
    'profile.twoFactor': 'Verifikasi 2 Langkah',
    'profile.others': 'Lainnya',
    'profile.appSettings': 'Pengaturan Aplikasi',
    'profile.joinedSince': 'Bergabung sejak',

    // Settings
    'settings.title': 'Pengaturan',
    'settings.subtitle': 'Preferensi & konfigurasi aplikasi',
    'settings.appearance': 'Tampilan',
    'settings.appTheme': 'Tema Aplikasi',
    'settings.lightMode': 'Mode Terang',
    'settings.darkMode': 'Mode Gelap',
    'settings.darkModeSoon': 'Mode Gelap (Segera)',
    'settings.preferences': 'Preferensi',
    'settings.language': 'Bahasa',
    'settings.currency': 'Mata Uang',
    'settings.notifications': 'Notifikasi',
    'settings.pushNotif': 'Pemberitahuan Push',
    'settings.pushNotifDesc': 'Pengingat anggaran & ringkasan mingguan',
    'settings.dataPrivacy': 'Data & Privasi',
    'settings.exportData': 'Ekspor Data',
    'settings.exportDataDesc': 'Excel atau PDF',
    'settings.importData': 'Impor Data',
    'settings.importDataDesc': 'Dari bank atau app lain',
    'settings.autoBackup': 'Backup Otomatis',
    'settings.autoBackupDesc': 'Tiap minggu ke cloud',
    'settings.deleteAll': 'Hapus Semua Data',
    'settings.deleteAllDesc': 'Tidak bisa dikembalikan',
    'settings.about': 'Tentang',
    'settings.privacy': 'Privasi & Ketentuan',
    'settings.privacyDesc': 'Baca kebijakan kami',
    'settings.rate': 'Beri Rating',
    'settings.aboutApp': 'Tentang Mili',
    'settings.appVersion': 'Versi Aplikasi',
    'settings.alwaysUpdated': 'Selalu diperbarui',

    // Scan
    'scan.positionReceipt': 'Posisikan struk di dalam bingkai',
    'scan.uploadPhoto': 'Unggah Foto',
    'scan.takePhoto': 'Ambil Foto',

    // Notifications
    'notif.title': 'Notifikasi',
    'notif.unread': 'belum dibaca',
    'notif.markAll': 'Tandai semua',
    'notif.new': 'Baru',
    'notif.previous': 'Sebelumnya',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.calendar': 'Calendar',
    'nav.accounts': 'Accounts',
    'nav.targets': 'Targets',
    'nav.analytics': 'Analytics',
    'nav.budget': 'Budget',
    'nav.scheduled': 'Scheduled',
    'nav.scan': 'Scan Receipt',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.logout': 'Logout',
    'common.search': 'Search transactions, accounts, targets...',
    'common.add': 'Add',
    'common.viewAll': 'View all',
    'common.loading': 'Loading...',

    // Dashboard
    'dashboard.netWorth': 'Net Worth',
    'dashboard.cashFlow': 'Monthly Cash Flow',
    'dashboard.income': 'Income',
    'dashboard.expense': 'Expense',
    'dashboard.balance': 'Balance',
    'dashboard.pinnedTargets': 'Pinned Targets',
    'dashboard.topCategories': 'Top Categories',
    'dashboard.upcomingBills': 'Upcoming Bills',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.assets': 'Assets',
    'dashboard.liabilities': 'Liabilities',

    // Accounts
    'acc.title': 'Accounts',
    'acc.netWorth': 'Net Worth',
    'acc.assets': 'Assets',
    'acc.liabilities': 'Liabilities',
    'acc.main': 'Main',
    'acc.bank': 'Bank',
    'acc.eWallet': 'E-Wallet',
    'acc.cash': 'Cash',
    'acc.investment': 'Investment',
    'acc.creditCard': 'Credit Card',
    'acc.addAccount': 'Add Account',
    'acc.editAccount': 'Edit Account',
    'acc.saveAccount': 'Save Account',
    'acc.deleteAccount': 'Delete Account',
    'acc.accountName': 'Account Name',
    'acc.accountType': 'Account Type',
    'acc.initialBalance': 'Initial Balance',
    'acc.currentBalance': 'Current Balance',
    'acc.noAccounts': 'No accounts yet',
    'acc.noAccountsDesc': 'Add your bank accounts, e-wallets, or assets to start tracking your net worth.',
    'acc.deleteConfirm': 'Are you sure you want to delete this account?',
    'acc.setAsDefault': 'Set as Default',
    'acc.setAsDefaultDesc': 'Automatically use this account for new transactions',

    // Targets
    'target.title': 'Targets',
    'target.dreamName': 'Dream Name',
    'target.amount': 'Target Amount',
    'target.collected': 'Collected',
    'target.collectedSoFar': 'Collected So Far',
    'target.deadline': 'Deadline',
    'target.progress': 'Progress',
    'target.active': 'Active',
    'target.completed': 'Completed',
    'target.activeTab': 'Active',
    'target.completedTab': 'Completed',
    'target.noDeadline': 'Forever',
    'target.deleteConfirmTitle': 'Delete Target?',
    'target.deleteConfirmMessage': 'Are you sure you want to delete this target?',
    'target.color': 'Color',
    'target.addTarget': 'Add Target',
    'target.editTarget': 'Edit Target',
    'target.deleteTarget': 'Delete Target',
    'target.saveTarget': 'Save Target',
    'target.noTargets': 'No targets yet',
    'target.noTargetsDesc': 'Set your financial dreams now and achieve them slowly with Saku.',
    'target.deleteConfirm': 'Are you sure you want to delete this target?',
    'target.pinned': 'Pinned Targets',

    // Transactions
    'txn.daily': 'Daily',
    'txn.monthly': 'Monthly',
    'txn.monthlyFlow': 'Monthly Cash Flow',
    'txn.categoryBreakdown': 'Category Breakdown',
    'txn.newExpense': 'Expense',
    'txn.newIncome': 'Income',
    'txn.transfer': 'Transfer',
    'txn.amount': 'Amount',
    'txn.account': 'Account',
    'txn.description': 'Description',
    'txn.descriptionPlaceholder': 'Add a description...',
    'txn.category': 'Category',
    'txn.saveTransaction': 'Save Transaction',
    'txn.editTransaction': 'Edit Transaction',
    'txn.updateTransaction': 'Save Changes',

    // Analytics
    'analytics.title': 'Analytics',
    'analytics.daily': 'Daily',
    'analytics.categoryRanking': 'Category Ranking',
    'analytics.thisMonth': 'THIS MONTH',
    'analytics.categories': 'categories',

    // Budget
    'budget.title': 'Budget',
    'budget.budget': 'Budget',
    'budget.remaining': 'Remaining',
    'budget.dailyAvg': 'Daily average',
    'budget.used': 'used',
    'budget.perCategory': 'Per Category',

    // Scheduled
    'scheduled.title': 'Scheduled',
    'scheduled.subtitle': 'Manage your recurring expenses',
    'scheduled.totalMonthly': 'Total Per Month',
    'scheduled.active': 'active',
    'scheduled.paused': 'paused',
    'scheduled.allSchedules': 'All Schedules',
    'scheduled.addSchedule': 'Add Schedule',
    'scheduled.editSchedule': 'Edit Schedule',
    'scheduled.deleteSchedule': 'Delete Schedule',
    'scheduled.saveSchedule': 'Save Schedule',
    'scheduled.payNow': 'Pay',
    'scheduled.postConfirm': 'Post this transaction now?',
    'scheduled.frequency': 'Frequency',
    'scheduled.startDate': 'Start Date',
    'scheduled.noSchedules': 'No schedules yet',
    'scheduled.noSchedulesDesc': 'Schedule your recurring expenses like Netflix, BPJS, or electricity bills.',
    'scheduled.deleteConfirm': 'Are you sure you want to delete this schedule?',
    'scheduled.daily': 'Daily',
    'scheduled.weekly': 'Weekly',
    'scheduled.monthly': 'Monthly',
    'scheduled.yearly': 'Yearly',

    // Profile
    'profile.title': 'Profile',
    'profile.accountInfo': 'Account Info',
    'profile.fullName': 'Full Name',
    'profile.email': 'Email Address',
    'profile.phone': 'Phone Number',
    'profile.security': 'Security',
    'profile.changePassword': 'Change Password',
    'profile.appPin': 'App PIN',
    'profile.twoFactor': '2-Factor Verification',
    'profile.others': 'Others',
    'profile.appSettings': 'App Settings',
    'profile.joinedSince': 'Joined since',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'App preferences & configuration',
    'settings.appearance': 'Appearance',
    'settings.appTheme': 'App Theme',
    'settings.lightMode': 'Light Mode',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeSoon': 'Dark Mode (Soon)',
    'settings.preferences': 'Preferences',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.notifications': 'Notifications',
    'settings.pushNotif': 'Push Notifications',
    'settings.pushNotifDesc': 'Budget reminders & weekly summaries',
    'settings.dataPrivacy': 'Data & Privacy',
    'settings.exportData': 'Export Data',
    'settings.exportDataDesc': 'Excel or PDF',
    'settings.importData': 'Import Data',
    'settings.importDataDesc': 'From banks or other apps',
    'settings.autoBackup': 'Auto Backup',
    'settings.autoBackupDesc': 'Weekly to cloud',
    'settings.deleteAll': 'Delete All Data',
    'settings.deleteAllDesc': 'Cannot be undone',
    'settings.about': 'About',
    'settings.privacy': 'Privacy & Terms',
    'settings.privacyDesc': 'Read our policies',
    'settings.rate': 'Rate App',
    'settings.aboutApp': 'About Mili',
    'settings.appVersion': 'App Version',
    'settings.alwaysUpdated': 'Always up to date',

    // Scan
    'scan.positionReceipt': 'Position the receipt in the frame',
    'scan.uploadPhoto': 'Upload Photo',
    'scan.takePhoto': 'Take Photo',

    // Notifications
    'notif.title': 'Notifications',
    'notif.unread': 'unread',
    'notif.markAll': 'Mark all',
    'notif.new': 'New',
    'notif.previous': 'Previous',
  },
};

// ─── Currency config ─────────────────────────────────────────────────────────
const CURRENCY_CONFIG: Record<Currency, { locale: string; label: string; symbol: string }> = {
  IDR: { locale: 'id-ID', label: 'Rupiah (Rp)', symbol: 'Rp' },
  USD: { locale: 'en-US', label: 'US Dollar ($)', symbol: '$' },
  SGD: { locale: 'en-SG', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  MYR: { locale: 'ms-MY', label: 'Ringgit (RM)', symbol: 'RM' },
  JPY: { locale: 'ja-JP', label: 'Yen (¥)', symbol: '¥' },
};

export const LANGUAGE_OPTIONS: { value: Language; label: string; nativeLabel: string }[] = [
  { value: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { value: 'en', label: 'English', nativeLabel: 'English' },
];

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'IDR', label: 'Rupiah (Rp)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'SGD', label: 'Singapore Dollar (S$)' },
  { value: 'MYR', label: 'Ringgit (RM)' },
  { value: 'JPY', label: 'Yen (¥)' },
];

// ─── Storage keys ────────────────────────────────────────────────────────────
const LANG_KEY = 'mili-language';
const CURRENCY_KEY = 'mili-currency';
const DARK_KEY = 'mili-dark-mode';

// ─── Context ─────────────────────────────────────────────────────────────────
const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'id';
    return (localStorage.getItem(LANG_KEY) as Language) || 'id';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === 'undefined') return 'IDR';
    return (localStorage.getItem(CURRENCY_KEY) as Currency) || 'IDR';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DARK_KEY) === 'true';
  });

  // ── Language ──
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  // ── Currency ──
  const setCurrency = useCallback((cur: Currency) => {
    setCurrencyState(cur);
    localStorage.setItem(CURRENCY_KEY, cur);
  }, []);

  // ── Dark Mode ──
  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(DARK_KEY, String(next));
      if (next) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      return next;
    });
  }, []);

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.lang = language;
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  // ── Translation function ──
  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations['id']?.[key] || key;
  }, [language]);

  // ── Currency formatter ──
  const formatMoney = useCallback((amount: number | string, options?: { short?: boolean }): string => {
    let num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) num = 0;

    const config = CURRENCY_CONFIG[currency];
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    const isShort = options?.short ?? true;

    if (currency === 'IDR' && isShort) {
      if (absNum >= 1_000_000_000_000) {
        return `${sign}Rp ${(absNum / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} T`;
      }
      if (absNum >= 1_000_000_000) {
        return `${sign}Rp ${(absNum / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
      }
      if (absNum >= 1_000_000) {
        return `${sign}Rp ${(absNum / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
      }
    } else if (currency !== 'IDR' && isShort) {
      if (absNum >= 1_000_000_000_000) {
        return `${sign}${config.symbol}${(absNum / 1_000_000_000_000).toLocaleString(config.locale, { maximumFractionDigits: 1 })}T`;
      }
      if (absNum >= 1_000_000_000) {
        return `${sign}${config.symbol}${(absNum / 1_000_000_000).toLocaleString(config.locale, { maximumFractionDigits: 1 })}B`;
      }
      if (absNum >= 1_000_000) {
        return `${sign}${config.symbol}${(absNum / 1_000_000).toLocaleString(config.locale, { maximumFractionDigits: 1 })}M`;
      }
    }

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }, [currency]);

  return (
    <PreferencesContext.Provider value={{
      language, setLanguage, t,
      currency, setCurrency, formatMoney,
      isDark, toggleDark,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}

// Re-export configs for use in Settings page
export { CURRENCY_CONFIG };

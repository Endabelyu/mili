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
    'common.saving': 'Menyimpan...',
    'common.color': 'Warna',
    'common.success': 'Berhasil',
    'common.error': 'Gagal',
    'accounts.createSuccess': 'Akun berhasil ditambahkan.',
    'accounts.createError': 'Gagal menambahkan akun. Silakan coba lagi.',
    'accounts.updateSuccess': 'Akun berhasil diperbarui.',
    'accounts.updateError': 'Gagal memperbarui akun. Silakan coba lagi.',
    'accounts.deleteSuccess': 'Akun berhasil dihapus.',
    'accounts.deleteError': 'Gagal menghapus akun. Silakan coba lagi.',

    // Dashboard
    'dashboard.netWorth': 'Kekayaan Bersih',
    'dashboard.cashFlow': 'Arus Kas Bulan Ini',
    'dashboard.income': 'Pemasukan',
    'dashboard.expense': 'Pengeluaran',
    'dashboard.balance': 'Saldo',
    'dashboard.pinnedTargets': 'Target Disematkan',
    'dashboard.topCategories': 'Kategori Teratas',
    'dashboard.upcomingBills': 'Transaksi Terjadwal',
    'dashboard.recentTransactions': 'Transaksi Terakhir',
    'dashboard.assets': 'Aset',
    'dashboard.liabilities': 'Kewajiban',
    'dashboard.noTargets': 'Belum ada target',
    'dashboard.noTargetsDesc': 'Mulai tentukan mimpi finansial Anda sekarang.',
    'dashboard.noBudgets': 'Belum ada anggaran',
    'dashboard.noBudgetsDesc': 'Buat anggaran per kategori untuk mengontrol belanja.',
    'dashboard.noExpenseData': 'Belum ada data pengeluaran',
    'dashboard.noExpenseDataDesc': 'Catat pengeluaran untuk melihat kategori teratas.',
    'dashboard.noScheduled': 'Belum ada transaksi terjadwal',
    'dashboard.noScheduledDesc': 'Tambahkan transaksi terjadwal.',
    'dashboard.noTransactions': 'Belum ada transaksi',
    'dashboard.pinnedBudgets': 'Anggaran Disematkan',

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
    'target.updateTarget': 'Perbarui Target',
    'target.noTargets': 'Belum ada target',
    'target.noTargetsDesc': 'Tentukan impian finansial Anda sekarang dan capai perlahan bersama Mili.',
    'target.deleteConfirm': 'Apakah Anda yakin ingin menghapus target ini?',
    'target.pinned': 'Target Disematkan',
    'target.linkedAccount': 'Tautkan ke Kantong',
    'target.linkedAccountDesc': 'Progres otomatis dari saldo kantong yang dipilih',
    'target.pinToDashboard': 'Sematkan ke Dashboard',
    'target.pinToDashboardDesc': 'Tampilkan target ini di halaman utama',

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
    'transactions.noTransactionsDesc': 'Mulai catat pengeluaran dan pemasukan Anda',

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
    'budget.noBudgets': 'Belum ada anggaran',
    'budget.noBudgetsDesc': 'Buat anggaran untuk memantau pengeluaran Anda per kategori setiap bulannya.',
    'budget.setFirstBudget': 'Set Anggaran Pertama',
    'budget.editBudget': 'Edit Anggaran',
    'budget.addBudget': 'Tambah Anggaran',
    'budget.deleteBudget': 'Hapus Anggaran?',
    'budget.deleteConfirm': 'Anda yakin ingin menghapus anggaran untuk kategori ini?',
    'txn.deleteTransaction': 'Hapus Transaksi?',
    'txn.deleteConfirm': 'Anda yakin ingin menghapus transaksi ini?',
    'auth.sending': 'Mengirim...',
    'auth.sendResetLink': 'Kirim Tautan Reset',
    'profile.saveChanges': 'Simpan Perubahan',
    'profile.saved': 'Tersimpan!',
    'profile.twoFAActive': 'Aktif · 6 digit',
    'profile.active': 'Aktif',
    'profile.inactive': 'Belum aktif',
    'profile.enable2FA': 'Aktifkan 2FA?',
    'profile.enable2FADesc': 'Aktifkan Verifikasi 2 Langkah untuk keamanan tambahan?',
    'scheduled.saveError': 'Gagal menyimpan jadwal',
    'scheduled.updateError': 'Gagal memperbarui jadwal',
    'scheduled.deleteError': 'Gagal menghapus jadwal',
    'scheduled.postError': 'Gagal memposting transaksi',
    'notifications.title': 'Notifikasi',
    'notifications.unread': 'belum dibaca',
    'notifications.markAll': 'Tandai semua dibaca',
    'notifications.new': 'Baru',
    'notifications.noNew': 'Tidak ada notifikasi baru',
    'notifications.previous': 'Sebelumnya',

    'calendar.noTransactions': 'Tidak ada transaksi di bulan ini',
    'reports.noData': 'Belum ada data',
    'reports.noCashFlow': 'Belum ada arus kas yang tercatat bulan ini. Mari mulai mencatat untuk melihat alur rezeki Anda.',
    'reports.cashFlowExpense': 'pengeluaran',
    'reports.cashFlowIncome': 'pemasukan',
    'reports.cashFlowHigh': 'deras',
    'reports.cashFlowNormal': 'stabil',
    'reports.cashFlowSuffix': 'Anda bulan ini terlihat',
    'reports.cashFlowTip': 'Mari pastikan semuanya tetap bermuara pada tabungan.',

    // Scheduled
    'scheduled.title': 'Terjadwal',
    'scheduled.subtitle': 'Kelola transaksi terjadwal Anda',
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
    'scheduled.startDate': 'Tanggal Mulai',
    'scheduled.startDateBill': 'Tanggal Mulai Tagihan',
    'scheduled.noSchedules': 'Belum ada jadwal',
    'scheduled.noSchedulesDesc': 'Jadwalkan transaksi Anda seperti pemasukan bulanan, langganan Netflix, BPJS, atau tagihan listrik.',
    'scheduled.noActiveSchedules': 'Tidak ada jadwal yang aktif',
    'scheduled.noPausedSchedules': 'Tidak ada jadwal yang dijeda',
    'scheduled.deleteConfirm': 'Apakah Anda yakin ingin menghapus jadwal ini?',
    'scheduled.dueDate': 'Jatuh tempo',
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
    'settings.deleteAllTitle': 'Hapus Semua Data?',
    'settings.deleteAllConfirm': 'Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak bisa dibatalkan.',
    'settings.deleteAllSuccess': 'Data sedang diproses untuk dihapus...',
    'settings.feedbackSent': 'Umpan Balik Terkirim',
    'settings.feedbackSentDesc': 'Terima kasih atas saran dan masukan Anda. Kami sangat menghargainya!',
    'settings.feedbackError': 'Gagal mengirim umpan balik. Silakan coba lagi.',
    'settings.exportSuccess': 'Data berhasil diekspor.',
    'settings.exportError': 'Terjadi kesalahan saat mengekspor data. Silakan coba lagi.',
    'settings.exportNoData': 'Tidak ada data transaksi untuk diekspor.',
    'settings.exportFailed': 'Gagal Ekspor',
    'settings.popupBlocked': 'Blokir Pop-up',
    'settings.popupBlockedDesc': 'Mohon izinkan pop-up untuk mengunduh PDF.',
    'settings.importDev': 'Fitur Impor Data sedang dalam tahap pengembangan.',
    'settings.inDevelopment': 'Dalam Pengembangan',
    'settings.privacyPolicy': 'Kebijakan privasi Mili.',
    'settings.termsPolicy': 'Syarat & ketentuan layanan Mili.',
    'settings.privacyTitle': 'Privasi',
    'settings.termsTitle': 'Syarat',
    'settings.sendFeedback': 'Kirim Umpan Balik',
    'settings.feedbackSubtext': 'Beri masukan, saran, atau laporkan bug',
    'settings.feedbackPlaceholder': 'Tulis pesan atau masukan Anda di sini...',
    'settings.feedbackSubmitting': 'Mengirim...',
    'settings.feedbackSubmit': 'Kirim Masukan',
    'settings.miliPhilosophy': 'Filosofi Mili',
    'settings.miliPhilosophyDesc': 'Mili berasal dari bahasa Jawa yang artinya "mengalir" — sering muncul dalam frasa "banyu mili" (air mengalir). Dalam budaya Jawa, ini adalah simbol rezeki yang terus mengalir tanpa henti — tidak dipaksakan, tidak dibendung, tapi bergerak alami menuju tempatnya.',
    'settings.reportTitle': 'Laporan Keuangan',
    'settings.reportFor': 'Laporan Untuk',
    'settings.accountName': 'Nama Akun',
    'settings.accountType': 'Tipe',
    'settings.balance': 'Saldo',
    'settings.description': 'Keterangan',
    'settings.amount': 'Jumlah',
    'settings.totalIncome': 'Total Pemasukan',
    'settings.totalExpense': 'Total Pengeluaran',
    'settings.netBalance': 'Saldo Bersih',
    'settings.category': 'Kategori',
    'settings.limit': 'Batas',
    'settings.used': 'Terpakai',
    'settings.percentage': 'Persentase',
    'settings.date': 'Tanggal',
    'settings.incoming': 'Masuk',
    'settings.outgoing': 'Keluar',
    'settings.income': 'Pemasukan',
    'settings.expense': 'Pengeluaran',
    'settings.docGenerated': 'Dokumen ini sah dihasilkan oleh Mili System',
    'settings.consolidatedReport': 'LAPORAN KEUANGAN KONSOLIDASI',
    'settings.period': 'Periode',
    'settings.totalWealth': 'TOTAL KEKAYAAN (ASET)',
    'settings.assetSummary': 'RINGKASAN ASET & SALDO',
    'settings.cashFlowSummary': 'RINGKASAN ARUS KAS',
    'settings.budgetMonitoring': 'PEMANTAUAN ANGGARAN',
    'settings.ledgerDetail': 'RINCIAN BUKU KAS',
    'scan.readError': 'Gagal membaca struk. Coba foto yang lebih jelas.',
    'scan.aiLimitReached': 'Batas Scan AI harian tercapai. Gunakan Scan Gratis.',
    'auth.registerFailed': 'Gagal mendaftar. Email mungkin sudah digunakan.',
    'auth.forgotPasswordFailed': 'Gagal mengirim email reset kata sandi',

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
    'common.saving': 'Saving...',
    'common.color': 'Color',
    'common.success': 'Success',
    'common.error': 'Error',
    'accounts.createSuccess': 'Account added successfully.',
    'accounts.createError': 'Failed to add account. Please try again.',
    'accounts.updateSuccess': 'Account updated successfully.',
    'accounts.updateError': 'Failed to update account. Please try again.',
    'accounts.deleteSuccess': 'Account deleted successfully.',
    'accounts.deleteError': 'Failed to delete account. Please try again.',

    // Dashboard
    'dashboard.netWorth': 'Net Worth',
    'dashboard.cashFlow': 'Monthly Cash Flow',
    'dashboard.income': 'Income',
    'dashboard.expense': 'Expense',
    'dashboard.balance': 'Balance',
    'dashboard.pinnedTargets': 'Pinned Targets',
    'dashboard.topCategories': 'Top Categories',
    'dashboard.upcomingBills': 'Scheduled Transactions',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.assets': 'Assets',
    'dashboard.liabilities': 'Liabilities',
    'dashboard.noTargets': 'No targets yet',
    'dashboard.noTargetsDesc': 'Start setting your financial goals now.',
    'dashboard.noBudgets': 'No budgets yet',
    'dashboard.noBudgetsDesc': 'Create category budgets to control your spending.',
    'dashboard.noExpenseData': 'No expense data yet',
    'dashboard.noExpenseDataDesc': 'Log expenses to see top categories.',
    'dashboard.noScheduled': 'No scheduled transactions yet',
    'dashboard.noScheduledDesc': 'Add a scheduled transaction.',
    'dashboard.noTransactions': 'No transactions yet',
    'dashboard.pinnedBudgets': 'Pinned Budgets',
    'target.linkedAccount': 'Link to Account',
    'target.linkedAccountDesc': 'Progress auto-calculated from selected account balance',
    'target.pinToDashboard': 'Pin to Dashboard',
    'target.pinToDashboardDesc': 'Show this target on the home screen',

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
    'target.updateTarget': 'Update Target',
    'target.noTargets': 'No targets yet',
    'target.noTargetsDesc': 'Set your financial dreams now and achieve them slowly with Mili.',
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
    'transactions.noTransactionsDesc': 'Start recording your expenses and income',

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
    'budget.noBudgets': 'No budgets yet',
    'budget.noBudgetsDesc': 'Create budgets to track your spending per category each month.',
    'budget.setFirstBudget': 'Set First Budget',
    'budget.editBudget': 'Edit Budget',
    'budget.addBudget': 'Add Budget',
    'budget.deleteBudget': 'Delete Budget?',
    'budget.deleteConfirm': 'Are you sure you want to delete the budget for this category?',
    'txn.deleteTransaction': 'Delete Transaction?',
    'txn.deleteConfirm': 'Are you sure you want to delete this transaction?',
    'auth.sending': 'Sending...',
    'auth.sendResetLink': 'Send Reset Link',
    'profile.saveChanges': 'Save Changes',
    'profile.saved': 'Saved!',
    'profile.twoFAActive': 'Active · 6 digits',
    'profile.active': 'Active',
    'profile.inactive': 'Inactive',
    'profile.enable2FA': 'Enable 2FA?',
    'profile.enable2FADesc': 'Enable Two-Step Verification for extra security?',
    'notifications.title': 'Notifications',
    'notifications.unread': 'unread',
    'notifications.markAll': 'Mark all as read',
    'notifications.new': 'New',
    'notifications.noNew': 'No new notifications',
    'notifications.previous': 'Previous',

    'scheduled.saveError': 'Failed to save schedule',
    'scheduled.updateError': 'Failed to update schedule',
    'scheduled.deleteError': 'Failed to delete schedule',
    'scheduled.postError': 'Failed to post transaction',
    'calendar.noTransactions': 'No transactions this month',
    'reports.noData': 'No data yet',
    'reports.noCashFlow': 'No cash flow recorded this month. Start logging to see your financial flow.',
    'reports.cashFlowExpense': 'expense',
    'reports.cashFlowIncome': 'income',
    'reports.cashFlowHigh': 'strong',
    'reports.cashFlowNormal': 'stable',
    'reports.cashFlowSuffix': 'flow this month looks',
    'reports.cashFlowTip': 'Make sure it all flows toward your savings.',

    // Scheduled
    'scheduled.title': 'Scheduled',
    'scheduled.subtitle': 'Manage your scheduled transactions',
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
    'scheduled.startDateBill': 'Bill Start Date',
    'scheduled.noSchedules': 'No schedules yet',
    'scheduled.noSchedulesDesc': 'Schedule your transactions like monthly income, Netflix, BPJS, or electricity bills.',
    'scheduled.noActiveSchedules': 'No active schedules',
    'scheduled.noPausedSchedules': 'No paused schedules',
    'scheduled.deleteConfirm': 'Are you sure you want to delete this schedule?',
    'scheduled.dueDate': 'Due',
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
    'settings.deleteAllTitle': 'Delete All Data?',
    'settings.deleteAllConfirm': 'Are you sure you want to delete all data? This action cannot be undone.',
    'settings.deleteAllSuccess': 'Data is being processed for deletion...',
    'settings.feedbackSent': 'Feedback Sent',
    'settings.feedbackSentDesc': 'Thank you for your feedback. We really appreciate it!',
    'settings.feedbackError': 'Failed to send feedback. Please try again.',
    'settings.exportSuccess': 'Data exported successfully.',
    'settings.exportError': 'An error occurred while exporting data. Please try again.',
    'settings.exportNoData': 'No transaction data to export.',
    'settings.exportFailed': 'Export Failed',
    'settings.popupBlocked': 'Pop-up Blocked',
    'settings.popupBlockedDesc': 'Please allow pop-ups to download PDF.',
    'settings.importDev': 'Import Data feature is under development.',
    'settings.inDevelopment': 'In Development',
    'settings.privacyPolicy': 'Mili privacy policy.',
    'settings.termsPolicy': 'Mili terms & conditions.',
    'settings.privacyTitle': 'Privacy',
    'settings.termsTitle': 'Terms',
    'settings.sendFeedback': 'Send Feedback',
    'settings.feedbackSubtext': 'Give suggestions, feedback, or report bugs',
    'settings.feedbackPlaceholder': 'Write your message or feedback here...',
    'settings.feedbackSubmitting': 'Sending...',
    'settings.feedbackSubmit': 'Submit Feedback',
    'settings.miliPhilosophy': 'Mili Philosophy',
    'settings.miliPhilosophyDesc': 'Mili comes from the Javanese word meaning "to flow" — often found in the phrase "banyu mili" (flowing water). In Javanese culture, it symbolizes blessings that flow endlessly — not forced, not dammed, but moving naturally to where it belongs.',
    'settings.reportTitle': 'Financial Report',
    'settings.reportFor': 'Report For',
    'settings.accountName': 'Account Name',
    'settings.accountType': 'Type',
    'settings.balance': 'Balance',
    'settings.description': 'Description',
    'settings.amount': 'Amount',
    'settings.totalIncome': 'Total Income',
    'settings.totalExpense': 'Total Expense',
    'settings.netBalance': 'Net Balance',
    'settings.category': 'Category',
    'settings.limit': 'Limit',
    'settings.used': 'Used',
    'settings.percentage': 'Percentage',
    'settings.date': 'Date',
    'settings.incoming': 'In',
    'settings.outgoing': 'Out',
    'settings.income': 'Income',
    'settings.expense': 'Expense',
    'settings.docGenerated': 'This document was generated by Mili System',
    'settings.consolidatedReport': 'CONSOLIDATED FINANCIAL REPORT',
    'settings.period': 'Period',
    'settings.totalWealth': 'TOTAL WEALTH (ASSETS)',
    'settings.assetSummary': 'ASSET & BALANCE SUMMARY',
    'settings.cashFlowSummary': 'CASH FLOW SUMMARY',
    'settings.budgetMonitoring': 'BUDGET MONITORING',
    'settings.ledgerDetail': 'TRANSACTION LEDGER',
    'scan.readError': 'Failed to read receipt. Try a clearer photo.',
    'scan.aiLimitReached': 'Daily AI Scan limit reached. Use Free Scan.',
    'auth.registerFailed': 'Registration failed. Email may already be in use.',
    'auth.forgotPasswordFailed': 'Failed to send password reset email',

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
    const isShort = options?.short ?? false;

    if (currency !== 'IDR' && isShort) {
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

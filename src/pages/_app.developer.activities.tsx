import { useState, useEffect } from 'react';
import { Activity, Search, Filter, Ban, Clock, User, ChevronDown } from 'lucide-react';
import { analyticsApi } from '../api/client';
import type { ActivityLogItem } from '../api/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE_TRANSACTION: { label: 'Buat Transaksi', color: '#12B76A' },
  UPDATE_TRANSACTION: { label: 'Edit Transaksi', color: '#F79009' },
  DELETE_TRANSACTION: { label: 'Hapus Transaksi', color: '#F04438' },
  UPSERT_BUDGET: { label: 'Set Budget', color: '#6172F3' },
  UPDATE_BUDGET: { label: 'Edit Budget', color: '#F79009' },
  DELETE_BUDGET: { label: 'Hapus Budget', color: '#F04438' },
  SUBMIT_FEEDBACK: { label: 'Kirim Feedback', color: '#0BA5EC' },
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

export default function DeveloperActivitiesPage() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [actionFilter]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.activities(actionFilter || undefined);
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Yakin ingin toggle ban user ini?')) return;
    try {
      await analyticsApi.ban(userId);
      fetchActivities();
    } catch (err) {
      console.error('Failed to ban user', err);
    }
  };

  const filteredActivities = activities.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = item.user.name || '';
    const email = item.user.email || '';
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  const getActionBadge = (action: string) => {
    const info = ACTION_LABELS[action] || { label: action, color: '#667085' };
    return (
      <span
        style={{ 
          background: `${info.color}18`, 
          color: info.color, 
          border: `1px solid ${info.color}40` 
        }}
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      >
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          <Activity className="inline-block w-6 h-6 mr-2 -mt-1 text-[var(--accent)]" />
          Log Aktivitas
        </h1>
        <p className="text-sm text-[var(--text-dim)] mt-1">
          Pantau semua aktivitas pengguna di sistem.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            type="text"
            placeholder="Cari user atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>

        {/* Action Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
          >
            <Filter className="w-4 h-4 text-[var(--text-dim)]" />
            {actionFilter ? ACTION_LABELS[actionFilter]?.label || actionFilter : 'Semua Aksi'}
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
          </button>
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl py-1 max-h-64 overflow-y-auto">
              <button
                onClick={() => { setActionFilter(''); setShowFilterDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--card-hover)] transition-colors ${!actionFilter ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text)]'}`}
              >
                Semua Aksi
              </button>
              {ALL_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => { setActionFilter(action); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2 ${actionFilter === action ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text)]'}`}
                >
                  {getActionBadge(action)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-[var(--text-dim)]">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full mr-3" />
            Memuat log aktivitas...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-dim)]">
            <Activity className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Belum ada aktivitas</p>
            <p className="text-xs mt-1">Log akan muncul saat pengguna melakukan aksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Waktu</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Aksi</th>
                  <th className="text-left px-4 py-3 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Deskripsi</th>
                  <th className="text-center px-4 py-3 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--card-hover)] transition-colors">
                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[var(--text-dim)]">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs" title={dayjs(item.createdAt).format('DD MMM YYYY HH:mm:ss')}>
                          {dayjs(item.createdAt).fromNow()}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[var(--text)] font-medium text-xs truncate max-w-[120px]">
                            {item.user.name || 'Tanpa Nama'}
                          </p>
                          <p className="text-[var(--text-dim)] text-[10px] truncate max-w-[120px]">
                            {item.user.email}
                          </p>
                        </div>
                        {item.user.banned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-semibold">
                            BANNED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-4 py-3">
                      {getActionBadge(item.action)}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3">
                      <p className="text-[var(--text)] text-xs max-w-[250px] truncate" title={item.description}>
                        {item.description}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      {item.user.role !== 'developer' && (
                        <button
                          onClick={() => handleBan(item.user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.user.banned 
                              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                          }`}
                          title={item.user.banned ? 'Unban user' : 'Ban user'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats footer */}
      {!isLoading && filteredActivities.length > 0 && (
        <p className="text-xs text-[var(--text-dim)] text-center">
          Menampilkan {filteredActivities.length} dari {activities.length} log aktivitas
        </p>
      )}
    </div>
  );
}

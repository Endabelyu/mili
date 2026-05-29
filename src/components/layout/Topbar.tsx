import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Scan, 
  Bell, 
  Plus, 
  Zap, 
  Coffee, 
  Target, 
  Wallet, 
  Activity, 
  ShoppingBag, 
  Youtube,
  ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/client';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Coffee,
  Target,
  Shopping: ShoppingBag,
  Salary: Wallet,
  Activity,
  Youtube
};

export function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const isDeveloper = user?.email === 'endabelyuproject@gmail.com';

  const debouncedSearch = useDebounce(searchQuery, 400);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  useEffect(() => {
    // Only navigate if there is a query, or if the query was cleared but we are already on the transactions page searching
    if (debouncedSearch) {
      navigate(`/transactions?search=${encodeURIComponent(debouncedSearch)}`);
    } else if (debouncedSearch === '' && window.location.pathname === '/transactions' && window.location.search.includes('search=')) {
      navigate('/transactions');
    }
  }, [debouncedSearch, navigate]);



  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => {},
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => {},
  });

  const hasUnread = notifications.some(n => n.unread);

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      meta: true,
      handler: () => searchInputRef.current?.focus(),
    },
    {
      key: 'p',
      ctrl: true,
      meta: true,
      handler: () => navigate('?new_transaction=true'),
    }
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] sm:bg-[var(--card)] px-4 md:px-8">
      {/* Search Bar */}
      <div className="relative w-full max-w-[140px] sm:max-w-[480px]">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[var(--text-dim-2)]" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isMac ? '⌘K Cari...' : 'Ctrl+K Cari...'}
          className="block w-full rounded-[10px] border border-[var(--border)] bg-[var(--muted)] py-2.5 pl-10 pr-4 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim-2)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1">
          <Link to="/calendar" aria-label="Kalender" className="hidden sm:block"><TopbarButton icon={Calendar} label="Kalender" /></Link>
          <Link to="?scan=true" aria-label="Scan Struk" className="hidden sm:block">
            <TopbarButton icon={Scan} label="Scan Struk" />
          </Link>

          {isDeveloper && (
            <Link to="/developer/feedbacks" aria-label="Developer Feedbacks">
              <TopbarButton icon={ShieldAlert} label="Developer Feedbacks" />
            </Link>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <div onClick={() => setNotifOpen(!notifOpen)}>
              <TopbarButton icon={Bell} badge={hasUnread} label="Notifikasi" />
            </div>

            {notifOpen && (
              <div className="absolute -right-1 sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                  <span className="text-[14px] font-bold text-[var(--text)]">Notifikasi</span>
                  <span 
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[11px] font-bold text-[#15803D] cursor-pointer hover:underline"
                  >
                    Tandai semua
                  </span>
                </div>

                <div className="divide-y divide-[var(--border)] max-h-[320px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => { 
                        if (notif.unread) markReadMutation.mutate(notif.id);
                        setNotifOpen(false); 
                        navigate('/notifications'); 
                      }}
                      className="flex items-start gap-3 p-4 hover:bg-[var(--muted)] transition-colors cursor-pointer relative"
                    >
                      <div className={`w-9 h-9 rounded-xl ${notif.color} flex items-center justify-center shrink-0`}>
                        {(() => {
                          const Icon = ICON_MAP[notif.icon] || Bell;
                          return <Icon className={`w-4 h-4 ${notif.iconColor}`} />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-[13px] font-bold text-[var(--text)] leading-tight">{notif.title}</p>
                        <p className="text-[11px] font-medium text-[var(--text-dim-2)] mt-1">{notif.amount}</p>
                        <p className="text-[10px] font-bold text-[var(--text-dim-2)] opacity-60 mt-1 uppercase tracking-wider">{notif.time}</p>
                      </div>
                      {notif.unread && (
                        <div className="w-2 h-2 rounded-full bg-[#15803D] mt-2 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[var(--muted)] border-t border-[var(--border)] text-center">
                  <Link 
                    to="/notifications" 
                    onClick={() => setNotifOpen(false)}
                    className="text-[12px] font-bold text-[#15803D] hover:underline"
                  >
                    Liat semua notifikasi
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="hidden sm:block">
          <Link to="?add_options=true" title={isMac ? '⌘P' : 'Ctrl+P'}>
            <Button variant="primary" className="gap-2 px-3 md:px-5 font-bold bg-[var(--accent)] hover:bg-[var(--accent)]/90">
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">Tambah</span>
              <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/80">
                {isMac ? '⌘P' : 'P'}
              </kbd>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function TopbarButton({ icon: Icon, badge, label }: { icon: React.ElementType; badge?: boolean; label: string }) {
  return (
    <button 
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--muted)] text-[var(--text)] transition-colors hover:bg-[var(--muted-2)]"
    >
      <Icon className="h-5 w-5" />
      {badge && (
        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#F04438] ring-2 ring-[var(--card)]" />
      )}
    </button>
  );
}

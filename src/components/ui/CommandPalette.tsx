import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  Plus, 
  X,
  Command as CommandIcon,
  Bell,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  handler: () => void;
  category: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'View your financial summary',
      icon: LayoutDashboard,
      category: 'Navigation',
      handler: () => navigate('/'),
    },
    {
      id: 'transactions',
      title: 'View Transactions',
      description: 'Browse all income and expenses',
      icon: ArrowLeftRight,
      category: 'Navigation',
      handler: () => navigate('/transactions'),
    },
    {
      id: 'budget',
      title: 'Budget Planning',
      description: 'Manage your monthly budgets',
      icon: Target,
      category: 'Navigation',
      handler: () => navigate('/budget'),
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View charts and insights',
      icon: PieChart,
      category: 'Navigation',
      handler: () => navigate('/analytics'),
    },
    {
      id: 'add-transaction',
      title: 'Add Transaction',
      description: 'Record a new income or expense',
      icon: Plus,
      category: 'Actions',
      handler: () => navigate('?new_transaction=true'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View recent alerts',
      icon: Bell,
      category: 'Navigation',
      handler: () => navigate('/notifications'),
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage app preferences',
      icon: Settings,
      category: 'System',
      handler: () => navigate('/settings'),
    },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      shift: true,
      meta: true,
      handler: () => setIsOpen(true),
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      meta: true,
      handler: () => setIsOpen(true),
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].handler();
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      listRef.current.children[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-[640px] bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <Search className="w-5 h-5 text-[var(--text-dim-2)] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-[var(--text)] placeholder:text-[var(--text-dim-2)]"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="h-5 px-1.5 rounded border border-[var(--border)] bg-[var(--card)] text-[10px] font-bold text-[var(--text-dim-2)] flex items-center">ESC</kbd>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center text-[var(--text-dim-2)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isActive = index === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.handler(); setIsOpen(false); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group ${
                    isActive ? 'bg-[#15803D] text-white shadow-lg' : 'hover:bg-[var(--muted)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20' : 'bg-[var(--muted)] text-[var(--text-dim-2)]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-[14px] font-bold truncate ${isActive ? 'text-white' : 'text-[var(--text)]'}`}>
                        {cmd.title}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--text-dim-2)]'
                      }`}>
                        {cmd.category}
                      </span>
                    </div>
                    {cmd.description && (
                      <p className={`text-[11px] font-medium truncate mt-0.5 ${
                        isActive ? 'text-white/80' : 'text-[var(--text-dim-2)]'
                      }`}>
                        {cmd.description}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <ArrowLeftRight className="w-4 h-4 text-white/40 ml-2" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-[var(--text-dim-2)] opacity-60">
              <CommandIcon className="w-8 h-8 mb-3 animate-pulse" />
              <p className="text-[14px] font-bold">No commands found for "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] font-bold text-[var(--text-dim-2)]">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--card)]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--card)]">↵</kbd> Select</span>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-dim-2)] opacity-40 uppercase tracking-widest">Saku Command Palette</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { StatCard } from '../components/finance/StatCard';
import { Users, UserPlus, Activity, Search, Mail, Calendar, Shield } from 'lucide-react';
import { analyticsApi, AnalyticsUser, AnalyticsSummary } from '../api/client';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function DeveloperAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [users, setUsers] = useState<AnalyticsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sumData, usersData] = await Promise.all([
        analyticsApi.summary(),
        analyticsApi.users()
      ]);
      setSummary(sumData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || '';
    const email = user.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return 'bg-gray-500';
    const lastSeen = dayjs(lastSeenAt);
    const now = dayjs();
    if (now.diff(lastSeen, 'minute') < 10) return 'bg-green-500';
    if (now.diff(lastSeen, 'hour') < 24) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Developer Analytics</h1>
          <p className="text-[var(--text-dim)] mt-1">Monitor user growth and system activity</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--muted)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl text-sm font-semibold transition-colors w-fit"
        >
          <Activity className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={summary?.totalUsers.toString() || '0'}
          icon={<Users className="w-6 h-6" />}
          color="var(--accent)"
          isLoading={isLoading}
        />
        <StatCard
          title="New Users (Month)"
          value={summary?.newUsersThisMonth.toString() || '0'}
          icon={<UserPlus className="w-6 h-6" />}
          color="var(--income)"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users (24h)"
          value={users.filter(u => u.lastSeenAt && dayjs().diff(dayjs(u.lastSeenAt), 'hour') < 24).length.toString()}
          icon={<Activity className="w-6 h-6" />}
          color="var(--primary)"
          isLoading={isLoading}
        />
      </div>

      {/* Growth Chart */}
      <div className="flow-card p-6 md:p-8">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--accent)]" />
          User Growth Trend
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary?.growth || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="var(--accent)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management */}
      <div className="flow-card overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[var(--border)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            User Management
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim-2)]" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all w-full sm:w-64"
              />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="developer">Developer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--muted)]/50">
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider">Activity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{user.name || 'Unnamed User'}</div>
                        <div className="text-xs text-[var(--text-dim-2)] flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'developer' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--muted)] text-[var(--text-dim)]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(user.lastSeenAt)}`} />
                      <span className="text-xs text-[var(--text-dim)]">
                        {user.lastSeenAt ? dayjs(user.lastSeenAt).fromNow() : 'Never'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-dim)] whitespace-nowrap">
                    {dayjs(user.createdAt).format('MMM D, YYYY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-[var(--text-dim)]">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

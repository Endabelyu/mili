import { ArrowLeft, Zap, Coffee, Target, ShoppingBag, Wallet, Activity, Youtube, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Coffee,
  Target,
  Shopping: ShoppingBag,
  Salary: Wallet,
  Activity,
  Youtube
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = usePreferences();

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

  const newNotifications = notifications.filter(n => n.unread);
  const previousNotifications = notifications.filter(n => !n.unread);
  const unreadCount = newNotifications.length;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] transition-colors hover:bg-[var(--muted-2)]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[24px] font-bold text-[var(--text)] tracking-[-0.02em]">{t('notifications.title')}</h1>
            <p className="text-[14px] font-medium text-[var(--text-dim)]">{unreadCount} {t('notifications.unread')}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-[13px] font-bold text-[#15803D] hover:underline"
          >
            {t('notifications.markAll')}
          </button>
        )}
      </div>

      <section className="space-y-4">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('notifications.new')}</h3>
        {newNotifications.length === 0 ? (
          <div className="flow-card p-8 text-center">
            <p className="text-[13px] font-medium text-[var(--text-dim-2)]">{t('notifications.noNew')}</p>
          </div>
        ) : (
          <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
            {newNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => { if (notif.unread) markReadMutation.mutate(notif.id); }}
                className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer relative"
              >
                <div className={`w-10 h-10 rounded-xl ${notif.color} flex items-center justify-center shrink-0`}>
                  {(() => {
                    const Icon = ICON_MAP[notif.icon] || Bell;
                    return <Icon className={`w-5 h-5 ${notif.iconColor}`} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[14px] font-bold text-[var(--text)] leading-tight">{notif.title}</p>
                  <p className="text-[12px] font-medium text-[var(--text-dim-2)] opacity-70 mt-1">{notif.amount}</p>
                  <p className="text-[11px] font-bold text-[var(--text-dim-2)] opacity-50 mt-1 uppercase tracking-wider">{notif.time}</p>
                </div>
                {notif.unread && (
                  <div className="w-2 h-2 rounded-full bg-[#15803D] mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {previousNotifications.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('notifications.previous')}</h3>
          <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
            {previousNotifications.map((notif) => (
              <div key={notif.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${notif.color} flex items-center justify-center shrink-0`}>
                  {(() => {
                    const Icon = ICON_MAP[notif.icon] || Bell;
                    return <Icon className={`w-5 h-5 ${notif.iconColor}`} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[var(--text)] leading-tight">{notif.title}</p>
                  <p className="text-[12px] font-medium text-[var(--text-dim-2)] opacity-70 mt-1">{notif.amount}</p>
                  <p className="text-[11px] font-bold text-[var(--text-dim-2)] opacity-50 mt-1 uppercase tracking-wider">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

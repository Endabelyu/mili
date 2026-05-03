import { useQuery } from '@tanstack/react-query';
import { feedbacksApi } from '../api/client';
import { authClient } from '../lib/auth-client';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Loader2, MessageSquare, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DeveloperFeedbacksPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const navigate = useNavigate();

  const isDeveloper = session?.user?.email === 'endabelyuproject@gmail.com';

  useEffect(() => {
    if (!sessionLoading && !isDeveloper) {
      navigate('/dashboard', { replace: true });
    }
  }, [isDeveloper, sessionLoading, navigate]);

  const { data: feedbacks, isLoading, error } = useQuery({
    queryKey: ['developer', 'feedbacks'],
    queryFn: () => feedbacksApi.list(),
    enabled: isDeveloper,
  });

  if (sessionLoading || !isDeveloper) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in pt-6">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em] ml-1 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[var(--accent)]" />
          Developer Feedback
        </h1>
        <p className="text-[14px] font-medium text-[var(--text-dim)] ml-1">
          Halaman privat untuk melihat umpan balik pengguna.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium text-center">
          Gagal memuat data feedback.
        </div>
      ) : feedbacks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-[var(--text-dim-2)] opacity-50" />
          </div>
          <h3 className="text-[16px] font-bold text-[var(--text)] mb-1">Belum ada umpan balik</h3>
          <p className="text-[14px] text-[var(--text-dim)]">Umpan balik dari pengguna akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks?.map((fb) => (
            <div key={fb.id} className="flow-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[14px]">
                    {fb.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[var(--text)]">{fb.user.name}</p>
                    <p className="text-[12px] text-[var(--text-dim)]">{fb.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium text-[var(--text-dim)]">
                    {format(new Date(fb.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[14px] text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                  {fb.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

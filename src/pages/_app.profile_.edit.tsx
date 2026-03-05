import { useState } from 'react';
import { type MetaFunction, type ActionFunctionArgs } from 'react-router';
import { useLoaderData, useNavigate, useFetcher } from 'react-router';
import { requireSession } from '@app/lib/auth.server';
import { authClient } from '@app/lib/auth-client';
import { Input } from '@app/components/ui/Input';
import { Button } from '@app/components/ui/Button';
import { User, ArrowLeft, Check } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Edit Profil | Finance Tracker' },
];

export async function loader({ request }: { request: Request }) {
  const session = await requireSession(request);
  return Response.json({ user: session.user });
}

export default function EditProfilePage() {
  const { user } = useLoaderData<{ user: { name?: string | null; email: string } }>();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Nama tidak boleh kosong.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await authClient.updateUser({ name: trimmed });
      if (result.error) {
        setError(result.error.message ?? 'Gagal memperbarui profil.');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/profile'), 1200);
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-28 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Edit Profil</h1>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-2xl bg-[var(--gradient-hero-start)]/20 border-2 border-[var(--gradient-hero-start)]/30 flex items-center justify-center">
          <User className="w-9 h-9 text-[var(--gradient-hero-start)]" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Nama Tampilan
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama Anda"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            Email
          </label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
            Email tidak dapat diubah.
          </p>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          {success ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Tersimpan!
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </Button>
      </form>
    </div>
  );
}

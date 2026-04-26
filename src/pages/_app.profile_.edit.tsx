import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type MetaFunction, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, ArrowLeft, Check, Sparkles } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Edit Profil | Finance Tracker' },
];

const editProfileSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong.'),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  });

  if (!user) return null;

  const onSubmit = async (data: EditProfileFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      await updateUser({ name: data.name });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      const e = err as any;
      setError(e.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-28 md:pb-8 pt-4 lg:pt-8 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="icon-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em]">Edit Profil</h1>
        </div>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full p-0.5 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
          <div className="w-full h-full rounded-full bg-orange-100 overflow-hidden border-2 border-[var(--card)] flex items-center justify-center">
            {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Profile" /> : <User className="w-10 h-10 text-[var(--accent)]" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--card)] shadow-sm flex items-center justify-center border border-[var(--border)]">
             <Sparkles className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flow-card p-6 space-y-5">
        <div>
          <label className="block text-[13px] font-semibold text-[var(--text)] mb-2">
            Nama Lengkap
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Masukkan nama Anda"
            className={`h-12 ${errors.name ? 'border-[var(--expense)]' : ''}`}
            autoFocus
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-2 text-[12px] font-semibold text-[var(--expense)]">{errors.name.message}</p>
          )}
          {error && !errors.name && (
            <p className="mt-2 text-[12px] font-semibold text-[var(--expense)]">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[var(--text)] mb-2">
            Alamat Email
          </label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="h-12 opacity-60 cursor-not-allowed"
          />
          <p className="mt-2 text-[11px] font-medium text-[var(--text-dim)]">
            Email terikat dengan akun Anda dan tidak dapat diubah di sini.
          </p>
        </div>

        <div className="pt-2">
           <Button
             type="submit"
             disabled={isLoading}
             className={`w-full ${success ? 'bg-[var(--income)] hover:bg-[#12B76A]' : ''}`}
           >
             {isLoading ? 'Menyimpan...' : success ? (
               <span className="flex items-center justify-center">
                 <Check className="w-5 h-5 mr-2" />
                 Tersimpan!
               </span>
             ) : (
               'Simpan Perubahan'
             )}
           </Button>
        </div>
      </form>
    </div>
  );
}

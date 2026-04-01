import { useState } from 'react';
import { type MetaFunction, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, ArrowLeft, Check, Sparkles } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Edit Profil | Finance Tracker' },
];

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) return null;

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
      await updateUser({ name: trimmed });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
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
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f4f4f5] hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1a1a2e]" />
        </button>
        <div>
          <h1 className="text-[20px] font-extrabold text-[#1a1a2e] tracking-tight">Edit Profil</h1>
        </div>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[#ecfccb] border-4 border-white shadow-sm flex items-center justify-center relative">
          <User className="w-10 h-10 text-[#65a30d]" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-zinc-100">
             <Sparkles className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flow-card p-6 space-y-5 border-none shadow-sm">
        <div>
          <label className="block text-sm font-bold text-[#1a1a2e] mb-2">
            Nama Lengkap
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama Anda"
            className="h-12 text-[#1a1a2e] border-zinc-200 focus:border-[#a3e635] focus:ring-[#a3e635] bg-white"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-[13px] font-bold text-[#ef4444]">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-[#1a1a2e] mb-2">
            Alamat Email
          </label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="h-12 bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed"
          />
          <p className="mt-2 text-[12px] font-medium text-[#71717a]">
            Email terikat dengan akun Anda dan tidak dapat diubah di sini.
          </p>
        </div>

        <div className="pt-2">
           <Button
             type="submit"
             disabled={isLoading}
             className={`w-full h-12 text-sm shadow-md transition-all ${success ? 'bg-[#22c55e] hover:bg-[#16a34a] text-white ring-[#22c55e]' : ''}`}
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

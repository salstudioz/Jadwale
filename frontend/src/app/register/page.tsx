'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore, TRANSLATIONS } from '../../store/useLanguageStore';
import LanguageToggle from '../../components/LanguageToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import BrandLogo from '../../components/BrandLogo';
import api from '../../lib/axios';
import { 
  Mail, Lock, School, User, Loader2, ArrowRight, AlertCircle, 
  Eye, EyeOff, Home, CheckCircle2, GraduationCap 
} from 'lucide-react';

interface SekolahOption {
  id: number;
  nama_sekolah: string;
  npsn: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const lang = useLanguageStore((s) => s.lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  // Form states
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role-specific fields
  const [namaSekolah, setNamaSekolah] = useState('');
  const [npsn, setNpsn] = useState('');
  const [nip, setNip] = useState('');
  const [selectedSekolahId, setSelectedSekolahId] = useState<string>('');

  const [sekolahList, setSekolahList] = useState<SekolahOption[]>([]);
  const [loadingSekolah, setLoadingSekolah] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Email domain detection logic
  const cleanEmail = email.trim().toLowerCase();
  const isSchoolAdminEmail = cleanEmail.includes('.sch.id');
  const isTeacherEmail = cleanEmail.includes('guru.sd.belajar.id') || cleanEmail.includes('belajar.id');

  let detectedRole: 'sekolah' | 'guru' | 'public' = 'public';
  if (isSchoolAdminEmail) {
    detectedRole = 'sekolah';
  } else if (isTeacherEmail) {
    detectedRole = 'guru';
  }

  // Fetch list of registered schools when teacher domain is detected
  useEffect(() => {
    if (detectedRole === 'guru' && sekolahList.length === 0) {
      fetchSekolahList();
    }
  }, [detectedRole]);

  const fetchSekolahList = async () => {
    setLoadingSekolah(true);
    try {
      const res = await api.get('/auth/sekolah-list');
      setSekolahList(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedSekolahId(String(res.data[0].id));
      }
    } catch (err) {
      console.error('Gagal memuat daftar sekolah', err);
    } finally {
      setLoadingSekolah(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (detectedRole === 'sekolah') {
        if (!namaSekolah.trim()) {
          setError(lang === 'en' ? 'Please enter School Name.' : 'Silakan masukkan Nama Sekolah.');
          setLoading(false);
          return;
        }
        await api.post('/auth/signup/school', {
          nama_sekolah: namaSekolah,
          npsn,
          nama,
          email,
          password,
        });
        setSuccessMessage(
          lang === 'en' 
            ? 'Registration successful! Your School Admin account is pending Superadmin verification.' 
            : 'Pendaftaran Akun Admin Sekolah Berhasil! Akun Anda sedang menunggu verifikasi dari Superadmin.'
        );
      } else if (detectedRole === 'guru') {
        if (!selectedSekolahId) {
          setError(lang === 'en' ? 'Please select your teaching school.' : 'Silakan pilih sekolah tempat Anda mengajar.');
          setLoading(false);
          return;
        }
        await api.post('/auth/signup/teacher', {
          id_sekolah: parseInt(selectedSekolahId),
          nip,
          nama,
          email,
          password,
        });
        setSuccessMessage(
          lang === 'en' 
            ? 'Registration successful! Your Teacher account is pending School Admin verification.' 
            : 'Pendaftaran Akun Tenaga Pendidik Berhasil! Akun Anda sedang menunggu verifikasi dari Admin Sekolah.'
        );
      } else {
        // User Biasa / Umum
        const res = await api.post('/auth/signup/public', {
          nama,
          email,
          password,
        });
        if (res.data.access_token) {
          setAuth(res.data.access_token, res.data.user);
          router.push('/dashboard');
        } else {
          setSuccessMessage(lang === 'en' ? 'Registration successful! Please login.' : 'Pendaftaran akun berhasil! Silakan masuk.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'en' ? 'Registration failed. Please verify your input.' : 'Gagal mendaftar. Pastikan data yang dimasukkan valid.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between pb-16 md:pb-0">
      
      {/* Top Header Navigation */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <BrandLogo href="/" size="md" />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle compact />
          <ThemeToggle iconOnly />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-foreground/5 font-bold text-xs transition-colors"
          >
            <Home size={14} className="text-primary" />
            <span className="hidden sm:inline">{t.backToHome}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="flex justify-center mb-3">
              <BrandLogo href="/" size="lg" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--foreground)', marginBottom: 6 }}>
              {lang === 'en' ? 'Create New Account' : 'Pendaftaran Akun Baru'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              {lang === 'en' ? 'Fill out the form below to register your account' : 'Lengkapi formulir di bawah ini untuk membuat akun Jadwale'}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <h4 className="font-bold text-base mb-1">{lang === 'en' ? 'Registration Successful!' : 'Pendaftaran Sukses!'}</h4>
                <p className="leading-relaxed">{successMessage}</p>
                <div className="mt-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-decoration-none transition-colors"
                  >
                    {lang === 'en' ? 'Go to Login' : 'Ke Halaman Login'} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Register Form Card */}
          {!successMessage && (
            <div style={{
              background: 'var(--card)', border: '1.5px solid var(--border)',
              borderRadius: 16, padding: '1.5rem',
            }}>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="field-label">{lang === 'en' ? 'Full Name' : 'Nama Lengkap'}</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input
                      type="text" required
                      value={nama} onChange={(e) => setNama(e.target.value)}
                      placeholder={lang === 'en' ? 'Full Name' : 'Nama Lengkap'}
                      className="field-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div>
                  <label className="field-label">{t.email}</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input
                      type="email" required
                      value={email} onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="email@domain.com / .sch.id / guru.sd.belajar.id"
                      className="field-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {lang === 'en'
                      ? 'Tip: Use .sch.id for School Admin, or guru.sd.belajar.id for Teachers.'
                      : 'Petunjuk: Gunakan email .sch.id (Admin Sekolah) atau guru.sd.belajar.id (Tenaga Pendidik).'}
                  </p>
                </div>

                {/* 3. Password */}
                <div>
                  <label className="field-label">{t.password}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder={lang === 'en' ? 'Minimum 6 characters' : 'Minimal 6 karakter'}
                      minLength={6}
                      className="field-input"
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? t.hidePassword : t.showPassword}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', borderRadius: 4,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 4. Auto-detected Role Banner & Fields */}
                <div className="pt-2 pb-1 border-t border-border mt-1 space-y-3">
                  {detectedRole === 'sekolah' && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School size={18} className="text-blue-500 shrink-0" />
                        <div>
                          <span className="font-extrabold block text-sm">{lang === 'en' ? 'School Admin Account Detected' : 'Terdeteksi: Akun Admin Sekolah (.sch.id)'}</span>
                          <span className="text-[11px] opacity-80">{lang === 'en' ? 'Automatically configured for school management registration' : 'Dikonfigurasi otomatis untuk pendaftaran profil sekolah baru'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {detectedRole === 'guru' && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={18} className="text-purple-500 shrink-0" />
                        <div>
                          <span className="font-extrabold block text-sm">{lang === 'en' ? 'Teacher Account Detected' : 'Terdeteksi: Akun Tenaga Pendidik (guru.sd.belajar.id)'}</span>
                          <span className="text-[11px] opacity-80">{lang === 'en' ? 'Automatically configured for teaching staff registration' : 'Dikonfigurasi otomatis untuk pendaftaran tenaga pengajar'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {detectedRole === 'public' && cleanEmail.length > 3 && (
                    <div className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground text-xs flex items-center gap-2">
                      <User size={15} className="shrink-0" />
                      <span>{lang === 'en' ? 'Detected: Standard User Account' : 'Terdeteksi: Akun Pengguna Umum / Orang Tua Murid'}</span>
                    </div>
                  )}

                  {/* Admin Sekolah Fields */}
                  {detectedRole === 'sekolah' && (
                    <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border animate-fade-in">
                      <div>
                        <label className="field-label">{t.schoolName} <span className="text-red-500">*</span></label>
                        <input
                          type="text" required
                          value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)}
                          placeholder={lang === 'en' ? 'e.g. SDN Pancasila 01' : 'Contoh: SDN Pancasila 01'}
                          className="field-input"
                        />
                      </div>
                      <div>
                        <label className="field-label">{t.npsnOptional}</label>
                        <input
                          type="text"
                          value={npsn} onChange={(e) => setNpsn(e.target.value)}
                          placeholder={lang === 'en' ? 'School NPSN (Optional)' : 'NPSN Sekolah (Opsional)'}
                          className="field-input"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tenaga Pendidik Fields */}
                  {detectedRole === 'guru' && (
                    <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border animate-fade-in">
                      <div>
                        <label className="field-label">{lang === 'en' ? 'Select Teaching School' : 'Pilih Sekolah Tempat Mengajar'} <span className="text-red-500">*</span></label>
                        {loadingSekolah ? (
                          <div className="text-xs text-muted-foreground py-2 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-primary" /> {lang === 'en' ? 'Loading registered schools...' : 'Memuat daftar sekolah terdaftar...'}
                          </div>
                        ) : (
                          <select
                            required
                            value={selectedSekolahId}
                            onChange={(e) => setSelectedSekolahId(e.target.value)}
                            className="field-input w-full bg-card font-bold"
                          >
                            {sekolahList.length === 0 ? (
                              <option value="">{lang === 'en' ? '-- No schools registered yet --' : '-- Belum ada sekolah terdaftar --'}</option>
                            ) : (
                              sekolahList.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.nama_sekolah} (NPSN: {s.npsn || '-'})
                                </option>
                              ))
                            )}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="field-label">{lang === 'en' ? 'Teacher NIP (Optional)' : 'NIP Guru (Opsional)'}</label>
                        <input
                          type="text"
                          value={nip} onChange={(e) => setNip(e.target.value)}
                          placeholder={lang === 'en' ? 'Teacher NIP' : 'Nomor Induk Pegawai (NIP)'}
                          className="field-input font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>{lang === 'en' ? 'Register Now' : 'Daftar Sekarang'} <ArrowRight size={16} /></>}
                </button>
              </form>

              {/* Link to Login */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                {t.hasAccount}{' '}
                <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                  {t.loginNow}
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} Jadwale. {lang === 'en' ? 'All Rights Reserved.' : 'Hak Cipta Dilindungi.'}
      </footer>

    </div>
  );
}

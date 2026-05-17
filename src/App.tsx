import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, LogOut, Search, Plus, Edit, Trash2, 
  GraduationCap, X, User, Lock, ArrowRight, ShieldCheck, XCircle
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  nisn: string;
  className: string;
  grade: number;
  attendance: number;
  category: 'Kelulusan' | 'Kenaikan';
  attitude: string;
  status: string;
}

type Role = 'GURU' | 'KEPALA_SEKOLAH';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

const calculateStatus = (grade: number, attendance: number, category: string, attitude?: string) => {
  const currentAttitude = attitude || 'Baik';
  const isAttitudeGood = currentAttitude === 'Sangat Baik' || currentAttitude === 'Baik';
  const isPassed = grade >= 75 && attendance >= 80 && isAttitudeGood;
  if (category === 'Kelulusan') {
    return isPassed ? 'Lulus' : 'Tidak Lulus';
  } else {
    return isPassed ? 'Naik Kelas' : 'Tinggal';
  }
};

const defaultStudents: Student[] = [
  { id: '1', name: 'Andi Pratama', nisn: '10001', className: 'XII-IPA-1', grade: 85, attendance: 90, attitude: 'Sangat Baik', category: 'Kelulusan', status: 'Lulus' },
  { id: '2', name: 'Siti Aminah', nisn: '10002', className: 'XII-IPA-1', grade: 92, attendance: 95, attitude: 'Baik', category: 'Kelulusan', status: 'Lulus' },
  { id: '3', name: 'Budi Santoso', nisn: '10003', className: 'XII-IPS-2', grade: 70, attendance: 85, attitude: 'Baik', category: 'Kelulusan', status: 'Tidak Lulus' },
  { id: '4', name: 'Dewi Lestari', nisn: '10004', className: 'X-IPA-2', grade: 88, attendance: 70, attitude: 'Cukup', category: 'Kenaikan', status: 'Tinggal' },
  { id: '5', name: 'Fajar Hidayat', nisn: '10005', className: 'XI-IPS-1', grade: 78, attendance: 85, attitude: 'Sangat Baik', category: 'Kenaikan', status: 'Naik Kelas' },
];

export default function App() {
  const [role, setRole] = useLocalStorage<Role | null>('orbit46_role_v3', null);
  const [username, setUsername] = useLocalStorage<string | null>('orbit46_username_v3', null);
  const [students, setStudents] = useLocalStorage<Student[]>('orbit46_students_v3', defaultStudents);

  const handleCheckNisn = (nisn: string, setResult: (res: Student | 'NOT_FOUND' | null) => void) => {
    const student = students.find((s) => s.nisn === nisn);
    setResult(student || 'NOT_FOUND');
  };

  if (!role) {
    return <PublicPortal onLogin={(r, u) => { setRole(r); setUsername(u); }} onCheckNisn={handleCheckNisn} />;
  }

  return <Dashboard role={role} username={username} onLogout={() => { setRole(null); setUsername(null); }} students={students} setStudents={setStudents} />;
}

// --- Public Portal Component ---
function PublicPortal({ onLogin, onCheckNisn }: { onLogin: (r: Role, u: string) => void, onCheckNisn: any }) {
  const [tab, setTab] = useState<'CEK' | 'LOGIN'>('CEK');
  const [nisn, setNisn] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [checkResult, setCheckResult] = useState<Student | 'NOT_FOUND' | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckNisn(nisn, setCheckResult);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Username harus diisi!');
      return;
    }
    if (password === '123') {
      onLogin('GURU', username);
    } else if (password === '1234') {
      onLogin('KEPALA_SEKOLAH', username);
    } else {
      alert('Password salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-3xl overflow-hidden relative z-10"
      >
        <div className="bg-white/20 p-8 backdrop-blur-md text-white text-center border-b border-white/20">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-md">ORBIT 46</h1>
          <p className="text-white/80 text-sm mt-1">Kelulusan & Kenaikan Kelas</p>
        </div>

        <div className="flex bg-black/10 backdrop-blur-md">
          <button onClick={() => {setTab('CEK'); setCheckResult(null);}} className={`flex-1 py-4 text-sm font-semibold transition-all ${tab === 'CEK' ? 'bg-white/20 text-white border-b-2 border-white' : 'text-white/60 hover:bg-white/10'}`}>Cek Kelulusan</button>
          <button onClick={() => setTab('LOGIN')} className={`flex-1 py-4 text-sm font-semibold transition-all ${tab === 'LOGIN' ? 'bg-white/20 text-white border-b-2 border-white' : 'text-white/60 hover:bg-white/10'}`}>Staff Login</button>
        </div>

        <div className="p-8 bg-white/5 backdrop-blur-md min-h-[360px]">
          <AnimatePresence mode="wait">
            {tab === 'CEK' ? (
              <motion.div key="cek" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                <form onSubmit={handleCheck} className="space-y-5">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">NISN Siswa</label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
                      <input type="text" value={nisn} onChange={e=>setNisn(e.target.value)} required className="w-full bg-black/20 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium" placeholder="Masukkan NISN" />
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-white text-blue-900 font-bold py-3 rounded-xl mt-2 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    Lihat Hasil <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </form>

                <AnimatePresence>
                  {checkResult && (
                    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="mt-6 p-5 rounded-2xl bg-black/20 border border-white/20 text-white backdrop-blur-md">
                      {checkResult === 'NOT_FOUND' ? (
                        <div className="text-center text-red-200 py-3 font-medium">Data dengan NISN tersebut tidak ditemukan.</div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-center mb-4">
                            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-white/80" />
                            <div className="font-bold text-xl">{checkResult.name}</div>
                            <div className="text-sm opacity-80 mt-1">Kelas {checkResult.className} | NISN: {checkResult.nisn}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                              <span className="font-medium text-sm text-white/80">Sikap/Karakter</span>
                              <span className="text-sm font-bold shadow-md text-white">{checkResult.attitude || 'Baik'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl border border-white/10">
                              <span className="font-medium text-sm text-white/80">Status {checkResult.category === 'Kelulusan' ? 'Kelulusan' : 'Kenaikan'}</span>
                              <span className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-md ${checkResult.status === 'Lulus' || checkResult.status === 'Naik Kelas' ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'}`}>
                                {checkResult.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div key="login" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
                      <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full bg-black/20 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium" placeholder="Masukkan username" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
                      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-black/20 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium" placeholder="Masukkan password" />
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 border border-white/20 shadow-lg transition-all">
                    Masuk Dashboard <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard({ role, username, onLogout, students, setStudents }: any) {
  const [activeTab, setActiveTab] = useState<'Kelulusan' | 'Kenaikan'>('Kelulusan');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', nisn: '', className: '', grade: '', attendance: '', attitude: 'Baik', category: 'Kelulusan' });

  const filteredStudents = useMemo(() => {
    return students
      .filter((s: Student) => s.category === activeTab)
      .filter((s: Student) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery)
      );
  }, [students, searchQuery, activeTab]);

  const stats = useMemo(() => {
    const currentData = students.filter((s: Student) => s.category === activeTab);
    const total = currentData.length;
    const lulus = currentData.filter((s:Student) => s.status === 'Lulus' || s.status === 'Naik Kelas').length;
    const tidakLulus = total - lulus;
    return { total, lulus, tidakLulus };
  }, [students, activeTab]);

  const handleOpenModal = (s?: Student) => {
    if (s) {
      setEditingStudent(s);
      setFormData({ name: s.name, nisn: s.nisn, className: s.className, grade: s.grade.toString(), attendance: s.attendance.toString(), attitude: s.attitude || 'Baik', category: s.category || activeTab });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', nisn: '', className: '', grade: '', attendance: '', attitude: 'Baik', category: activeTab });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(formData.grade);
    const a = parseFloat(formData.attendance);
    const status = calculateStatus(g, a, formData.category, formData.attitude);

    if (editingStudent) {
      setStudents(students.map((s:Student) => s.id === editingStudent.id ? { ...s, ...formData, grade: g, attendance: a, status } : s));
    } else {
      setStudents([...students, { id: Date.now().toString(), ...formData, grade: g, attendance: a, status }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter((s:Student) => s.id !== id));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-7xl glass-panel rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl relative z-10" 
        style={{ minHeight: '85vh' }}
      >
        {/* Sidebar */}
        <div className="w-full lg:w-72 bg-gradient-to-b from-white/80 to-white/50 border-b lg:border-b-0 lg:border-r border-white/50 p-8 flex flex-col backdrop-blur-md">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">Orbit 46</h2>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">Edu Portal</p>
            </div>
          </div>

          <div className="bg-white/60 p-5 rounded-2xl border border-white/60 mb-8 shadow-sm backdrop-blur-md">
            <p className="text-xs text-slate-600 font-bold mb-1.5 uppercase tracking-wider">Akses Terdaftar</p>
            <p className="font-bold text-indigo-900 text-lg break-words">{username || 'Pengguna'}</p>
            <p className="text-xs text-indigo-600/80 font-semibold mt-1">{role === 'GURU' ? 'Guru' : 'Kepala Sekolah'}</p>
          </div>

          <div className="space-y-3 flex-1">
            <button onClick={() => setActiveTab('Kelulusan')} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'Kelulusan' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/40 text-slate-700 hover:bg-white/60 border border-white/60'}`}>
              <div className="flex items-center gap-3"><GraduationCap className="h-5 w-5" /> Data Kelulusan</div>
            </button>
            <button onClick={() => setActiveTab('Kenaikan')} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'Kenaikan' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/40 text-slate-700 hover:bg-white/60 border border-white/60'}`}>
              <div className="flex items-center gap-3"><Users className="h-5 w-5" /> Kenaikan Kelas</div>
            </button>
          </div>

          <button onClick={onLogout} className="mt-8 w-full flex items-center justify-center gap-3 bg-white/40 text-rose-600 font-bold px-5 py-3.5 rounded-xl hover:bg-rose-50 border border-white/60 transition-all shadow-sm">
            <LogOut className="h-5 w-5" /> Logout Sistem
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col overflow-hidden bg-white/40 backdrop-blur-lg">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{activeTab === 'Kelulusan' ? 'Data Kelulusan Siswa' : 'Data Kenaikan Kelas'}</h1>
              <p className="text-slate-700 font-medium mt-1">Kelola dan pantau status {activeTab === 'Kelulusan' ? 'kelulusan' : 'kenaikan kelas'} siswa secara real-time.</p>
            </div>
            {role === 'GURU' && (
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)" }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => handleOpenModal()} 
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition shrink-0"
              >
                <Plus className="w-5 h-5" /> Tambah Data
              </motion.button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white/70 p-6 rounded-3xl border border-white/60 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-600 text-sm font-bold uppercase tracking-wider">Total Siswa</div>
                <div className="bg-blue-100 p-2 rounded-xl"><Users className="h-5 w-5 text-blue-600" /></div>
              </div>
              <div className="text-4xl font-extrabold text-slate-800">{stats.total}</div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-white/70 p-6 rounded-3xl border border-white/60 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-emerald-700 text-sm font-bold uppercase tracking-wider">{activeTab === 'Kelulusan' ? 'Predikat Lulus' : 'Naik Kelas'}</div>
                <div className="bg-emerald-100 p-2 rounded-xl"><ShieldCheck className="h-5 w-5 text-emerald-600" /></div>
              </div>
              <div className="text-4xl font-extrabold text-emerald-700">{stats.lulus}</div>
            </motion.div>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="bg-white/70 p-6 rounded-3xl border border-white/60 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-rose-700 text-sm font-bold uppercase tracking-wider">{activeTab === 'Kelulusan' ? 'Tidak Lulus' : 'Tinggal Kelas'}</div>
                <div className="bg-rose-100 p-2 rounded-xl"><XCircle className="h-5 w-5 text-rose-600" /></div>
              </div>
              <div className="text-4xl font-extrabold text-rose-700">{stats.tidakLulus}</div>
            </motion.div>
          </div>

          {/* Table Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white/70 rounded-3xl border border-white/60 shadow-lg backdrop-blur-xl">
            <div className="p-5 border-b border-black/5 bg-white/50 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input type="text" placeholder="Cari nama atau NISN siswa..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5">Data Siswa</th>
                    <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5">Kelas</th>
                    <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5">Nilai Avg</th>
                    <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5">Kehadiran</th>
                    <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5">Sikap</th>
                    <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5">Status</th>
                    {role === 'GURU' && <th className="font-bold text-xs text-slate-500 uppercase tracking-widest p-4 border-b border-black/5 text-right w-24">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredStudents.length > 0 ? filteredStudents.map((s: Student, i: number) => (
                      <motion.tr 
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }} 
                        transition={{ delay: i * 0.05 }} 
                        className="hover:bg-white/80 transition-colors group"
                      >
                        <td className="p-4 border-b border-black/5">
                          <div className="font-bold text-slate-800">{s.name}</div>
                          <div className="text-slate-500 text-xs font-bold mt-0.5">NISN: <span className="font-mono text-indigo-600">{s.nisn}</span></div>
                        </td>
                        <td className="p-4 border-b border-black/5 text-sm font-bold text-slate-700">{s.className}</td>
                        <td className="p-4 border-b border-black/5 text-sm font-bold text-slate-800">{s.grade}</td>
                        <td className="p-4 border-b border-black/5 text-sm font-bold text-slate-800">{s.attendance}%</td>
                        <td className="p-4 border-b border-black/5 text-sm font-bold text-slate-800">
                          {s.attitude || 'Baik'}
                        </td>
                        <td className="p-4 border-b border-black/5">
                          <span className={`inline-block whitespace-nowrap px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm ${s.status === 'Lulus' || s.status === 'Naik Kelas' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        {role === 'GURU' && (
                          <td className="p-4 border-b border-black/5 text-right whitespace-nowrap">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                              <button onClick={() => handleOpenModal(s)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100 shadow-sm"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(s.id)} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={role === 'GURU' ? 7 : 6} className="p-10 text-center text-slate-600 font-bold">Tidak ada data siswa ditemukan.</td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{opacity:0, scale:0.95, y:20}} 
              animate={{opacity:1, scale:1, y:0}} 
              exit={{opacity:0, scale:0.95, y:20}}
              className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white/50">
                <h3 className="text-xl font-extrabold text-slate-800">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Bagian</label>
                    <select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium">
                      <option value="Kelulusan">Data Kelulusan (Kelas XII)</option>
                      <option value="Kenaikan">Data Kenaikan Kelas (Kelas X, XI)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                    <input type="text" required value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">NISN</label>
                    <input type="text" required value={formData.nisn} onChange={e=>setFormData({...formData,nisn:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kelas</label>
                    <input type="text" required value={formData.className} onChange={e=>setFormData({...formData,className:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:font-normal shadow-sm font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nilai Rata-rata</label>
                      <input type="number" step="0.1" required value={formData.grade} onChange={e=>setFormData({...formData,grade:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium text-base md:text-lg" />
                      <p className="text-xs text-slate-500 font-bold mt-2">✨ Syarat: {'>='} 75</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Kehadiran (%)</label>
                      <input type="number" min="0" max="100" required value={formData.attendance} onChange={e=>setFormData({...formData,attendance:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium text-base md:text-lg" />
                      <p className="text-xs text-slate-500 font-bold mt-2">✨ Syarat: {'>='} 80%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sikap/Karakter</label>
                      <select required value={formData.attitude} onChange={e=>setFormData({...formData,attitude:e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm font-medium text-base md:text-lg">
                        <option value="Sangat Baik">Sangat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                      <p className="text-xs text-slate-500 font-bold mt-2">✨ Syarat: Min. Baik</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/80 border-t border-black/5 flex flex-col-reverse sm:flex-row justify-end gap-3 rounded-b-[2rem]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors tracking-wide flex justify-center items-center">
                    Simpan Data Siswa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

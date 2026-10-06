import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setSelectedUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/users')
      .then((res) => {
        if (!res.ok) throw new Error('فشل جلب بيانات المستخدمين');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const results = users.filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleSelectUser = (user) => {
    // 1. حفظ المستخدم كاملاً في الـ Context
    setSelectedUser(user);
    // 2. التوجيه إلى الصفحة بدون إظهار הـ ID في الـ URL
    navigate('/my-posts');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
        <p className="mt-4 text-sm text-slate-400">جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-950/30 p-6 text-center text-red-300">
          <p className="font-bold">حدث خطأ:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
              Social Media Management
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-white">اختر حساباً للإدارة</h1>
            <p className="text-sm text-slate-400">سيتم حفظ الحساب المختار في الـ Context للعمل عليه</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ابحث بالاسم، اسم المستخدم أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">المستخدم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">الشركة</th>
                  <th className="px-6 py-4 text-center">الخيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="cursor-pointer transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.name}</div>
                          <div className="text-xs text-slate-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                        {user.company?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUser(user);
                        }}
                        className="rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
                      >
                        اختيار المستخدم
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Users;
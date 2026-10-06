import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const API_URL = "http://localhost:3000/todos";

const Todos = () => {
  const { selectedUser } = useUser();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!selectedUser) return;

    const loadTodos = async () => {
      try {
        const res = await fetch(`${API_URL}?userId=${selectedUser.id}`);
        if (!res.ok) throw new Error("فشل جلب المهام");
        const data = await res.json();
        setTodos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [selectedUser]);

  // Add
  const handleAdd = () => {
    if (newTitle.trim() === "") return;
    setError(null);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        title: newTitle.trim(),
        completed: false,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل إضافة المهمة");
        return res.json();
      })
      .then((created) => {
        setTodos([created, ...todos]);
        setNewTitle("");
      })
      .catch((err) => setError(err.message));
  };

  // Toggle state
  const handleToggle = (todo) => {
    setError(null);

    fetch(`${API_URL}/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل تحديث الحالة");
        return res.json();
      })
      .then((updated) => {
        setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
      })
      .catch((err) => setError(err.message));
  };

  // Edit Title
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleSave = (todo) => {
    if (editTitle.trim() === "") return;
    setError(null);

    fetch(`${API_URL}/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل تعديل المهمة");
        return res.json();
      })
      .then((updated) => {
        setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
        cancelEdit();
      })
      .catch((err) => setError(err.message));
  };

  // delete
  const handleDelete = (todo) => {
    setError(null);

    fetch(`${API_URL}/${todo.id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("فشل حذف المهمة");
        setTodos(todos.filter((t) => t.id !== todo.id));
      })
      .catch((err) => setError(err.message));
  };


  if (!selectedUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-slate-400">لم يتم اختيار مستخدم</p>
        <Link
          to="/"
          className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          اختيار مستخدم
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
        <p className="mt-4 text-sm text-slate-400">جاري تحميل المهام...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
            ToDo
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            {selectedUser.name}'s tasks
          </h1>
          <p className="text-sm text-slate-400">
            Number of tasks : {todos.length}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Add */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="أضف مهمة جديدة..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="shrink-0 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            إضافة
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">المهمة</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">الخيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      لا يوجد مهام لهذا المستخدم
                    </td>
                  </tr>
                ) : null}

                {todos.map((todo, index) => (
                  <tr
                    key={todo.id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === todo.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                        />
                      ) : (
                        <span className="font-semibold text-white">
                          {todo.title}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(todo)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          todo.completed
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {todo.completed ? "مكتملة" : "غير مكتملة"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === todo.id ? (
                          <>
                            <button
                              onClick={() => handleSave(todo)}
                              className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                            >
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(todo)}
                              className="rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDelete(todo)}
                              className="rounded-xl bg-red-600/20 border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white transition"
                            >
                              حذف
                            </button>
                          </>
                        )}
                      </div>
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

export default Todos;

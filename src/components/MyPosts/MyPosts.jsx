import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  getUserPosts,
  createPost,
  updatePost,
  deletePostWithComments,
} from '../../services/api';

const MyPosts = () => {
  const { selectedUser } = useUser();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedUser) {
      navigate('/users');
      return;
    }

    fetchPosts();
  }, [selectedUser]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getUserPosts(selectedUser.id);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // معالجة الإضافة والتعديل
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      setSubmitting(true);
      if (editingPostId) {
        // تعديل منشور محدد
        const updated = await updatePost(editingPostId, { title, body });
        setPosts(posts.map((p) => (p.id === editingPostId ? updated : p)));
        setEditingPostId(null);
      } else {
        // إضافة منشور جديد
        const newPost = await createPost({
          userId: selectedUser.id,
          title,
          body,
        });
        setPosts([newPost, ...posts]);
      }
      setTitle('');
      setBody('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setBody(post.body);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle('');
    setBody('');
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('هل أنت تأكد من حذف المنشور وجميع التعليقات التابعة له؟')) return;

    try {
      await deletePostWithComments(postId);
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!selectedUser) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 antialiased">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">منشورات: {selectedUser.name}</h1>
            <p className="text-xs text-slate-400">@{selectedUser.username} | ID: {selectedUser.id}</p>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            تغيير المستخدم
          </button>
        </div>

        {/* Form Create / Update */}
        <form onSubmit={handleSubmit} className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-bold text-indigo-400">
            {editingPostId ? 'تعديل المنشور' : 'إضافة منشور جديد'}
          </h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="عنوان المنشور..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="محتوى المنشور..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows="4"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            ></textarea>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : editingPostId ? 'حفظ التعديلات' : 'نشر المنشور'}
            </button>
            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        {/* Posts List */}
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        {posts.length === 0 ? (
          <p className="text-center text-sm text-slate-500">لا يوجد منشورات لهذا المستخدم حالياً.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700"
              >
                <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{post.body}</p>
                <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-800/60 pt-3">
                  <button
                    onClick={() => handleEditClick(post)}
                    className="text-xs font-semibold text-indigo-400 hover:underline"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs font-semibold text-red-400 hover:underline"
                  >
                    حذف مع التعليقات
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
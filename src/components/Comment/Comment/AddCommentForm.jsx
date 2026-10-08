import React, { useState } from 'react';

const AddCommentForm = ({ postId, onCommentAdded, currentUser }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  console.log('currentUser in AddCommentForm:', currentUser);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      const newComment = {
        postId: postId,
        name: currentUser ? currentUser.name : 'زائر',
        email: currentUser ? currentUser.email : 'guest@example.com',
        body: text,
      };
      await onCommentAdded(newComment);
      setText('');
    } catch (err) {
      alert('حدث خطأ أثناء إضافة التعليق');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text"
        placeholder={currentUser ? `أضف تعليقاً باسم ${currentUser.name}...` : 'أضف تعليقاً...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
      >
        {loading ? 'جاري الإرسال...' : 'تعليق'}
      </button>
    </form>
  );
};

export default AddCommentForm;
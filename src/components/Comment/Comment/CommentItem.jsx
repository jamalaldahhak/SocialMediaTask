import React, { useState } from 'react';

const CommentItem = ({ comment, currentUser, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(comment.body);
  const [loading, setLoading] = useState(false);

  // التحقق مما إذا كان التعليق يخص المستخدم الحالي (عن طريق البريد الإلكتروني أو ID)
  const isOwner = currentUser && comment.email === currentUser.email;

  const handleUpdate = async () => {
    if (!editedBody.trim()) return;
    try {
      setLoading(true);
      await onUpdate(comment.id, editedBody);
      setIsEditing(false);
    } catch (err) {
      console.error('فشل في تعديل التعليق:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت تأكد من رغبتك في حذف هذا التعليق؟')) {
      try {
        setLoading(true);
        await onDelete(comment.id);
      } catch (err) {
        console.error('فشل في حذف التعليق:', err);
        setLoading(false);
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs relative group">
      <div className="flex items-center justify-between font-semibold text-indigo-400 mb-1">
        <span>{comment.email}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">#{comment.id}</span>
          
          {/* أزرار التحكم تظهر فقط لصاحب التعليق */}
          {isOwner && !isEditing && (
            <div className="flex gap-1.5 ms-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] text-amber-400 hover:underline"
              >
                تعديل
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-[10px] text-rose-400 hover:underline disabled:opacity-50"
              >
                حذف
              </button>
            </div>
          )}
        </div>
      </div>

      {/* وضع التعديل مقابل وضع العرض */}
      {isEditing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            rows="2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 rounded text-[10px] text-slate-400 hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading || !editedBody.trim()}
              className="px-2 py-1 rounded text-[10px] bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
          {comment.body}
        </p>
      )}
    </div>
  );
};

export default CommentItem;
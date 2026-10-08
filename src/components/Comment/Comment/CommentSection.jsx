import React, { useState } from 'react';
import CommentItem from './CommentItem';
import AddCommentForm from './AddCommentForm';
import { 
  getCommentsByPostId, 
  createComment, 
  deleteComment, 
  updateComment 
} from '../../../services/api'; // التأكد من وجود هذه الدوال في الـ API service
import { useUser } from '../../../context/UserContext'; // عدل المسار بحسب هيكلة مشروعك

const CommentSection = ({ postId }) => {
  const { selectedUser } = useUser(); // جلب المستخدم المختار حالياً
  const [comments, setComments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleComments = async () => {
    if (!isOpen && comments.length === 0) {
      try {
        setLoading(true);
        const data = await getCommentsByPostId(postId);
        setComments(data);
      } catch (err) {
        console.error('خطأ أثناء جلب التعليقات:', err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleAddComment = async (commentData) => {
    const created = await createComment(commentData);
    setComments((prev) => [...prev, created]);
  };

  // دالة حذف التعليق
  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  // دالة تعديل التعليق
  const handleUpdateComment = async (commentId, newBody) => {
    const updated = await updateComment(commentId, { body: newBody });
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, body: updated.body || newBody } : c))
    );
  };

  return (
    <div className="mt-4 border-t border-slate-800/60 pt-3">
      <button
        onClick={toggleComments}
        className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
      >
        💬 {isOpen ? 'إخفاء التعليقات' : 'عرض التعليقات / إضافة تعليق'}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500">جاري تحميل التعليقات...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-500">لا يوجد تعليقات بعد.</p>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={selectedUser}
                  onDelete={handleDeleteComment}
                  onUpdate={handleUpdateComment}
                />
              ))}
            </div>
          )}

          <AddCommentForm
            postId={postId}
            currentUser={selectedUser}
            onCommentAdded={handleAddComment}
          />
        </div>
      )}
    </div>
  );
};

export default CommentSection;
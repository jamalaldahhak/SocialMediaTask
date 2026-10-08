import React from 'react';
import CommentSection from '../Comment/Comment/CommentSection';

const PostCard = ({ post, author, currentUser }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700 shadow-lg">
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-sm">
          {author ? author.name.charAt(0) : 'U'}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">{author ? author.name : 'مستخدم غير معروف'}</h4>
          <p className="text-[11px] text-slate-400">@{author ? author.username : 'user'}</p>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-base font-bold text-slate-100">{post.title}</h3>
      <p className="mt-2 text-xs text-slate-300 leading-relaxed">{post.body}</p>

      {/* Comments Area */}
      <CommentSection postId={post.id} currentUser={currentUser} />
    </div>
  );
};

export default PostCard;
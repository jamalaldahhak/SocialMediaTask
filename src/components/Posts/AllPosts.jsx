import React, { useEffect, useState } from 'react';
import { getAllPosts, getAllUsers } from '../../services/api';
import { useUser } from '../../context/UserContext';
import PostCard from './PostCard';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { selectedUser } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, usersData] = await Promise.all([getAllPosts(), getAllUsers()]);

        // تحويل مصفوفة المستخدمين إلى Object لسهولة البحث بالـ ID
        const map = {};
        usersData.forEach((u) => {
          map[u.id] = u;
        });

        setUsersMap(map);
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 antialiased">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white">جميع المنشورات</h1>
          <p className="text-xs text-slate-400 mt-1">
            {selectedUser
              ? `أنت متصفح حالياً باسم: ${selectedUser.name}`
              : 'لم تقم باختيار مستخدم بعد (سيتم التعليق كـ زائر)'}
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={usersMap[post.userId]}
              currentUser={selectedUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPosts;